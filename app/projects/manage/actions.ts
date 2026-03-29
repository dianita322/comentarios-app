"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/admin";
import { getProjectCoverPathFromPublicUrl } from "@/lib/projects/storage";
import type { ProjectRow } from "@/lib/projects/types";
import { createClient } from "@/lib/supabase/server";

function redirectDeleteError(message: string) {
  redirect(`/projects/manage?error=${encodeURIComponent(message)}`);
}

export async function deleteProjectAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/projects");
  }

  const projectIdRaw = String(formData.get("project_id") ?? "").trim();
  const projectId = Number(projectIdRaw);

  if (!projectIdRaw || Number.isNaN(projectId)) {
    redirectDeleteError(
      "No se recibió un identificador válido para eliminar el proyecto.",
    );
  }

  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select(
      "id, author_id, title, slug, summary, description, cover_image_url, demo_url, repo_url, tech_stack, category, status, published_at, created_at, updated_at",
    )
    .eq("id", projectId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (projectError) {
    console.error("Error cargando proyecto para eliminar:", projectError);
    redirectDeleteError("No se pudo cargar el proyecto que quieres eliminar.");
  }

  if (!projectData) {
    redirectDeleteError("No encontramos ese proyecto o no te pertenece.");
  }

  const project = projectData as ProjectRow;
  const coverPath = getProjectCoverPathFromPublicUrl(project.cover_image_url, user.id);

  const { error: deleteRowError } = await supabase
    .from("projects")
    .delete()
    .eq("id", project.id)
    .eq("author_id", user.id);

  if (deleteRowError) {
    console.error("Error eliminando proyecto:", deleteRowError);
    redirectDeleteError(
      `Supabase devolvió este error: ${deleteRowError.message}`,
    );
  }

  if (coverPath) {
    const { error: deleteCoverError } = await supabase.storage
      .from("project-covers")
      .remove([coverPath]);

    if (deleteCoverError) {
      console.error(
        "No se pudo eliminar la portada del proyecto del bucket:",
        deleteCoverError,
      );
    }
  }

  revalidatePath("/projects");
  revalidatePath("/projects/manage");
  revalidatePath(`/projects/${project.slug}`);

  redirect("/projects/manage?success=deleted");
}