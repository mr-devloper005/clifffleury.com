'use client'

import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const hiddenTaskKeys = new Set(['listing', 'classified'])

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTaskKeys.has(task.key)).slice(0, 3)
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="mt-auto border-t border-[var(--editable-border)] bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr_0.9fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 text-white">
              <img src="/favicon.png" alt={SITE_CONFIG.name} className="h-8 w-8 object-contain" />
              <span className="text-[1.05rem] font-extrabold tracking-[-0.03em]">{SITE_CONFIG.name}</span>
            </Link>
            <p className="mt-5 max-w-sm text-base text-[var(--slot4-muted-text)]">Discover listings, useful services, and fresh opportunities in one polished marketplace.</p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">Quick Links</h3>
            <div className="mt-6 grid gap-4">
              <Link href="/" className="text-base text-[var(--slot4-muted-text)] transition hover:text-white">Home</Link>
              {taskLinks.map((task) => (
                <Link key={task.key} href={task.route} className="text-base text-[var(--slot4-muted-text)] transition hover:text-white">
                  {task.label}
                </Link>
              ))}
              <Link href="/create" className="text-base text-[var(--slot4-muted-text)] transition hover:text-white">Post an Ad</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">Support</h3>
            <div className="mt-6 grid gap-4">
              <Link href="/about" className="text-base text-[var(--slot4-muted-text)] transition hover:text-white">About Us</Link>
              <Link href="/contact" className="text-base text-[var(--slot4-muted-text)] transition hover:text-white">Contact</Link>
              <Link href="/search" className="text-base text-[var(--slot4-muted-text)] transition hover:text-white">Browse</Link>
              {session ? (
                <button type="button" onClick={logout} className="text-left text-base text-[var(--slot4-muted-text)] transition hover:text-white">
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/login" className="text-base text-[var(--slot4-muted-text)] transition hover:text-white">Login</Link>
                  <Link href="/signup" className="text-base text-[var(--slot4-muted-text)] transition hover:text-white">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--editable-border)] pt-8 text-center text-sm text-[var(--slot4-soft-muted-text)]">
          &copy; {year} {SITE_CONFIG.name}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
