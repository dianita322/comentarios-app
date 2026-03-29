import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { deleteProjectAction } from "@/app/projects/manage/actions";
import { updateProjectAction } from "@/app/projects/manage/[id]/edit/actions";
import DeleteProjectButton from "@/components/projects/delete-project-button";
import ProjectEditorForm from "@/components/projects/project-editor-form";
import AppContainer from "@/components/layout/app-container";
import AppPageHeader from "@/components/layout/app-page-header";
import { isAdminEmail } from "@/lib/admin";
import type { ProjectRow } from "@/lib/projects/types";
import { createClient } from "@/lib/supabase/server";

type EditProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditProjectPage({
  params,
  searchParams,
}: EditProjectPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const projectId = Number(resolvedParams.id);

  if (Number.isNaN(projectId)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/projects");
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
    console.error("Error cargando proyecto para editar:", projectError);
  }

  if (!projectData) {
    notFound();
  }

  const project = projectData as ProjectRow;
  const errorMessage = resolvedSearchParams?.error
    ? decodeURIComponent(resolvedSearchParams.error)
    : null;

  return (
    <AppContainer className="space-y-8">
      <AppPageHeader
        eyebrow="Panel de proyectos"
        title="Editar proyecto"
        description="Aquí puedes actualizar el título, slug, categoría, descripción, enlaces, portada y estado del proyecto."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects/manage"
              className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Volver a mis proyectos
            </Link>

            {project.status === "published" ? (
              <Link
                href={`/projects/${project.slug}`}
                className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                Ver proyecto
              </Link>
            ) : null}
          </div>
        }
      />

      {errorMessage ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <ProjectEditorForm
          action={updateProjectAction}
          userId={user.id}
          initialData={{
            id: project.id,
            title: project.title,
            slug: project.slug,
            summary: project.summary,
            description: project.description,
            coverImageUrl: project.cover_image_url,
            demoUrl: project.demo_url,
            repoUrl: project.repo_url,
            techStack: project.tech_stack,
            category: project.category,
            status: project.status,
          }}
          submitLabel="Guardar cambios"
          pendingLabel="Actualizando..."
        />
      </section>

      <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="text-lg font-semibold text-red-200">Zona de peligro</h2>
        <p className="mt-2 text-sm text-red-100/80">
          Si eliminas este proyecto, desaparecerá del panel y del listado público.
        </p>

        <div className="mt-4">
          <DeleteProjectButton
            projectId={project.id}
            action={deleteProjectAction}
          />
        </div>
      </section>
    </AppContainer>
  );
}