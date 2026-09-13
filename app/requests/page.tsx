'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function Requests(){
  const supabase=createClient(); const [text,setText]=useState(''); const [rows,setRows]=useState<any[]>([]); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('')
  async function load(){const {data,error}=await supabase.from('factory_requests').select('*').order('created_at',{ascending:false}).limit(50); if(error)setMessage(error.message); else setRows(data||[])}
  useEffect(()=>{load()},[])
  async function save(){if(!text.trim())return; setBusy(true);setMessage(''); const {data:userData}=await supabase.auth.getUser(); if(!userData.user){window.location.href='/login';return} const {error}=await supabase.from('factory_requests').insert({request_text:text.trim(),status:'DRAFT',owner_id:userData.user.id}); setBusy(false); if(error)setMessage(error.message);else{setText('');setMessage('Request saved');load()}}
  return <main className="shell"><header className="topbar"><div><strong>REQUESTS</strong><span> FACTORY WORKSPACE</span></div><Link href="/">Home</Link></header><section className="hero" style={{gridTemplateColumns:'1fr'}}><div><p className="eyebrow">REQUEST INTAKE</p><h1 style={{fontSize:'clamp(40px,6vw,64px)'}}>Turn intent into a run.</h1><p className="lede">Create and persist a factory request. Authentication and RLS remain the authority for ownership.</p><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Describe the software you want the factory to build…" style={{width:'100%',minHeight:160,padding:18,borderRadius:12,border:'1px solid #33405f',background:'#0c1220',color:'#eef3ff',fontSize:16}}/><div className="actions"><button onClick={save} disabled={busy} className="primary" style={{border:0}}>{busy?'Saving…':'Save request'}</button>{message&&<span style={{marginLeft:12,color:'#9eabc5'}}>{message}</span>}</div></div></section><section className="grid">{rows.map(r=><article className="card" key={r.id}><div className="cardtop"><h2>{r.title||'Untitled request'}</h2><span>{r.status}</span></div><p>{r.request_text}</p><small>{new Date(r.created_at).toLocaleString()}</small></article>)}</section></main>
}
