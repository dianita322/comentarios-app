"use server";

import { redirect } from "next/navigation";

import { slugifyPostTitle } from "@/lib/posts/slug";
import { createClient } from "@/lib/supabase/server";

function encodeError(message: string) {
  return encodeURIComponent(message);
}

export async function createPostAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    redirect(
      `/posts/new?error=${encodeError("El título debe tener al menos 4 caracteres.")}`,
    );
  }

  if (!slug) {
    redirect(
      `/posts/new?error=${encodeError("No se pudo generar un slug válido. Revisa el título.")}`,
    );
  }

  if (content.length < 20) {
    redirect(
      `/posts/new?error=${encodeError("El contenido debe tener al menos 20 caracteres.")}`,
    );
  }

  const { data: existingPost } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingPost) {
    redirect(
      `/posts/new?error=${encodeError("Ese slug ya existe. Cámbialo para continuar.")}`,
    );
  }

  const { error } = await supabase.from("posts").insert({
    author_id: user.id,
    title,
    slug,
    excerpt: excerpt || null,
    content,
    cover_image_url,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  });

  if (error) {
    redirect(`/posts/new?error=${encodeError(error.message)}`);
  }

  redirect("/posts/manage?success=created");
}