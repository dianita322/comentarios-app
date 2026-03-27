import Link from "next/link";
import Image from "next/image";

import CommentActions from "@/app/feed/comment-actions";
import CommentForm from "@/app/feed/comment-form";
import ReactionButton from "@/app/feed/reaction-button";
import ReplyForm from "@/app/feed/reply-form";
import AppContainer from "@/components/layout/app-container";
import AppPageHeader from "@/components/layout/app-page-header";
import EmptyState from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/server";
import {
  buildReactionState,
  formatFeedDate,
  groupRepliesByComment,
} from "@/lib/feed/utils";
import type {
  CommentRow,
  ProfileRow,
  ReactionRow,
  ReplyRow,
} from "@/lib/feed/types";

export default async function FeedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentUserId = user?.id ?? null;

  const { data: commentsData, error: commentsError } = await supabase
    .from("comments")
    .select("id, user_id, content, image_url, is_anonymous, created_at")
    .order("created_at", { ascending: false });

  if (commentsError) {
    console.error("Error cargando comentarios:", commentsError);
  }

  const { data: repliesData, error: repliesError } = await supabase
    .from("replies")
    .select(
      "id, comment_id, user_id, content, image_url, is_anonymous, created_at",
    )
    .order("created_at", { ascending: true });

  if (repliesError) {
    console.error("Error cargando respuestas:", repliesError);
  }

  const { data: reactionsData, error: reactionsError } = await supabase
    .from("reactions")
    .select("id, user_id, target_type, target_id, reaction_type");

  if (reactionsError) {
    console.error("Error cargando reacciones:", reactionsError);
  }

  const comments = (commentsData ?? []) as CommentRow[];
  const replies = (repliesData ?? []) as ReplyRow[];
  const reactions = (reactionsData ?? []) as ReactionRow[];

  const visibleUserIds = [
    ...new Set([
      ...comments
        .filter((comment) => !comment.is_anonymous)
        .map((comment) => comment.user_id),
      ...replies
        .filter((reply) => !reply.is_anonymous)
        .map((reply) => reply.user_id),
    ]),
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

  const repliesByCommentId = groupRepliesByComment(replies);
  const { reactionCountByKey, reactedByCurrentUser } = buildReactionState(
    reactions,
    currentUserId,
  );

  return (
    <AppContainer className="space-y-8">
      <AppPageHeader
        eyebrow="Comunidad"
        title="Feed de comentarios"
        description="Aquí aparecen los comentarios públicos, sus respuestas y las reacciones de los usuarios."
        actions={
          user ? null : (
            <Link
              href="/auth/login"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Iniciar sesión
            </Link>
          )
        }
      />

      {user ? (
        <CommentForm userId={user.id} />
      ) : (
        <EmptyState
          title="Debes iniciar sesión para publicar"
          description="Puedes leer el feed libremente, pero para comentar o responder necesitas entrar con tu cuenta."
          ctaLabel="Ir a iniciar sesión"
          ctaHref="/auth/login"
        />
      )}

      {comments.length === 0 ? (
        <EmptyState
          title="Todavía no hay comentarios publicados"
          description="Cuando alguien publique el primer comentario, aparecerá aquí."
        />
      ) : (
        <section className="space-y-6">
          {comments.map((comment) => {
            const profile = profilesById[comment.user_id];
            const visibleName = comment.is_anonymous
              ? "Anónimo"
              : profile?.display_name || profile?.username || "Usuario";

            const isOwner = currentUserId === comment.user_id;
            const commentReplies = repliesByCommentId[comment.id] ?? [];
            const commentReactionKey = `comment:${comment.id}`;

            return (
              <article
                key={comment.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{visibleName}</p>

                    {!comment.is_anonymous && profile?.username ? (
                      <p className="text-sm text-white/50">
                        @{profile.username}
                      </p>
                    ) : null}

                    <p className="mt-1 text-xs text-white/45">
                      {formatFeedDate(comment.created_at)}
                    </p>
                  </div>

                  {isOwner ? (
                    <CommentActions
                      commentId={comment.id}
                      initialContent={comment.content}
                      initialIsAnonymous={comment.is_anonymous}
                    />
                  ) : null}
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm text-white/85">
                  {comment.content}
                </p>

                {comment.image_url ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                    <Image
                      src={comment.image_url}
                      alt="Imagen del comentario"
                      width={1200}
                      height={700}
                      className="h-auto max-h-[480px] w-full object-cover"
                    />
                  </div>
                ) : null}

                <div className="mt-4">
                  <ReactionButton
                    userId={currentUserId}
                    targetType="comment"
                    targetId={comment.id}
                    initialCount={reactionCountByKey[commentReactionKey] ?? 0}
                    initialReacted={reactedByCurrentUser.has(
                      commentReactionKey,
                    )}
                  />
                </div>

                <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/60">
                    Respuestas
                  </h3>

                  {commentReplies.length === 0 ? (
                    <p className="mt-3 text-sm text-white/60">
                      Todavía no hay respuestas para este comentario.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {commentReplies.map((reply) => {
                        const replyProfile = profilesById[reply.user_id];
                        const replyVisibleName = reply.is_anonymous
                          ? "Anónimo"
                          : replyProfile?.display_name ||
                            replyProfile?.username ||
                            "Usuario";

                        const replyReactionKey = `reply:${reply.id}`;

                        return (
                          <div
                            key={reply.id}
                            className="rounded-xl border border-white/10 bg-white/5 p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-medium">
                                  {replyVisibleName}
                                </p>

                                {!reply.is_anonymous &&
                                replyProfile?.username ? (
                                  <p className="text-sm text-white/50">
                                    @{replyProfile.username}
                                  </p>
                                ) : null}

                                <p className="mt-1 text-xs text-white/45">
                                  {formatFeedDate(reply.created_at)}
                                </p>
                              </div>
                            </div>

                            <p className="mt-3 whitespace-pre-wrap text-sm text-white/85">
                              {reply.content}
                            </p>

                            {reply.image_url ? (
                              <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                                <Image
                                  src={reply.image_url}
                                  alt="Imagen de la respuesta"
                                  width={1200}
                                  height={700}
                                  className="h-auto max-h-[420px] w-full object-cover"
                                />
                              </div>
                            ) : null}

                            <div className="mt-4">
                              <ReactionButton
                                userId={currentUserId}
                                targetType="reply"
                                targetId={reply.id}
                                initialCount={
                                  reactionCountByKey[replyReactionKey] ?? 0
                                }
                                initialReacted={reactedByCurrentUser.has(
                                  replyReactionKey,
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-4">
                    {user ? (
                      <ReplyForm commentId={comment.id} userId={user.id} />
                    ) : (
                      <p className="text-sm text-white/60">
                        Inicia sesión para responder este comentario.
                      </p>
                    )}
                  </div>
                </section>
              </article>
            );
          })}
        </section>
      )}
    </AppContainer>
  );
}