'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function UpdatePassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function establishRecoverySession() {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          if (active) setError(`Recovery link could not be verified: ${exchangeError.message}`)
          return
        }
        url.search = ''
        window.history.replaceState({}, document.title, url.pathname)
      } else {
        const hash = new URLSearchParams(url.hash.replace(/^#/, ''))
        const accessToken = hash.get('access_token')
        const refreshToken = hash.get('refresh_token')

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (sessionError) {
            if (active) setError(`Recovery session could not be established: ${sessionError.message}`)
            return
          }
          window.history.replaceState({}, document.title, url.pathname)
        }
      }

      const { data, error: sessionError } = await supabase.auth.getSession()
      if (!active) return
      if (sessionError) {
        setError(sessionError.message)
        return
      }
      if (data.session?.user) {
        setReady(true)
        return
      }
      setError('This recovery link is invalid or expired. Request a new password reset link.')
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true)
    })

    establishRecoverySession().catch((err) => {
      if (active) setError(err instanceof Error ? err.message : 'Unable to establish recovery session.')
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError('Passwords do not match.')

    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)

    if (error) return setError(error.message)
    setMessage('Password updated successfully. Redirecting to sign in…')
    window.setTimeout(() => router.replace('/login'), 1200)
  }

  return <main className="shell"><header className="topbar"><strong>AK VISIO <span>SOFTWARE FACTORY V2</span></strong><Link href="/login">Sign in</Link></header><section style={{maxWidth:520,margin:'80px auto'}}><p className="eyebrow">SECURE RECOVERY</p><h1 style={{fontSize:52}}>Choose a new password.</h1><p className="lede">Use this page only after opening the password recovery link from your email.</p>{ready?<form onSubmit={submit} style={{display:'grid',gap:12}}><input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password" autoComplete="new-password" style={{padding:15,borderRadius:10,border:'1px solid #33405f',background:'#0c1220',color:'#eef3ff'}}/><input required minLength={8} type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" style={{padding:15,borderRadius:10,border:'1px solid #33405f',background:'#0c1220',color:'#eef3ff'}}/><button disabled={busy} className="primary" style={{padding:14,border:0,borderRadius:10}}>{busy?'Updating…':'Update password'}</button></form>:<p>{error || 'Waiting for a valid password recovery session. Open the latest recovery email link again.'}</p>}{message&&<p role="status">{message}</p>}{error&&ready&&<p role="alert">{error}</p>}</section></main>
}
