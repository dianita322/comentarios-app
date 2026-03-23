'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type CommentActionsProps = {
  commentId: number
  initialContent: string
  initialIsAnonymous: boolean
}

export default function CommentActions({
  commentId,
  initialContent,
  initialIsAnonymous,
}: CommentActionsProps) {
  const supabase = createClient()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(initialContent)
  const [isAnonymous, setIsAnonymous] = useState(initialIsAnonymous)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleDelete() {
    const confirmed = window.confirm(
      '¿Seguro que quieres eliminar este comentario?'
    )

    if (!confirmed) return

    setLoading(true)
    setMessage('')

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('Error eliminando comentario:', error)
      setMessage('No se pudo eliminar el comentario.')
    } else {
      router.refresh()
    }

    setLoading(false)
  }

  async function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const cleanContent = content.trim()

    if (!cleanContent) {
      setMessage('El comentario no puede estar vacío.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase
      .from('comments')
      .update({
        content: cleanContent,
        is_anonymous: isAnonymous,
      })
      .eq('id', commentId)

    if (error) {
      console.error('Error actualizando comentario:', error)
      setMessage('No se pudo actualizar el comentario.')
    } else {
      setMessage('Comentario actualizado correctamente.')
      setIsEditing(false)
      router.refresh()
    }

    setLoading(false)
  }

  if (isEditing) {
    return (
      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Editar comentario</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
            Mostrar como anónimo
          </label>

          {message && <p className="text-sm text-yellow-300">{message}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setContent(initialContent)
                setIsAnonymous(initialIsAnonymous)
                setMessage('')
                setIsEditing(false)
              }}
              className="rounded-lg border border-white/20 px-4 py-2 text-white disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          setMessage('')
          setIsEditing(true)
        }}
        className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        Editar
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={handleDelete}
        className="rounded-lg border border-red-400/40 px-4 py-2 text-sm text-red-300 disabled:opacity-50"
      >
        {loading ? 'Procesando...' : 'Eliminar'}
      </button>

      {message && <p className="w-full text-sm text-yellow-300">{message}</p>}
    </div>
  )
}