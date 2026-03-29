import { notFound } from "next/navigation";

import AppContainer from "@/components/layout/app-container";
import PostContent from "@/components/posts/post-content";
import type { PostAuthorProfile, PostRow } from "@/lib/posts/types";
import { formatPostDate } from "@/lib/posts/utils";
import { createClient } from "@/lib/supabase/server";

type PostDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PostDetailPage({
  params,
}: PostDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: postData, error: postError } = await supabase
    .from("posts")
    .select(
      "id, author_id, title, slug, excerpt, content, cover_image_url, status, published_at, created_at, updated_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (postError) {
    console.error("Error cargando publicación:", postError);
  }

  if (!postData) {
    notFound();
  }

  const post = postData as PostRow;
  let authorName: string | null = null;

  if (post.author_id) {
    const { data: authorData, error: authorError } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .eq("id", post.author_id)
      .maybeSingle();

    if (authorError) {
      console.error("Error cargando autor:", authorError);
    } else if (authorData) {
      const author = authorData as PostAuthorProfile;
      authorName = author.display_name || author.username || null;
    }
  }

  return (
    <AppContainer className="space-y-8">
      <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {post.cover_image_url ? (
          <div className="aspect-[16/7] w-full overflow-hidden bg-black/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/50">
            <span>Publicación</span>
            <span>•</span>
            <span>{formatPostDate(post.published_at ?? post.created_at)}</span>
            {authorName ? (
              <>
                <span>•</span>
                <span>{authorName}</span>
              </>
            ) : null}
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="mt-4 text-base text-white/70 md:text-lg">
              {post.excerpt}
            </p>
          ) : null}

          <div className="mt-8">
            <PostContent content={post.content} />
          </div>
        </div>
      </article>
    </AppContainer>
  );
}