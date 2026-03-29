import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteProjectAction } from "@/app/projects/manage/actions";
import DeleteProjectButton from "@/components/projects/delete-project-button";
import AppContainer from "@/components/layout/app-container";
import AppPageHeader from "@/components/layout/app-page-header";
import EmptyState from "@/components/shared/empty-state";
import { isAdminEmail } from "@/lib/admin";
import { getProjectCategoryLabel } from "@/lib/projects/categories";
import type { ProjectRow } from "@/lib/projects/types";
import { formatProjectDate } from "@/lib/projects/utils";
import { createClient } from "@/lib/supabase/server";

type ManageProjectsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function ManageProjectsPage({
  searchParams,
}: ManageProjectsPageProps) {
  const params = await searchParams;
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

  const { data: projectsData, error: projectsError } = await supabase
    .from("projects")
    .select(
      "id, author_id, title, slug, summary, description, cover_image_url, demo_url, repo_url, tech_stack, category, status, published_at, created_at, updated_at",
    )
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (projectsError) {
    console.error("Error cargando proyectos del autor:", projectsError);
  }

  const projects = (projectsData ?? []) as ProjectRow[];
  const successType = params?.success;
  const errorMessage = params?.error ? decodeURIComponent(params.error) : null;

  return (
    <AppContainer className="space-y-8">
      <AppPageHeader
        eyebrow="Panel de proyectos"
        title="Mis proyectos"
        description="Aquí verás tus proyectos en borrador y los que ya están visibles públicamente."
        actions={
          <Link
            href="/projects/new"
            className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
          >
            Crear nuevo proyecto
          </Link>
        }
      />

      {successType === "created" ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          El proyecto se guardó correctamente.
        </div>
      ) : null}

      {successType === "updated" ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          El proyecto se actualizó correctamente.
        </div>
      ) : null}

      {successType === "deleted" ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          El proyecto se eliminó correctamente.
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      {projects.length === 0 ? (
        <EmptyState
          title="Todavía no has creado proyectos"
          description="Empieza registrando tu primer proyecto desde el panel."
          ctaLabel="Crear proyecto"
          ctaHref="/projects/new"
        />
      ) : (
        <section className="grid gap-5">
          {projects.map((project) => {
            const isPublished = project.status === "published";

            return (
              <article
                key={project.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                {project.cover_image_url ? (
                  <div className="h-44 w-full overflow-hidden bg-black/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.cover_image_url}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}

                <div className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/50">
                        <span>{isPublished ? "Publicado" : "Borrador"}</span>
                        <span>•</span>
                        <span>{getProjectCategoryLabel(project.category)}</span>
                        <span>•</span>
                        <span>
                          {isPublished
                            ? formatProjectDate(
                                project.published_at ?? project.created_at,
                              )
                            : `Creado el ${formatProjectDate(project.created_at)}`}
                        </span>
                      </div>

                      <h2 className="mt-3 text-xl font-semibold">
                        {project.title}
                      </h2>

                      <p className="mt-2 break-all text-sm text-white/50">
                        /projects/{project.slug}
                      </p>

                      <p className="mt-3 text-sm text-white/70">
                        {project.summary?.trim() || "Sin resumen corto."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/projects/manage/${project.id}/edit`}
                        className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
                      >
                        Editar
                      </Link>

                      {isPublished ? (
                        <Link
                          href={`/projects/${project.slug}`}
                          className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                        >
                          Ver proyecto
                        </Link>
                      ) : null}

                      <DeleteProjectButton
                        projectId={project.id}
                        action={deleteProjectAction}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </AppContainer>
  );
}