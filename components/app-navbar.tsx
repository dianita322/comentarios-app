'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import LogoutButton from '@/components/logout-button'

function navLinkClass(active: boolean) {
  return active
    ? 'rounded-lg bg-white text-black px-3 py-2 text-sm font-medium'
    : 'rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white'
}

export default function AppNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (mounted) {
        setUser(user)
        setLoading(false)
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      router.refresh()
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold text-white">
            Comentarios App
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/" className={navLinkClass(pathname === '/')}>
              Inicio
            </Link>

            <Link
              href="/feed"
              className={navLinkClass(pathname.startsWith('/feed'))}
            >
              Feed
            </Link>

            {user ? (
              <Link
                href="/account"
                className={navLinkClass(pathname.startsWith('/account'))}
              >
                Mi cuenta
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-white/50">Cargando...</span>
          ) : user ? (
            <>
              <span className="hidden text-sm text-white/60 md:inline">
                {user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/auth/sign-up"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-2 md:hidden">
        <nav className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto">
          <Link href="/" className={navLinkClass(pathname === '/')}>
            Inicio
          </Link>

          <Link
            href="/feed"
            className={navLinkClass(pathname.startsWith('/feed'))}
          >
            Feed
          </Link>

          {user ? (
            <Link
              href="/account"
              className={navLinkClass(pathname.startsWith('/account'))}
            >
              Mi cuenta
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  )
}