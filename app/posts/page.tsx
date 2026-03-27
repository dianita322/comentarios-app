import Link from "next/link";

import AppContainer from "@/components/layout/app-container";
import AppPageHeader from "@/components/layout/app-page-header";
import EmptyState from "@/components/shared/empty-state";
import PostCard from "@/components/posts/post-card";
import type { PostAuthorProfile, PostRow } from "@/lib/posts/types";
import { createClient } from "@/lib/supabase/server";

export default async function PostsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select(
      "id, author_id, title, slug, excerpt, content, cover_image_url, status, published_at, created_at, updated_at",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (postsError) {
    console.error("Error cargando publicaciones:", postsError);
  }

  const posts = (postsData ?? []) as PostRow[];

  const authorIds = [
    ...new Set(posts.map((post) => post.author_id).filter(Boolean)),
  ] as string[];

  let authorById: Record<string, PostAuthorProfile> = {};

  if (authorIds.length > 0) {
    const { data: authorsData, error: authorsError } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .in("id", authorIds);

    if (authorsError) {
      console.error("Error cargando autores:", authorsError);
    } else {
      authorById = Object.fromEntries(
        ((authorsData ?? []) as PostAuthorProfile[]).map((author) => [
          author.id,
          author,
        ]),
      );
    }
  }

  return (
    <AppContainer className="space-y-8">
      <AppPageHeader
        eyebrow="Blog"
        title="Publicaciones"
        description="Aquí aparecen las publicaciones públicas del sitio. Si has iniciado sesión, ya puedes ir al panel para crear las tuyas."
        actions={
          user ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href="/posts/manage"
                className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Mis publicaciones
              </Link>
              <Link
                href="/posts/new"
                className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                Nueva publicación
              </Link>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Iniciar sesión para publicar
            </Link>
          )
        }
      />

      {posts.length === 0 ? (
        <EmptyState
          title="Todavía no hay publicaciones"
          description="Crea la primera desde el panel de autor para que aparezca aquí."
          ctaLabel={user ? "Crear publicación" : "Iniciar sesión"}
          ctaHref={user ? "/posts/new" : "/auth/login"}
        />
      ) : (
        <section className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => {
            const author = post.author_id ? authorById[post.author_id] : undefined;
            const authorName =
              author?.display_name || author?.username || undefined;

            return (
              <PostCard
                key={post.id}
                post={post}
                authorName={authorName}
              />
            );
          })}
        </section>
      )}
    </AppContainer>
  );
}