import { notFound } from "next/navigation";

import { getProjectCategoryLabel } from "@/lib/projects/categories";
import type { ProjectAuthorProfile, ProjectRow } from "@/lib/projects/types";
import { formatProjectDate, parseProjectTechStack } from "@/lib/projects/utils";
import AppContainer from "@/components/layout/app-container";
import PostContent from "@/components/posts/post-content";
import { createClient } from "@/lib/supabase/server";

type ProjectDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select(
      "id, author_id, title, slug, summary, description, cover_image_url, demo_url, repo_url, tech_stack, category, status, published_at, created_at, updated_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (projectError) {
    console.error("Error cargando proyecto:", projectError);
  }

  if (!projectData) {
    notFound();
  }

  const project = projectData as ProjectRow;
  const techStack = parseProjectTechStack(project.tech_stack);
  let authorName: string | null = null;

  if (project.author_id) {
    const { data: authorData, error: authorError } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .eq("id", project.author_id)
      .maybeSingle();

    if (authorError) {
      console.error("Error cargando autor del proyecto:", authorError);
    } else if (authorData) {
      const author = authorData as ProjectAuthorProfile;
      authorName = author.display_name || author.username || null;
    }
  }

  return (
    <AppContainer className="space-y-8">
      <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {project.cover_image_url ? (
          <div className="aspect-[16/7] w-full overflow-hidden bg-black/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/50">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/70">
              {getProjectCategoryLabel(project.category)}
            </span>
            <span>{formatProjectDate(project.published_at ?? project.created_at)}</span>
            {authorName ? (
              <>
                <span>•</span>
                <span>{authorName}</span>
              </>
            ) : null}
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            {project.title}
          </h1>

          {project.summary ? (
            <p className="mt-4 text-base text-white/70 md:text-lg">
              {project.summary}
            </p>
          ) : null}

          {(project.demo_url || project.repo_url) ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {project.demo_url ? (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
                >
                  Ver demo
                </a>
              ) : null}

              {project.repo_url ? (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Ver repositorio
                </a>
              ) : null}
            </div>
          ) : null}

          {techStack.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
                Tecnologías
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {techStack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
              Descripción
            </h2>

            <div className="mt-4">
              <PostContent content={project.description} />
            </div>
          </section>
        </div>
      </article>
    </AppContainer>
  );
}