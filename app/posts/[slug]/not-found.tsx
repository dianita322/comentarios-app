import Link from "next/link";

import AppContainer from "@/components/layout/app-container";
import EmptyState from "@/components/shared/empty-state";

export default function NotFound() {
  return (
    <AppContainer className="space-y-8">
      <EmptyState
        title="No encontramos esa publicación"
        description="Puede que la URL esté mal escrita o que la publicación todavía no esté publicada."
        ctaLabel="Volver a publicaciones"
        ctaHref="/posts"
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