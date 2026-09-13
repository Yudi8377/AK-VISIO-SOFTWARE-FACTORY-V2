'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

function slugify(value:string){
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70) || `project-${Date.now()}`
}

export default function Requests(){
  const supabase=createClient()
  const [project,setProject]=useState('')
  const [text,setText]=useState('')
  const [rows,setRows]=useState<any[]>([])
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')

  async function load(){
    const {data,error}=await supabase.from('factory_requests').select('*').order('created_at',{ascending:false}).limit(50)
    if(error)setMessage(error.message); else setRows(data||[])
  }
  useEffect(()=>{load()},[])

  async function save(){
    if(!project.trim() || !text.trim()){setMessage('Project name and request are required');return}
    setBusy(true); setMessage('')
    const {data:userData}=await supabase.auth.getUser()
    if(!userData.user){window.location.href='/login';return}
    const userId=userData.user.id
    const {data:existingProject,error:projectLookupError}=await supabase.from('factory_projects').select('id').eq('owner_id',userId).eq('slug',slugify(project)).maybeSingle()
    if(projectLookupError){setBusy(false);setMessage(projectLookupError.message);return}
    let projectId=existingProject?.id
    if(!projectId){
      const {data:newProject,error}=await supabase.from('factory_projects').insert({owner_id:userId,name:project.trim(),slug:slugify(project),description:`Factory project for ${project.trim()}`,status:'draft',metadata:{source:'request-workspace'}}).select('id').single()
      if(error){setBusy(false);setMessage(error.message);return}
      projectId=newProject.id
    }
    const {error}=await supabase.from('factory_requests').insert({project_id:projectId,owner_id:userId,title:project.trim(),prompt:text.trim(),status:'draft',metadata:{source:'web-ui'}})
    setBusy(false)
    if(error)setMessage(error.message)
    else{setText('');setMessage('Request saved');load()}
  }

  return <main className="shell"><header className="topbar"><div><strong>REQUESTS</strong><span> FACTORY WORKSPACE</span></div><Link href="/">Home</Link></header><section className="hero" style={{gridTemplateColumns:'1fr'}}><div><p className="eyebrow">REQUEST INTAKE</p><h1 style={{fontSize:'clamp(40px,6vw,64px)'}}>Turn intent into a run.</h1><p className="lede">Create a project and persist an owned factory request. Authentication and RLS remain the authority for ownership.</p><input value={project} onChange={e=>setProject(e.target.value)} placeholder="Project name" style={{width:'100%',marginBottom:12,padding:16,borderRadius:12,border:'1px solid #33405f',background:'#0c1220',color:'#eef3ff',fontSize:16}}/><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Describe the software you want the factory to build…" style={{width:'100%',minHeight:160,padding:18,borderRadius:12,border:'1px solid #33405f',background:'#0c1220',color:'#eef3ff',fontSize:16}}/><div className="actions"><button onClick={save} disabled={busy} className="primary" style={{border:0}}>{busy?'Saving…':'Save request'}</button>{message&&<span style={{marginLeft:12,color:'#9eabc5'}}>{message}</span>}</div></div></section><section className="grid">{rows.map(r=><article className="card" key={r.id}><div className="cardtop"><h2>{r.title}</h2><span>{r.status}</span></div><p>{r.prompt}</p><small>{new Date(r.created_at).toLocaleString()}</small></article>)}</section></main>
}
