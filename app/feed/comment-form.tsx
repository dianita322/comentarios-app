'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type CommentFormProps = {
  userId: string
}

export default function CommentForm({ userId }: CommentFormProps) {
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
      setMessage('Escribe un comentario antes de publicar.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('comments').insert({
      user_id: userId,
      content: cleanContent,
      is_anonymous: isAnonymous,
    })

    if (error) {
      console.error('Error publicando comentario:', error)
      setMessage('No se pudo publicar el comentario.')
    } else {
      setContent('')
      setIsAnonymous(false)
      setMessage('Comentario publicado correctamente.')
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold mb-4">Escribir comentario</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-2">Comentario</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe aquí tu comentario..."
            rows={5}
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
          Publicar como anónimo
        </label>

        {message && <p className="text-sm text-yellow-300">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-white text-black font-medium py-3 disabled:opacity-50"
        >
          {loading ? 'Publicando...' : 'Publicar comentario'}
        </button>
      </form>
    </section>
  )
}