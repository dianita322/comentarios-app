import Link from "next/link";

import {
  getProjectCategoryLabel,
  projectCategoryOptions,
} from "@/lib/projects/categories";
import type { ProjectCategory } from "@/lib/projects/types";

type ProjectCategoryFilterProps = {
  currentCategory: ProjectCategory | null;
};

function pillClass(active: boolean) {
  return active
    ? "rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
    : "rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white";
}

export default function ProjectCategoryFilter({
  currentCategory,
}: ProjectCategoryFilterProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div>
        <h2 className="text-sm font-semibold">Filtrar proyectos</h2>
        <p className="mt-1 text-xs text-white/55">
          {currentCategory
            ? `Mostrando solo proyectos de la categoría ${getProjectCategoryLabel(
                currentCategory,
              )}.`
            : "Mostrando proyectos de todas las categorías."}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/projects" className={pillClass(currentCategory === null)}>
          Todos
        </Link>

        {projectCategoryOptions.map((option) => (
          <Link
            key={option.value}
            href={`/projects?category=${option.value}`}
            className={pillClass(currentCategory === option.value)}
            title={option.description}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </section>
  );
}