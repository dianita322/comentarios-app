import Link from "next/link";

import ProjectCategoryFilter from "@/components/projects/project-category-filter";
import ProjectCard from "@/components/projects/project-card";
import AppContainer from "@/components/layout/app-container";
import AppPageHeader from "@/components/layout/app-page-header";
import EmptyState from "@/components/shared/empty-state";
import { isAdminEmail } from "@/lib/admin";
import { isValidProjectCategory } from "@/lib/projects/categories";
import type {
  ProjectAuthorProfile,
  ProjectCategory,
  ProjectRow,
} from "@/lib/projects/types";
import { createClient } from "@/lib/supabase/server";

type ProjectsPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = isAdminEmail(user?.email);

  const rawCategory = params?.category?.trim() ?? "";
  const currentCategory: ProjectCategory | null = isValidProjectCategory(
    rawCategory,
  )
    ? rawCategory
    : null;

  let projectsQuery = supabase
    .from("projects")
    .select(
      "id, author_id, title, slug, summary, description, cover_image_url, demo_url, repo_url, tech_stack, category, status, published_at, created_at, updated_at",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (currentCategory) {
    projectsQuery = projectsQuery.eq("category", currentCategory);
  }

  const { data: projectsData, error: projectsError } = await projectsQuery;

  if (projectsError) {
    console.error("Error cargando proyectos:", projectsError);
  }

  const projects = (projectsData ?? []) as ProjectRow[];

  const authorIds = [
    ...new Set(projects.map((project) => project.author_id).filter(Boolean)),
  ] as string[];

  let authorById: Record<string, ProjectAuthorProfile> = {};

  if (authorIds.length > 0) {
    const { data: authorsData, error: authorsError } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .in("id", authorIds);

    if (authorsError) {
      console.error("Error cargando autores de proyectos:", authorsError);
    } else {
      authorById = Object.fromEntries(
        ((authorsData ?? []) as ProjectAuthorProfile[]).map((author) => [
          author.id,
          author,
        ]),
      );
    }
  }

  return (
    <AppContainer className="space-y-8">
      <AppPageHeader
        eyebrow="Portafolio"
        title="Proyectos"
        description="Aquí aparecen tus proyectos publicados. Solo el administrador puede agregarlos, editarlos o eliminarlos."
        actions={
          isAdmin ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href="/projects/manage"
                className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Mis proyectos
              </Link>
              <Link
                href="/projects/new"
                className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                Nuevo proyecto
              </Link>
            </div>
          ) : null
        }
      />

      <ProjectCategoryFilter currentCategory={currentCategory} />

      {projects.length === 0 ? (
        <EmptyState
          title={
            currentCategory
              ? "No hay proyectos en esta categoría"
              : "Todavía no hay proyectos publicados"
          }
          description={
            currentCategory
              ? "Prueba otra categoría o vuelve más tarde."
              : "Cuando se publique el primer proyecto, aparecerá aquí."
          }
        />
      ) : (
        <section className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => {
            const author = project.author_id
              ? authorById[project.author_id]
              : undefined;
            const authorName =
              author?.display_name || author?.username || undefined;

            return (
              <ProjectCard
                key={project.id}
                project={project}
                authorName={authorName}
              />
            );
          })}
        </section>
      )}
    </AppContainer>
  );
}