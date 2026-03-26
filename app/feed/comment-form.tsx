'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FormStatus from '@/components/form-status'

type CommentFormProps = {
  userId: string
}

const COMMENT_MAX = 500
const MAX_IMAGE_SIZE_MB = 2
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024

type StatusState = {
  type: 'success' | 'error' | 'info'
  message: string
} | null

export default function CommentForm({ userId }: CommentFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<StatusState>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const cleanContent = content.trim()

    if (!cleanContent && !imageFile) {
      setStatus({
        type: 'error',
        message: 'Escribe un comentario o sube una imagen antes de publicar.',
      })
      return
    }

    if (cleanContent.length > COMMENT_MAX) {
      setStatus({
        type: 'error',
        message: `El comentario no puede superar los ${COMMENT_MAX} caracteres.`,
      })
      return
    }

    if (imageFile) {
      if (!imageFile.type.startsWith('image/')) {
        setStatus({
          type: 'error',
          message: 'El archivo seleccionado debe ser una imagen.',
        })
        return
      }

      if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
        setStatus({
          type: 'error',
          message: `La imagen no puede pesar más de ${MAX_IMAGE_SIZE_MB} MB.`,
        })
        return
      }
    }

    setLoading(true)
    setStatus(null)

    let imageUrl: string | null = null

    if (imageFile) {
      const safeFileName = imageFile.name.replace(/\s+/g, '-')
      const filePath = `${userId}/${Date.now()}-${safeFileName}`

      const { error: uploadError } = await supabase.storage
        .from('feed-images')
        .upload(filePath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Error subiendo imagen del comentario:', uploadError)
        setStatus({
          type: 'error',
          message: 'No se pudo subir la imagen.',
        })
        setLoading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('feed-images')
        .getPublicUrl(filePath)

      imageUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase.from('comments').insert({
      user_id: userId,
      content: cleanContent || '',
      is_anonymous: isAnonymous,
      image_url: imageUrl,
    })

    if (error) {
      console.error('Error publicando comentario:', error)
      setStatus({
        type: 'error',
        message: 'No se pudo publicar el comentario.',
      })
    } else {
      setContent('')
      setIsAnonymous(false)
      setImageFile(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setStatus({
        type: 'success',
        message: 'Comentario publicado correctamente.',
      })
      router.refresh()
    }

    setLoading(false)
  }

  const tooLong = content.length > COMMENT_MAX
  const canSubmit = !loading && !tooLong

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
          <div className="mt-2 flex justify-between text-xs">
            <span className="text-white/50">
              Máximo {COMMENT_MAX} caracteres
            </span>
            <span className={tooLong ? 'text-red-300' : 'text-white/50'}>
              {content.length}/{COMMENT_MAX}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-2">Imagen opcional</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              setImageFile(e.target.files?.[0] ?? null)
              setStatus(null)
            }}
            className="block w-full text-sm text-white/80"
          />
          <p className="mt-2 text-xs text-white/50">
            Solo imágenes. Máximo {MAX_IMAGE_SIZE_MB} MB.
          </p>
          {imageFile ? (
            <p className="mt-2 text-xs text-white/60">
              Archivo seleccionado: {imageFile.name}
            </p>
          ) : null}
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

        {status ? <FormStatus type={status.type} message={status.message} /> : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-white text-black font-medium py-3 disabled:opacity-50"
        >
          {loading ? 'Publicando...' : 'Publicar comentario'}
        </button>
      </form>
    </section>
  )
}