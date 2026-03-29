import Link from "next/link";

import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/logout-button";

export default async function AppNavbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = isAdminEmail(user?.email);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0b0f]/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold text-white">
            Comentarios App
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/"
              className="rounded-xl px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              Inicio
            </Link>
            <Link
              href="/posts"
              className="rounded-xl px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              Publicaciones
            </Link>
            <Link
              href="/tools"
              className="rounded-xl px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              Herramientas
            </Link>
            <Link
              href="/projects"
              className="rounded-xl px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              Proyectos
            </Link>
            {user ? (
              <Link
                href="/account"
                className="rounded-xl px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Mi cuenta
              </Link>
            ) : null}
            {isAdmin ? (
              <Link
                href="/projects/manage"
                className="rounded-xl px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Admin
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-white/55 md:inline">
                {user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
