"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { slugifyPostTitle } from "@/lib/posts/slug";
import { createClient } from "@/lib/supabase/server";

function redirectWithError(message: string) {
  redirect(`/posts/new?error=${encodeURIComponent(message)}`);
}

export async function createPostAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error obteniendo el usuario autenticado:", userError);
    redirectWithError("No se pudo validar tu sesión. Vuelve a iniciar sesión.");
  }

  if (!user) {
    redirect("/auth/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const coverImageUrlRaw = String(formData.get("cover_image_url") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "draft").trim();

  const slug = slugifyPostTitle(rawSlug || title);
  const status = statusRaw === "published" ? "published" : "draft";
  const cover_image_url = coverImageUrlRaw || null;

  if (title.length < 4) {
    redirectWithError("El título debe tener al menos 4 caracteres.");
  }

  if (!slug) {
    redirectWithError("No se pudo generar un slug válido. Revisa el título.");
  }

  if (content.length < 20) {
    redirectWithError("El contenido debe tener al menos 20 caracteres.");
  }

  if (coverImageUrlRaw) {
    try {
      new URL(coverImageUrlRaw);
    } catch {
      redirectWithError("La URL de la portada no es válida.");
    }
  }

  const { data: existingPost, error: existingPostError } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingPostError) {
    console.error("Error comprobando slug existente:", existingPostError);
    redirectWithError("No se pudo validar el slug. Inténtalo de nuevo.");
  }

  if (existingPost) {
    redirectWithError("Ese slug ya existe. Cámbialo para continuar.");
  }

  const { error: insertError } = await supabase.from("posts").insert({
    author_id: user.id,
    title,
    slug,
    excerpt: excerpt || null,
    content,
    cover_image_url,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  });

  if (insertError) {
    console.error("Error insertando publicación:", insertError);

    const message = insertError.message.toLowerCase();

    if (message.includes("row-level security")) {
      redirectWithError(
        "Supabase rechazó la inserción por permisos (RLS). Revisa las políticas de la tabla posts.",
      );
    }

    if (message.includes("duplicate key")) {
      redirectWithError("Ese slug ya existe. Usa otro diferente.");
    }

    redirectWithError(`Supabase devolvió este error: ${insertError.message}`);
  }

  revalidatePath("/posts");
  revalidatePath("/posts/manage");
  revalidatePath(`/posts/${slug}`);

  redirect("/posts/manage?success=created");
}