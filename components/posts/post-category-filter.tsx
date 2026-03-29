import Link from "next/link";

import {
  getPostCategoryLabel,
  postCategoryOptions,
} from "@/lib/posts/categories";
import type { PostCategory } from "@/lib/posts/types";

type PostCategoryFilterProps = {
  currentCategory: PostCategory | null;
};

function pillClass(active: boolean) {
  return active
    ? "rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
    : "rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white";
}

export default function PostCategoryFilter({
  currentCategory,
}: PostCategoryFilterProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div>
        <h2 className="text-sm font-semibold">Filtrar por categoría</h2>
        <p className="mt-1 text-xs text-white/55">
          {currentCategory
            ? `Mostrando solo publicaciones de la categoría ${getPostCategoryLabel(
                currentCategory,
              )}.`
            : "Mostrando publicaciones de todas las categorías."}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/posts" className={pillClass(currentCategory === null)}>
          Todas
        </Link>

        {postCategoryOptions.map((option) => (
          <Link
            key={option.value}
            href={`/posts?category=${option.value}`}
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