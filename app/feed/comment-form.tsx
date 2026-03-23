'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type CommentFormProps = {
  userId: string
}

export default function CommentForm({ userId }: CommentFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const cleanContent = content.trim()

    if (!cleanContent && !imageFile) {
      setMessage('Escribe un comentario o sube una imagen antes de publicar.')
      return
    }

    if (imageFile) {
      if (!imageFile.type.startsWith('image/')) {
        setMessage('El archivo debe ser una imagen.')
        return
      }

      if (imageFile.size > 2 * 1024 * 1024) {
        setMessage('La imagen no puede pesar más de 2 MB.')
        return
      }
    }

    setLoading(true)
    setMessage('')

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
        setMessage('No se pudo subir la imagen.')
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
      setMessage('No se pudo publicar el comentario.')
    } else {
      setContent('')
      setIsAnonymous(false)
      setImageFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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

        <div>
          <label className="block text-sm mb-2">Imagen opcional</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-white/80"
          />
          <p className="mt-2 text-xs text-white/50">
            Solo imágenes. Máximo 2 MB.
          </p>
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