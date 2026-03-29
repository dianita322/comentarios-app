import Link from "next/link";
import { redirect } from "next/navigation";

import AppContainer from "@/components/layout/app-container";
import AppPageHeader from "@/components/layout/app-page-header";
import EmptyState from "@/components/shared/empty-state";
import type { PostRow } from "@/lib/posts/types";
import { formatPostDate } from "@/lib/posts/utils";
import { createClient } from "@/lib/supabase/server";

type ManagePostsPageProps = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function ManagePostsPage({
  searchParams,
}: ManagePostsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select(
      "id, author_id, title, slug, excerpt, content, cover_image_url, status, published_at, created_at, updated_at",
    )
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (postsError) {
    console.error("Error cargando publicaciones del autor:", postsError);
  }

  const posts = (postsData ?? []) as PostRow[];
  const showCreatedMessage = params?.success === "created";

  return (
    <AppContainer className="space-y-8">
      <AppPageHeader
        eyebrow="Panel de autor"
        title="Mis publicaciones"
        description="Aquí verás tus borradores y tus publicaciones ya visibles para el público."
        actions={
          <Link
            href="/posts/new"
            className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
          >
            Crear nueva publicación
          </Link>
        }
      />

      {showCreatedMessage ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          La publicación se guardó correctamente.
        </div>
      ) : null}

      {posts.length === 0 ? (
        <EmptyState
          title="Todavía no has creado publicaciones"
          description="Empieza creando tu primera publicación o borrador desde el panel."
          ctaLabel="Crear publicación"
          ctaHref="/posts/new"
        />
      ) : (
        <section className="grid gap-5">
          {posts.map((post) => {
            const isPublished = post.status === "published";

            return (
              <article
                key={post.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                {post.cover_image_url ? (
                  <div className="h-44 w-full overflow-hidden bg-black/30">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}

                <div className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/50">
                        <span>{isPublished ? "Publicada" : "Borrador"}</span>
                        <span>•</span>
                        <span>
                          {isPublished
                            ? formatPostDate(post.published_at ?? post.created_at)
                            : `Creada el ${formatPostDate(post.created_at)}`}
                        </span>
                      </div>

                      <h2 className="mt-3 text-xl font-semibold">{post.title}</h2>

                      <p className="mt-2 break-all text-sm text-white/50">
                        /posts/{post.slug}
                      </p>

                      <p className="mt-3 text-sm text-white/70">
                        {post.excerpt?.trim() || "Sin resumen corto."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {isPublished ? (
                        <Link
                          href={`/posts/${post.slug}`}
                          className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                        >
                          Ver publicación
                        </Link>
                      ) : null}

                      <Link
                        href="/posts/new"
                        className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                      >
                        Crear otra
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </AppContainer>
  );
}