import Link from "next/link";

import { getProjectCategoryLabel } from "@/lib/projects/categories";
import type { ProjectRow } from "@/lib/projects/types";
import { formatProjectDate, getProjectSummary } from "@/lib/projects/utils";

type ProjectCardProps = {
  project: ProjectRow;
  authorName?: string;
};

export default function ProjectCard({
  project,
  authorName,
}: ProjectCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      {project.cover_image_url ? (
        <div className="aspect-[16/8] w-full overflow-hidden bg-black/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/70">
            {getProjectCategoryLabel(project.category)}
          </span>
          <span>{formatProjectDate(project.published_at ?? project.created_at)}</span>
          {authorName ? <span>• Por {authorName}</span> : null}
        </div>

        <h2 className="mt-3 text-xl font-semibold leading-tight">
          <Link href={`/projects/${project.slug}`} className="hover:underline">
            {project.title}
          </Link>
        </h2>

        <p className="mt-3 text-sm text-white/70">
          {getProjectSummary(project.summary, project.description)}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Ver proyecto
          </Link>

          {project.demo_url ? (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Demo
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}