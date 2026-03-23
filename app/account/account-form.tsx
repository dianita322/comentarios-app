'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

type AccountFormProps = {
  userId: string
  email: string
}

export default function AccountForm({ userId, email }: AccountFormProps) {
  const supabase = createClient()

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      setMessage('')

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error cargando perfil:', error)
        setMessage('No se pudo cargar el perfil')
      } else if (data) {
        setDisplayName(data.display_name ?? '')
        setUsername(data.username ?? '')
      }

      setLoading(false)
    }

    loadProfile()
  }, [supabase, userId])

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const cleanDisplayName = displayName.trim()
    const cleanUsername = username.trim()

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: cleanDisplayName || null,
      username: cleanUsername || null,
    })

    if (error) {
      console.error('Error guardando perfil:', error)
      setMessage('Error al guardar el perfil')
    } else {
      setMessage('Perfil guardado correctamente')
    }

    setSaving(false)
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-bold mb-2">Mi cuenta</h1>
        <p className="text-white/70 mb-6">
          Aquí vas a completar los datos visibles de tu perfil.
        </p>

        {loading ? (
          <p className="text-white/70">Cargando perfil...</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm mb-2">Correo</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white/70 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Nombre visible</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ejemplo: Rosita"
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ejemplo: rosita123"
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 outline-none"
              />
            </div>

            {message && <p className="text-sm text-yellow-300">{message}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-white text-black font-medium py-3 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar perfil'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}