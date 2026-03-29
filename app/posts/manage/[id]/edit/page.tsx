import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updatePostAction } from "@/app/posts/manage/[id]/edit/actions";
import AppContainer from "@/components/layout/app-container";
import AppPageHeader from "@/components/layout/app-page-header";
import PostEditorForm from "@/components/posts/post-editor-form";
import type { PostRow } from "@/lib/posts/types";
import { createClient } from "@/lib/supabase/server";

type EditPostPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditPostPage({
  params,
  searchParams,
}: EditPostPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const postId = Number(resolvedParams.id);

  if (Number.isNaN(postId)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: postData, error: postError } = await supabase
    .from("posts")
    .select(
      "id, author_id, title, slug, excerpt, content, cover_image_url, status, published_at, created_at, updated_at",
    )
    .eq("id", postId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (postError) {
    console.error("Error cargando publicación para editar:", postError);
  }

  if (!postData) {
    notFound();
  }

  const post = postData as PostRow;
  const errorMessage = resolvedSearchParams?.error
    ? decodeURIComponent(resolvedSearchParams.error)
    : null;

  return (
    <AppContainer className="space-y-8">
      <AppPageHeader
        eyebrow="Panel de autor"
        title="Editar publicación"
        description="Aquí puedes actualizar el título, slug, contenido, estado y portada de una publicación existente."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/posts/manage"
              className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Volver a mis publicaciones
            </Link>

            {post.status === "published" ? (
              <Link
                href={`/posts/${post.slug}`}
                className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                Ver publicación
              </Link>
            ) : null}
          </div>
        }
      />

      {errorMessage ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <PostEditorForm
          action={updatePostAction}
          userId={user.id}
          initialData={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImageUrl: post.cover_image_url,
            status: post.status,
          }}
          submitLabel="Guardar cambios"
          pendingLabel="Actualizando..."
        />
      </section>
    </AppContainer>
  );
}