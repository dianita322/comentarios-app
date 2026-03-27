"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import LogoutButton from "@/components/logout-button";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/site";

function navLinkClass(active: boolean) {
  return active
    ? "rounded-lg bg-white px-3 py-2 text-sm font-medium text-black"
    : "rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white";
}

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      router.refresh();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Link href="/" className="text-base font-semibold tracking-tight">
            {siteConfig.name}
          </Link>

          <nav className="flex flex-wrap gap-2">
            {siteConfig.nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navLinkClass(active)}
                >
                  {item.label}
                </Link>
              );
            })}

            {user ? (
              <Link
                href="/account"
                className={navLinkClass(
                  pathname === "/account" || pathname.startsWith("/account/"),
                )}
              >
                Mi cuenta
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {loading ? (
            <span className="text-white/60">Cargando...</span>
          ) : user ? (
            <>
              <span className="max-w-[220px] truncate text-white/70">
                {user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/auth/sign-up"
                className="rounded-lg bg-white px-3 py-2 font-medium text-black transition hover:scale-[1.02]"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}