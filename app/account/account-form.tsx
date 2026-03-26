'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FormStatus from '@/components/form-status'

type AccountFormProps = {
  userId: string
  email: string
}

const DISPLAY_NAME_MIN = 2
const DISPLAY_NAME_MAX = 40
const USERNAME_MIN = 3
const USERNAME_MAX = 20
const USERNAME_REGEX = /^[a-z0-9._]+$/

type StatusState = {
  type: 'success' | 'error' | 'info'
  message: string
} | null

export default function AccountForm({ userId, email }: AccountFormProps) {
  const supabase = createClient()

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<StatusState>(null)

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      setStatus(null)

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error cargando perfil:', error)
        setStatus({
          type: 'error',
          message: 'No se pudo cargar el perfil.',
        })
      } else if (data) {
        setDisplayName(data.display_name ?? '')
        setUsername(data.username ?? '')
      }

      setLoading(false)
    }

    loadProfile()
  }, [supabase, userId])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)

    const cleanDisplayName = displayName.trim()
    const normalizedUsername = username.trim().toLowerCase()

    if (!cleanDisplayName) {
      setStatus({
        type: 'error',
        message: 'El nombre visible es obligatorio.',
      })
      setSaving(false)
      return
    }

    if (
      cleanDisplayName.length < DISPLAY_NAME_MIN ||
      cleanDisplayName.length > DISPLAY_NAME_MAX
    ) {
      setStatus({
        type: 'error',
        message: `El nombre visible debe tener entre ${DISPLAY_NAME_MIN} y ${DISPLAY_NAME_MAX} caracteres.`,
      })
      setSaving(false)
      return
    }

    if (normalizedUsername) {
      if (
        normalizedUsername.length < USERNAME_MIN ||
        normalizedUsername.length > USERNAME_MAX
      ) {
        setStatus({
          type: 'error',
          message: `El username debe tener entre ${USERNAME_MIN} y ${USERNAME_MAX} caracteres.`,
        })
        setSaving(false)
        return
      }

      if (!USERNAME_REGEX.test(normalizedUsername)) {
        setStatus({
          type: 'error',
          message:
            'El username solo puede tener letras minúsculas, números, punto y guion bajo.',
        })
        setSaving(false)
        return
      }

      const { data: existingProfiles, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', normalizedUsername)
        .neq('id', userId)
        .limit(1)

      if (usernameCheckError) {
        console.error('Error validando username:', usernameCheckError)
        setStatus({
          type: 'error',
          message: 'No se pudo validar el username. Inténtalo otra vez.',
        })
        setSaving(false)
        return
      }

      if (existingProfiles && existingProfiles.length > 0) {
        setStatus({
          type: 'error',
          message: 'Ese username ya está en uso. Prueba con otro.',
        })
        setSaving(false)
        return
      }
    }

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: cleanDisplayName,
      username: normalizedUsername || null,
    })

    if (error) {
      console.error('Error guardando perfil:', error)

      if (error.code === '23505') {
        setStatus({
          type: 'error',
          message: 'Ese username ya está en uso. Prueba con otro.',
        })
      } else {
        setStatus({
          type: 'error',
          message: 'No se pudo guardar el perfil.',
        })
      }
    } else {
      setUsername(normalizedUsername)
      setStatus({
        type: 'success',
        message: 'Perfil guardado correctamente.',
      })
    }

    setSaving(false)
  }

  const displayNameTooLong = displayName.length > DISPLAY_NAME_MAX
  const usernameTooLong = username.trim().length > USERNAME_MAX

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
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-white/50">
                  Obligatorio · entre {DISPLAY_NAME_MIN} y {DISPLAY_NAME_MAX}{' '}
                  caracteres
                </span>
                <span
                  className={
                    displayNameTooLong ? 'text-red-300' : 'text-white/50'
                  }
                >
                  {displayName.length}/{DISPLAY_NAME_MAX}
                </span>
              </div>
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
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-white/50">
                  Opcional · solo minúsculas, números, punto y guion bajo
                </span>
                <span
                  className={
                    usernameTooLong ? 'text-red-300' : 'text-white/50'
                  }
                >
                  {username.trim().length}/{USERNAME_MAX}
                </span>
              </div>
            </div>

            {status ? (
              <FormStatus type={status.type} message={status.message} />
            ) : null}

            <button
              type="submit"
              disabled={saving || displayNameTooLong || usernameTooLong}
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