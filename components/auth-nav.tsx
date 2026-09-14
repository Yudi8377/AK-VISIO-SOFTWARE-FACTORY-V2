'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function AuthNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [email, setEmail] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      setEmail(data.user?.email ?? null)
      setReady(true)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setEmail(session?.user?.email ?? null)
      setReady(true)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
    router.refresh()
  }

  if (!ready) {
    return <div className="auth-actions" aria-live="polite"><span className="auth-loading">Checking access…</span></div>
  }

  if (!email) {
    return (
      <div className="auth-actions">
        <Link href="/login" className={pathname === '/login' ? 'auth-link active' : 'auth-link'}>Sign in</Link>
      </div>
    )
  }

  return (
    <div className="auth-actions">
      <Link href="/requests" className="auth-user">{email}</Link>
      <Link href="/requests" className="auth-link">Control center</Link>
      <button type="button" onClick={signOut} className="auth-link auth-button">Sign out</button>
    </div>
  )
}
