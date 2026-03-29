"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/admin";
import { isValidProjectCategory } from "@/lib/projects/categories";
import { slugifyPostTitle } from "@/lib/posts/slug";
import { createClient } from "@/lib/supabase/server";

function redirectWithError(message: string) {
  redirect(`/projects/new?error=${encodeURIComponent(message)}`);
}

function validateOptionalUrl(raw: string, message: string) {
  if (!raw) return;

  try {
    new URL(raw);
  } catch {
    redirectWithError(message);
  }
}

export async function createProjectAction(formData: FormData) {
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

  if (!isAdminEmail(user.email)) {
    redirect("/projects");
  }

  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const coverImageUrlRaw = String(formData.get("cover_image_url") ?? "").trim();
  const demoUrlRaw = String(formData.get("demo_url") ?? "").trim();
  const repoUrlRaw = String(formData.get("repo_url") ?? "").trim();
  const techStack = String(formData.get("tech_stack") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "general").trim();
  const statusRaw = String(formData.get("status") ?? "draft").trim();

  const slug = slugifyPostTitle(rawSlug || title);
  const category = isValidProjectCategory(categoryRaw) ? categoryRaw : "general";
  const status = statusRaw === "published" ? "published" : "draft";

  if (title.length < 4) {
    redirectWithError("El título debe tener al menos 4 caracteres.");
  }

  if (!slug) {
    redirectWithError("No se pudo generar un slug válido. Revisa el título.");
  }

  if (description.length < 20) {
    redirectWithError("La descripción debe tener al menos 20 caracteres.");
  }

  validateOptionalUrl(coverImageUrlRaw, "La URL de la portada no es válida.");
  validateOptionalUrl(demoUrlRaw, "La URL de la demo no es válida.");
  validateOptionalUrl(repoUrlRaw, "La URL del repositorio no es válida.");

  const { data: existingProject, error: existingProjectError } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingProjectError) {
    console.error("Error comprobando slug existente:", existingProjectError);
    redirectWithError("No se pudo validar el slug. Inténtalo de nuevo.");
  }

  if (existingProject) {
    redirectWithError("Ese slug ya existe. Cámbialo para continuar.");
  }

  const { error: insertError } = await supabase.from("projects").insert({
    author_id: user.id,
    title,
    slug,
    summary: summary || null,
    description,
    cover_image_url: coverImageUrlRaw || null,
    demo_url: demoUrlRaw || null,
    repo_url: repoUrlRaw || null,
    tech_stack: techStack || null,
    category,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  });

  if (insertError) {
    console.error("Error insertando proyecto:", insertError);
    redirectWithError(`Supabase devolvió este error: ${insertError.message}`);
  }

  revalidatePath("/projects");
  revalidatePath("/projects/manage");
  revalidatePath(`/projects/${slug}`);

  redirect("/projects/manage?success=created");
}