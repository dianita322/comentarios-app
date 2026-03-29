import { notFound } from "next/navigation";

import AppContainer from "@/components/layout/app-container";
import AppPageHeader from "@/components/layout/app-page-header";
import { getToolBySlug } from "@/lib/tools/data";

type ToolDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ToolDetailPage({
  params,
}: ToolDetailPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  return (
    <AppContainer className="space-y-8">
      <AppPageHeader
        eyebrow="Herramienta"
        title={tool.title}
        description={tool.description}
      />

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-white/60">
            Si tu HTML usa archivos CSS, JS o imágenes adicionales, colócalos
            dentro de la misma carpeta pública de la herramienta.
          </p>

          <a
            href={tool.launchPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
          >
            Abrir en pestaña nueva
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
          <iframe
            src={tool.launchPath}
            title={tool.title}
            className="h-[85vh] w-full"
          />
        </div>
      </section>
    </AppContainer>
  );
}
