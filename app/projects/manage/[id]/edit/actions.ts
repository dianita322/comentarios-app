"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/admin";
import { isValidProjectCategory } from "@/lib/projects/categories";
import { getProjectCoverPathFromPublicUrl } from "@/lib/projects/storage";
import type { ProjectRow } from "@/lib/projects/types";
import { slugifyPostTitle } from "@/lib/posts/slug";
import { createClient } from "@/lib/supabase/server";

function buildErrorRedirect(projectId: number, message: string) {
  return `/projects/manage/${projectId}/edit?error=${encodeURIComponent(message)}`;
}

function validateOptionalUrl(raw: string, projectId: number, message: string) {
  if (!raw) return;

  try {
    new URL(raw);
  } catch {
    redirect(buildErrorRedirect(projectId, message));
  }
}

export async function updateProjectAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error obteniendo el usuario autenticado:", userError);
    redirect("/auth/login");
  }

  if (!user) {
    redirect("/auth/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/projects");
  }

  const projectIdRaw = String(formData.get("project_id") ?? "").trim();
  const projectId = Number(projectIdRaw);

  if (!projectIdRaw || Number.isNaN(projectId)) {
    redirect("/projects/manage");
  }

  const { data: existingProjectData, error: existingProjectError } = await supabase
    .from("projects")
    .select(
      "id, author_id, title, slug, summary, description, cover_image_url, demo_url, repo_url, tech_stack, category, status, published_at, created_at, updated_at",
    )
    .eq("id", projectId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (existingProjectError) {
    console.error("Error cargando proyecto a editar:", existingProjectError);
    redirect(buildErrorRedirect(projectId, "No se pudo cargar el proyecto."));
  }

  if (!existingProjectData) {
    redirect("/projects/manage");
  }

  const existingProject = existingProjectData as ProjectRow;

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
    redirect(buildErrorRedirect(projectId, "El título debe tener al menos 4 caracteres."));
  }

  if (!slug) {
    redirect(buildErrorRedirect(projectId, "No se pudo generar un slug válido. Revisa el título."));
  }

  if (description.length < 20) {
    redirect(buildErrorRedirect(projectId, "La descripción debe tener al menos 20 caracteres."));
  }

  validateOptionalUrl(coverImageUrlRaw, projectId, "La URL de la portada no es válida.");
  validateOptionalUrl(demoUrlRaw, projectId, "La URL de la demo no es válida.");
  validateOptionalUrl(repoUrlRaw, projectId, "La URL del repositorio no es válida.");

  const { data: repeatedSlugProject, error: repeatedSlugError } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", slug)
    .neq("id", projectId)
    .maybeSingle();

  if (repeatedSlugError) {
    console.error("Error comprobando slug repetido:", repeatedSlugError);
    redirect(buildErrorRedirect(projectId, "No se pudo validar el slug. Inténtalo de nuevo."));
  }

  if (repeatedSlugProject) {
    redirect(buildErrorRedirect(projectId, "Ese slug ya existe. Usa uno diferente."));
  }

  const oldCoverPath = getProjectCoverPathFromPublicUrl(
    existingProject.cover_image_url,
    user.id,
  );
  const newCoverPath = getProjectCoverPathFromPublicUrl(
    coverImageUrlRaw || null,
    user.id,
  );

  const published_at =
    status === "published"
      ? existingProject.published_at ?? new Date().toISOString()
      : null;

  const { error: updateError } = await supabase
    .from("projects")
    .update({
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
      published_at,
    })
    .eq("id", projectId)
    .eq("author_id", user.id);

  if (updateError) {
    console.error("Error actualizando proyecto:", updateError);
    redirect(
      buildErrorRedirect(
        projectId,
        `Supabase devolvió este error: ${updateError.message}`,
      ),
    );
  }

  if (oldCoverPath && oldCoverPath !== newCoverPath) {
    const { error: deleteOldCoverError } = await supabase.storage
      .from("project-covers")
      .remove([oldCoverPath]);

    if (deleteOldCoverError) {
      console.error(
        "No se pudo eliminar la portada antigua del proyecto:",
        deleteOldCoverError,
      );
    }
  }

  revalidatePath("/projects");
  revalidatePath("/projects/manage");
  revalidatePath(`/projects/${existingProject.slug}`);
  revalidatePath(`/projects/${slug}`);

  redirect("/projects/manage?success=updated");
}