import Link from "next/link";

import AppContainer from "@/components/layout/app-container";
import EmptyState from "@/components/shared/empty-state";

export default function NotFound() {
  return (
    <AppContainer className="space-y-8">
      <EmptyState
        title="No encontramos esa publicación"
        description="Puede que no exista, que no sea tuya o que el identificador sea incorrecto."
        ctaLabel="Volver a mis publicaciones"
        ctaHref="/posts/manage"
      />

      <div className="text-center">
        <Link
          href="/posts"
          className="text-sm text-white/70 underline underline-offset-4"
        >
          Ir a publicaciones públicas
        </Link>
      </div>
    </AppContainer>
  );
}