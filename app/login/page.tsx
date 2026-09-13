'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

const AUTH_TIMEOUT_MS = 15000

function withTimeout<T>(promise: PromiseLike<T>, label: string, ms = AUTH_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    Promise.resolve(promise).then(value => { window.clearTimeout(timer); resolve(value) }, error => { window.clearTimeout(timer); reject(error) })
  })
}

export default function Login(){
  const router=useRouter()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  async function submit(e:React.FormEvent){
    e.preventDefault();setBusy(true);setMessage('')
    try {
      const supabase=createClient()
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({email,password}),
        'Sign-in'
      )
      if(error) throw error
      if(!data.session?.user) throw new Error('Sign-in succeeded but no session was established')
      const { data: sessionData, error: sessionError } = await withTimeout(
        supabase.auth.getSession(),
        'Session verification'
      )
      if(sessionError) throw sessionError
      if(!sessionData.session?.user) throw new Error('Authentication session could not be persisted')
      router.replace('/requests')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in')
    } finally {
      setBusy(false)
    }
  }
  return <main className="shell"><header className="topbar"><strong>AK VISIO <span>SOFTWARE FACTORY V2</span></strong><Link href="/">Home</Link></header><section style={{maxWidth:520,margin:'80px auto'}}><p className="eyebrow">SECURE ACCESS</p><h1 style={{fontSize:52}}>Sign in.</h1><p className="lede">Supabase Auth establishes the identity used by RLS ownership policies.</p><form onSubmit={submit} style={{display:'grid',gap:12}}><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{padding:15,borderRadius:10,border:'1px solid #33405f',background:'#0c1220',color:'#eef3ff'}}/><input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" style={{padding:15,borderRadius:10,border:'1px solid #33405f',background:'#0c1220',color:'#eef3ff'}}/><button disabled={busy} className="primary" style={{padding:14,border:0,borderRadius:10}}>{busy?'Signing in…':'Sign in'}</button></form><div style={{marginTop:16}}><Link href="/forgot-password">Forgot password?</Link></div>{message&&<p role="alert">{message}</p>}</section></main>
}
