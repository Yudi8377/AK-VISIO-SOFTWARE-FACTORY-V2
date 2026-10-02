'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

const PRODUCTION_URL = 'https://ak-visio-software-factory-v2.dwahyudi8377.workers.dev'

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
    const redirectBase = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : PRODUCTION_URL
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectBase}/update-password`,
    })
    setBusy(false)
    if (error) setError(error.message)
    else setMessage('Jika akun terdaftar, email pengaturan ulang kata sandi telah dikirim. Periksa kotak masuk dan folder spam.')
  }

  return <main className="shell"><header className="topbar"><strong>AK VISIO <span>SOFTWARE FACTORY V2</span></strong><Link href="/login">Masuk</Link></header><section style={{maxWidth:520,margin:'80px auto'}}><p className="eyebrow">PEMULIHAN AKUN</p><h1 style={{fontSize:52}}>Atur ulang kata sandi.</h1><p className="lede">Masukkan email akun Anda. Supabase akan mengirim tautan pemulihan yang aman tanpa mengungkap apakah akun tersebut terdaftar.</p><form onSubmit={submit} style={{display:'grid',gap:12}}><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" autoComplete="email" style={{padding:15,borderRadius:10,border:'1px solid #33405f',background:'#0c1220',color:'#eef3ff'}}/><button disabled={busy} className="primary" style={{padding:14,border:0,borderRadius:10}}>{busy?'Mengirim…':'Kirim tautan reset'}</button></form>{message&&<p role="status">{message}</p>}{error&&<p role="alert">{error}</p>}</section></main>
}
