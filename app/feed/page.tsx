import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CommentForm from '@/app/feed/comment-form'

type CommentRow = {
  id: number
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

  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select('id, user_id, content, is_anonymous, created_at')
    .order('created_at', { ascending: false })

  if (commentsError) {
    console.error('Error cargando comentarios:', commentsError)
  }

  const comments = (commentsData ?? []) as CommentRow[]

  const visibleUserIds = [
    ...new Set(
      comments
        .filter((comment) => !comment.is_anonymous)
        .map((comment) => comment.user_id)
    ),
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
                </article>
              )
            })
          )}
        </section>
      </div>
    </main>
  )
}