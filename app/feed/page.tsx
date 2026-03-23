import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CommentForm from '@/app/feed/comment-form'
import CommentActions from '@/app/feed/comment-actions'
import ReplyForm from '@/app/feed/reply-form'

type CommentRow = {
  id: number
  user_id: string
  content: string
  is_anonymous: boolean
  created_at: string
}

type ReplyRow = {
  id: number
  comment_id: number
  user_id: string
  content: string
  is_anonymous: boolean
  created_at: string
}

type ProfileRow = {
  id: string
  display_name: string | null
  username: string | null
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function FeedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const currentUserId = user?.id ?? null

  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select('id, user_id, content, is_anonymous, created_at')
    .order('created_at', { ascending: false })

  if (commentsError) {
    console.error('Error cargando comentarios:', commentsError)
  }

  const { data: repliesData, error: repliesError } = await supabase
    .from('replies')
    .select('id, comment_id, user_id, content, is_anonymous, created_at')
    .order('created_at', { ascending: true })

  if (repliesError) {
    console.error('Error cargando respuestas:', repliesError)
  }

  const comments = (commentsData ?? []) as CommentRow[]
  const replies = (repliesData ?? []) as ReplyRow[]

  const visibleUserIds = [
    ...new Set([
      ...comments
        .filter((comment) => !comment.is_anonymous)
        .map((comment) => comment.user_id),
      ...replies
        .filter((reply) => !reply.is_anonymous)
        .map((reply) => reply.user_id),
    ]),
  ]

  let profilesById: Record<string, ProfileRow> = {}

  if (visibleUserIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, username')
      .in('id', visibleUserIds)

    if (profilesError) {
      console.error('Error cargando perfiles:', profilesError)
    } else {
      profilesById = Object.fromEntries(
        ((profilesData ?? []) as ProfileRow[]).map((profile) => [
          profile.id,
          profile,
        ])
      )
    }
  }

  const repliesByCommentId: Record<number, ReplyRow[]> = {}

  for (const reply of replies) {
    if (!repliesByCommentId[reply.comment_id]) {
      repliesByCommentId[reply.comment_id] = []
    }
    repliesByCommentId[reply.comment_id].push(reply)
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-3xl font-bold mb-2">Feed de comentarios</h1>
          <p className="text-white/70">
            Aquí aparecerán los comentarios públicos de la página.
          </p>
        </div>

        {user ? (
          <CommentForm userId={user.id} />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/80 mb-4">
              Debes iniciar sesión para publicar un comentario.
            </p>
            <Link
              href="/auth/login"
              className="inline-block rounded-lg bg-white px-4 py-2 font-medium text-black"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        )}

        <section className="space-y-4">
          {comments.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-white/70">
                Todavía no hay comentarios publicados.
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const profile = profilesById[comment.user_id]
              const visibleName = comment.is_anonymous
                ? 'Anónimo'
                : profile?.display_name || profile?.username || 'Usuario'

              const isOwner = currentUserId === comment.user_id
              const commentReplies = repliesByCommentId[comment.id] ?? []

              return (
                <article
                  key={comment.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{visibleName}</p>
                      {!comment.is_anonymous && profile?.username ? (
                        <p className="text-sm text-white/50">
                          @{profile.username}
                        </p>
                      ) : null}
                    </div>

                    <p className="text-sm text-white/50">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>

                  <p className="whitespace-pre-line text-white/90">
                    {comment.content}
                  </p>

                  {isOwner ? (
                    <CommentActions
                      commentId={comment.id}
                      initialContent={comment.content}
                      initialIsAnonymous={comment.is_anonymous}
                    />
                  ) : null}

                  <section className="mt-6 space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
                    <h3 className="text-lg font-semibold">Respuestas</h3>

                    {commentReplies.length === 0 ? (
                      <p className="text-sm text-white/60">
                        Todavía no hay respuestas para este comentario.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {commentReplies.map((reply) => {
                          const replyProfile = profilesById[reply.user_id]
                          const replyVisibleName = reply.is_anonymous
                            ? 'Anónimo'
                            : replyProfile?.display_name ||
                              replyProfile?.username ||
                              'Usuario'

                          return (
                            <div
                              key={reply.id}
                              className="rounded-xl border border-white/10 bg-white/5 p-4"
                            >
                              <div className="mb-2 flex items-center justify-between gap-4">
                                <div>
                                  <p className="font-medium">{replyVisibleName}</p>
                                  {!reply.is_anonymous && replyProfile?.username ? (
                                    <p className="text-sm text-white/50">
                                      @{replyProfile.username}
                                    </p>
                                  ) : null}
                                </div>

                                <p className="text-sm text-white/50">
                                  {formatDate(reply.created_at)}
                                </p>
                              </div>

                              <p className="whitespace-pre-line text-white/90">
                                {reply.content}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {user ? (
                      <ReplyForm commentId={comment.id} userId={user.id} />
                    ) : (
                      <p className="text-sm text-white/60">
                        Inicia sesión para responder este comentario.
                      </p>
                    )}
                  </section>
                </article>
              )
            })
          )}
        </section>
      </div>
    </main>
  )
}