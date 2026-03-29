import Link from "next/link";

import AppContainer from "@/components/layout/app-container";
import EmptyState from "@/components/shared/empty-state";

export default function NotFound() {
  return (
    <AppContainer className="space-y-8">
      <EmptyState
        title="No encontramos ese proyecto"
        description="Puede que la URL esté mal escrita o que el proyecto todavía no esté publicado."
        ctaLabel="Volver a proyectos"
        ctaHref="/projects"
      />

      <div className="text-center">
        <Link
          href="/"
          className="text-sm text-white/70 underline underline-offset-4"
        >
          Volver al inicio
        </Link>
      </div>
    </AppContainer>
  );
}