import Link from "next/link";
import { redirect } from "next/navigation";

import AppContainer from "@/components/layout/app-container";
import AppPageHeader from "@/components/layout/app-page-header";
import PostEditorForm from "@/components/posts/post-editor-form";
import { createPostAction } from "@/app/posts/new/actions";
import { createClient } from "@/lib/supabase/server";

type NewPostPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function NewPostPage({ searchParams }: NewPostPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : null;

  return (
    <AppContainer className="space-y-8">
      <AppPageHeader
        eyebrow="Panel de autor"
        title="Nueva publicación"
        description="Desde aquí ya puedes crear publicaciones reales dentro de tu web. Hoy quedará funcional el flujo básico de creación."
        actions={
          <Link
            href="/posts/manage"
            className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Ver mis publicaciones
          </Link>
        }
      />

      {errorMessage ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <PostEditorForm action={createPostAction} />
      </section>
    </AppContainer>
  );
}