'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type ReplyFormProps = {
  commentId: number
  userId: string
}

export default function ReplyForm({ commentId, userId }: ReplyFormProps) {
  const supabase = createClient()
  const router = useRouter()

  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const cleanContent = content.trim()

    if (!cleanContent) {
      setMessage('Escribe una respuesta antes de publicar.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('replies').insert({
      comment_id: commentId,
      user_id: userId,
      content: cleanContent,
      is_anonymous: isAnonymous,
    })

    if (error) {
      console.error('Error publicando respuesta:', error)
      setMessage('No se pudo publicar la respuesta.')
    } else {
      setContent('')
      setIsAnonymous(false)
      setMessage('Respuesta publicada correctamente.')
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-base font-semibold mb-3">Responder comentario</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe tu respuesta..."
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 outline-none resize-none"
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-white/80">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4"
          />
          Responder como anónimo
        </label>

        {message && <p className="text-sm text-yellow-300">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
        >
          {loading ? 'Publicando...' : 'Publicar respuesta'}
        </button>
      </form>
    </div>
  )
}