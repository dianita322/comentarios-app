import { notFound } from "next/navigation";

import { isAdminEmail } from "@/lib/admin";
import DeleteCommentButton from "@/components/posts/delete-comment-button";
import PostCommentForm from "@/components/posts/post-comment-form";
import PostContent from "@/components/posts/post-content";
import ReactionToggleButton from "@/components/posts/reaction-toggle-button";
import {
  createPostCommentAction,
  deletePostCommentAction,
  toggleCommentReactionAction,
  togglePostReactionAction,
} from "@/app/posts/[slug]/actions";
import type { PostAuthorProfile, PostRow } from "@/lib/posts/types";
import type { ProfileRow } from "@/lib/feed/types";
import { formatPostDate } from "@/lib/posts/utils";
import { buildReactionState, type PostCommentRow, type ReactionRow } from "@/lib/posts/engagement";
import AppContainer from "@/components/layout/app-container";
import AppPageHeader from "@/components/layout/app-page-header";
import EmptyState from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/server";

type PostDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function PostDetailPage({
  params,
  searchParams,
}: PostDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentUserId = user?.id ?? null;
  const isAdmin = isAdminEmail(user?.email);

  const { data: postData, error: postError } = await supabase
    .from("posts")
    .select(
      "id, author_id, title, slug, excerpt, content, cover_image_url, category, status, published_at, created_at, updated_at",
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

  const { data: commentsData, error: commentsError } = await supabase
    .from("comments")
    .select("id, post_id, user_id, content, image_url, is_anonymous, created_at")
    .eq("post_id", post.id)
    .order("created_at", { ascending: true });

  if (commentsError) {
    console.error("Error cargando comentarios del post:", commentsError);
  }

  const comments = (commentsData ?? []) as PostCommentRow[];
  const commentIds = comments.map((comment) => comment.id);

  const { data: postReactionsData, error: postReactionsError } = await supabase
    .from("reactions")
    .select("id, user_id, target_type, target_id, reaction_type")
    .eq("target_type", "post")
    .eq("target_id", post.id);

  if (postReactionsError) {
    console.error("Error cargando reacciones del post:", postReactionsError);
  }

  let commentReactions: ReactionRow[] = [];

  if (commentIds.length > 0) {
    const { data: commentReactionsData, error: commentReactionsError } =
      await supabase
        .from("reactions")
        .select("id, user_id, target_type, target_id, reaction_type")
        .eq("target_type", "comment")
        .in("target_id", commentIds);

    if (commentReactionsError) {
      console.error(
        "Error cargando reacciones de comentarios:",
        commentReactionsError,
      );
    } else {
      commentReactions = (commentReactionsData ?? []) as ReactionRow[];
    }
  }

  const reactions = [
    ...((postReactionsData ?? []) as ReactionRow[]),
    ...commentReactions,
  ];

  const visibleUserIds = [
    ...new Set(
      comments
        .filter((comment) => !comment.is_anonymous)
        .map((comment) => comment.user_id)
        .concat(post.author_id ? [post.author_id] : []),
    ),
  ];

  let profilesById: Record<string, ProfileRow> = {};

  if (visibleUserIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .in("id", visibleUserIds);

    if (profilesError) {
      console.error("Error cargando perfiles:", profilesError);
    } else {
      profilesById = Object.fromEntries(
        ((profilesData ?? []) as ProfileRow[]).map((profile) => [
          profile.id,
          profile,
        ]),
      );
    }
  }

  const authorProfile = post.author_id ? profilesById[post.author_id] : null;
  const authorName =
    authorProfile?.display_name || authorProfile?.username || null;

  const { reactionCountByKey, reactedByCurrentUser } = buildReactionState(
    reactions,
    currentUserId,
  );

  const errorMessage = resolvedSearchParams?.error
    ? decodeURIComponent(resolvedSearchParams.error)
    : null;

  return (
    <AppContainer className="space-y-8">
      <AppPageHeader
        eyebrow="Publicación"
        title={post.title}
        description={post.excerpt ?? "Aquí puedes leer la publicación y comentar."}
      />

      {errorMessage ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

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
            <span>{formatPostDate(post.published_at ?? post.created_at)}</span>
            {authorName ? (
              <>
                <span>•</span>
                <span>{authorName}</span>
              </>
            ) : null}
          </div>

          <div className="mt-6">
            <PostContent content={post.content} />
          </div>

          <div className="mt-6">
            <ReactionToggleButton
              action={togglePostReactionAction}
              hiddenFields={{ slug, post_id: post.id }}
              count={reactionCountByKey[`post:${post.id}`] ?? 0}
              active={reactedByCurrentUser.has(`post:${post.id}`)}
            />
          </div>
        </div>
      </article>

      <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div>
          <h2 className="text-xl font-semibold">Comentarios</h2>
          <p className="mt-1 text-sm text-white/60">
            Los comentarios ahora pertenecen a publicaciones, no a un feed separado.
          </p>
        </div>

        {user ? (
          <PostCommentForm
            postId={post.id}
            slug={slug}
            action={createPostCommentAction}
          />
        ) : (
          <EmptyState
            title="Inicia sesión para comentar"
            description="Puedes leer la publicación libremente, pero para comentar y reaccionar necesitas entrar con tu cuenta."
            ctaLabel="Ir a iniciar sesión"
            ctaHref="/auth/login"
          />
        )}

        {comments.length === 0 ? (
          <p className="text-sm text-white/55">
            Todavía no hay comentarios en esta publicación.
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const profile = profilesById[comment.user_id];
              const visibleName = comment.is_anonymous
                ? "Anónimo"
                : profile?.display_name || profile?.username || "Usuario";

              const canDelete =
                currentUserId === comment.user_id || isAdmin;

              return (
                <article
                  key={comment.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{visibleName}</p>
                      <p className="mt-1 text-xs text-white/45">
                        {formatPostDate(comment.created_at)}
                      </p>
                    </div>

                    {canDelete ? (
                      <DeleteCommentButton
                        action={deletePostCommentAction}
                        commentId={comment.id}
                        slug={slug}
                      />
                    ) : null}
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm text-white/85">
                    {comment.content}
                  </p>

                  <div className="mt-4">
                    <ReactionToggleButton
                      action={toggleCommentReactionAction}
                      hiddenFields={{ slug, comment_id: comment.id }}
                      count={reactionCountByKey[`comment:${comment.id}`] ?? 0}
                      active={reactedByCurrentUser.has(`comment:${comment.id}`)}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </AppContainer>
  );
}
