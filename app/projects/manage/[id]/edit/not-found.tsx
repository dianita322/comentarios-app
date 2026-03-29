import Link from "next/link";

import AppContainer from "@/components/layout/app-container";
import EmptyState from "@/components/shared/empty-state";

export default function NotFound() {
  return (
    <AppContainer className="space-y-8">
      <EmptyState
        title="No encontramos ese proyecto"
        description="Puede que no exista, que no sea tuyo o que el identificador sea incorrecto."
        ctaLabel="Volver a mis proyectos"
        ctaHref="/projects/manage"
      />

      <div className="text-center">
        <Link
          href="/projects"
          className="text-sm text-white/70 underline underline-offset-4"
        >
          Ir a proyectos públicos
        </Link>
      </div>
    </AppContainer>
  );
}