'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const box: React.CSSProperties = { fontSize: 10, textDecoration: 'none', border: '1px solid #253149', background: '#0c121e', color: '#b9c5db', borderRadius: 8, padding: '10px 11px' }
const wrap: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 7 }

export default function AuthNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [email, setEmail] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let active = true
    supabase.auth.getUser().then(({ data }) => { if (active) { setEmail(data.user?.email ?? null); setReady(true) } })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (active) { setEmail(session?.user?.email ?? null); setReady(true) } })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
    router.refresh()
  }

  if (!ready) return <div style={wrap} aria-live="polite"><span style={{ ...box, color: '#64728e' }}>Checking access…</span></div>
  if (!email) return <div style={wrap}><Link href="/login" style={pathname === '/login' ? { ...box, color: '#fff', borderColor: '#7284ff' } : box}>Sign in</Link></div>

  return <div style={wrap}>
    <Link href="/requests" style={{ ...box, maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#7f8da7' }}>{email}</Link>
    <Link href="/requests" style={box}>Control center</Link>
    <button type="button" onClick={signOut} style={{ ...box, fontFamily: 'inherit', cursor: 'pointer' }}>Sign out</button>
  </div>
}
