'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn, Menu, Plus, Search, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const hiddenTaskKeys = new Set(['listing', 'classified'])

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const navItems = useMemo(
    () => SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTaskKeys.has(task.key)).slice(0, 4).map((task) => ({ label: task.label, href: task.route })),
    []
  )

  const authLinks = session
    ? [{ label: 'Post Ad', href: '/create', strong: true as const }]
    : [
        { label: 'Login', href: '/login' },
        { label: 'Register', href: '/signup', outlined: true as const },
        { label: 'Post Ad', href: '/create', strong: true as const },
      ]

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-[var(--editable-nav-bg)]/95 text-[var(--editable-nav-text)] backdrop-blur-xl">
      <nav className="mx-auto flex min-h-[72px] w-full max-w-[var(--editable-container)] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <img src="/favicon.png" alt={SITE_CONFIG.name} className="h-8 w-8 object-contain" />
          <span className="text-[1.05rem] font-extrabold tracking-[-0.03em] text-white sm:text-[1.15rem]">{SITE_CONFIG.name}</span>
        </Link>

        <form action="/search" className="hidden min-w-0 flex-1 md:flex">
          <label className="flex h-11 w-full items-center overflow-hidden rounded-full border border-white/8 bg-[var(--editable-search-bg)]">
            <span className="flex h-full items-center px-4 text-[var(--slot4-soft-muted-text)]">
              <Search className="h-4 w-4" />
            </span>
            <input
              name="q"
              type="search"
              placeholder="Search ads..."
              className="min-w-0 flex-1 bg-transparent px-1 text-sm text-white outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
            />
            <button className="h-full min-w-[98px] bg-[var(--editable-cta-bg)] px-6 text-sm font-bold text-white transition hover:brightness-110">
              Search
            </button>
          </label>
        </form>

        <div className="hidden items-center gap-3 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold transition ${active ? 'text-white' : 'text-[var(--slot4-muted-text)] hover:text-white'}`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          {session ? (
            <>
              <button type="button" onClick={logout} className="text-sm font-semibold text-[var(--slot4-muted-text)] transition hover:text-white">
                Logout
              </button>
              <Link href="/create" className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[var(--editable-cta-bg)] px-5 text-sm font-bold text-white shadow-[0_12px_32px_rgba(29,84,109,0.32)] transition hover:brightness-110">
                <Plus className="h-4 w-4" /> Post Ad
              </Link>
            </>
          ) : (
            authLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.strong
                    ? 'inline-flex h-11 items-center gap-2 rounded-2xl bg-[var(--editable-cta-bg)] px-5 text-sm font-bold text-white shadow-[0_12px_32px_rgba(29,84,109,0.32)] transition hover:brightness-110'
                    : item.outlined
                      ? 'inline-flex h-11 items-center rounded-2xl border border-white/10 px-5 text-sm font-bold text-white transition hover:border-white/20'
                      : 'inline-flex h-11 items-center text-sm font-semibold text-[var(--slot4-muted-text)] transition hover:text-white'
                }
              >
                {item.strong ? <Plus className="h-4 w-4" /> : item.href === '/login' ? <LogIn className="mr-2 h-4 w-4" /> : item.href === '/signup' ? <UserPlus className="mr-2 h-4 w-4" /> : null}
                {item.label}
              </Link>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[var(--slot4-surface-bg)] text-white md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--editable-nav-bg)] px-4 py-4 md:hidden">
          <form action="/search" className="mb-4">
            <label className="flex h-11 items-center overflow-hidden rounded-full border border-white/8 bg-[var(--editable-search-bg)]">
              <span className="px-4 text-[var(--slot4-soft-muted-text)]">
                <Search className="h-4 w-4" />
              </span>
              <input name="q" type="search" placeholder="Search ads..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[var(--slot4-soft-muted-text)]" />
            </label>
          </form>
          <div className="grid gap-2">
            {[{ label: 'Home', href: '/' }, ...navItems, ...authLinks].map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active ? 'bg-white/8 text-white' : 'text-[var(--slot4-muted-text)] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            {session ? (
              <button type="button" onClick={logout} className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[var(--slot4-muted-text)] transition hover:bg-white/5 hover:text-white">
                Logout
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
