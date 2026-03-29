import Link from "next/link";

import type { ToolItem } from "@/lib/tools/types";

type ToolCardProps = {
  tool: ToolItem;
};

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      {tool.coverImageUrl ? (
        <div className="aspect-[16/8] w-full overflow-hidden bg-black/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tool.coverImageUrl}
            alt={tool.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/70">
            Herramienta
          </span>
        </div>

        <h2 className="mt-3 text-xl font-semibold leading-tight">
          <Link href={`/tools/${tool.slug}`} className="hover:underline">
            {tool.title}
          </Link>
        </h2>

        <p className="mt-3 text-sm text-white/70">{tool.summary}</p>

        <div className="mt-4">
          <Link
            href={`/tools/${tool.slug}`}
            className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Abrir herramienta
          </Link>
        </div>
      </div>
    </article>
  );
}
