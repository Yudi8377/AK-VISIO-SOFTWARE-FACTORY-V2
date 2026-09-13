'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

const SITE_URL = 'https://ak-visio-software-factory-v2.dwahyudi8377.workers.dev'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/update-password`,
    })
    setBusy(false)
    if (error) setError(error.message)
    else setMessage('If the account exists, a password reset email has been sent. Check your inbox and spam folder.')
  }

  return <main className="shell"><header className="topbar"><strong>AK VISIO <span>SOFTWARE FACTORY V2</span></strong><Link href="/login">Sign in</Link></header><section style={{maxWidth:520,margin:'80px auto'}}><p className="eyebrow">ACCOUNT RECOVERY</p><h1 style={{fontSize:52}}>Reset password.</h1><p className="lede">Enter your account email. Supabase will send a secure recovery link without revealing whether an account exists.</p><form onSubmit={submit} style={{display:'grid',gap:12}}><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" autoComplete="email" style={{padding:15,borderRadius:10,border:'1px solid #33405f',background:'#0c1220',color:'#eef3ff'}}/><button disabled={busy} className="primary" style={{padding:14,border:0,borderRadius:10}}>{busy?'Sending…':'Send reset link'}</button></form>{message&&<p role="status">{message}</p>}{error&&<p role="alert">{error}</p>}</section></main>
}
