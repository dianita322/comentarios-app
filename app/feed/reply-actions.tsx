'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FormStatus from '@/components/form-status'

type ReplyActionsProps = {
  replyId: number
  initialContent: string
  initialIsAnonymous: boolean
}

const REPLY_MAX = 300

type StatusState = {
  type: 'success' | 'error' | 'info'
  message: string
} | null

export default function ReplyActions({
  replyId,
  initialContent,
  initialIsAnonymous,
}: ReplyActionsProps) {
  const supabase = createClient()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(initialContent)
  const [isAnonymous, setIsAnonymous] = useState(initialIsAnonymous)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<StatusState>(null)

  async function handleDelete() {
    const confirmed = window.confirm(
      '¿Seguro que quieres eliminar esta respuesta?'
    )

    if (!confirmed) return

    setLoading(true)
    setStatus(null)

    const { error } = await supabase
      .from('replies')
      .delete()
      .eq('id', replyId)

    if (error) {
      console.error('Error eliminando respuesta:', error)
      setStatus({
        type: 'error',
        message: 'No se pudo eliminar la respuesta.',
      })
    } else {
      router.refresh()
    }

    setLoading(false)
  }

  async function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const cleanContent = content.trim()

    if (!cleanContent) {
      setStatus({
        type: 'error',
        message: 'La respuesta no puede estar vacía.',
      })
      return
    }

    if (cleanContent.length > REPLY_MAX) {
      setStatus({
        type: 'error',
        message: `La respuesta no puede superar los ${REPLY_MAX} caracteres.`,
      })
      return
    }

    setLoading(true)
    setStatus(null)

    const { error } = await supabase
      .from('replies')
      .update({
        content: cleanContent,
        is_anonymous: isAnonymous,
      })
      .eq('id', replyId)

    if (error) {
      console.error('Error actualizando respuesta:', error)
      setStatus({
        type: 'error',
        message: 'No se pudo actualizar la respuesta.',
      })
    } else {
      setStatus({
        type: 'success',
        message: 'Respuesta actualizada correctamente.',
      })
      setIsEditing(false)
      router.refresh()
    }

    setLoading(false)
  }

  const tooLong = content.length > REPLY_MAX

  if (isEditing) {
    return (
      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Editar respuesta</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 outline-none resize-none"
            />
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-white/50">
                Máximo {REPLY_MAX} caracteres
              </span>
              <span className={tooLong ? 'text-red-300' : 'text-white/50'}>
                {content.length}/{REPLY_MAX}
              </span>
            </div>
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

          {status ? <FormStatus type={status.type} message={status.message} /> : null}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || tooLong}
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
                setStatus(null)
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
          setStatus(null)
          setIsEditing(true)
        }}
        className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        Editar respuesta
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={handleDelete}
        className="rounded-lg border border-red-400/40 px-4 py-2 text-sm text-red-300 disabled:opacity-50"
      >
        {loading ? 'Procesando...' : 'Eliminar respuesta'}
      </button>
    </div>
  )
}