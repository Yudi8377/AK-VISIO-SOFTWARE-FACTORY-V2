'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

const REQUEST_TIMEOUT_MS = 15000

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || `project-${Date.now()}`
}

function withTimeout<T>(promise: PromiseLike<T>, label: string, ms = REQUEST_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    Promise.resolve(promise).then(value => { window.clearTimeout(timer); resolve(value) }, error => { window.clearTimeout(timer); reject(error) })
  })
}

export default function Requests() {
  const [project, setProject] = useState('')
  const [text, setText] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function load() {
    try {
      const supabase = createClient()
      const { data: userData, error: authError } = await withTimeout(supabase.auth.getUser(), 'Authentication check')
      if (authError) throw authError
      if (!userData.user) {
        window.location.href = '/login'
        return
      }
      const { data, error } = await withTimeout(
        supabase.from('factory_requests').select('*').order('created_at', { ascending: false }).limit(50),
        'Request loading'
      )
      if (error) throw error
      setRows(data || [])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load requests')
    }
  }

  useEffect(() => { void load() }, [])

  async function save() {
    if (!project.trim() || !text.trim()) {
      setMessage('Project name and request are required')
      return
    }

    setBusy(true)
    setMessage('Saving…')

    try {
      const supabase = createClient()
      const { data: userData, error: authError } = await withTimeout(supabase.auth.getUser(), 'Authentication check')
      if (authError) throw authError
      if (!userData.user) {
        window.location.href = '/login'
        return
      }

      const userId = userData.user.id
      const slug = slugify(project)
      const { data: existingProject, error: projectLookupError } = await withTimeout(
        supabase.from('factory_projects').select('id').eq('owner_id', userId).eq('slug', slug).maybeSingle(),
        'Project lookup'
      )
      if (projectLookupError) throw projectLookupError

      let projectId = existingProject?.id
      if (!projectId) {
        const { data: newProject, error } = await withTimeout(
          supabase.from('factory_projects').insert({
            owner_id: userId,
            name: project.trim(),
            slug,
            description: `Factory project for ${project.trim()}`,
            status: 'draft',
            metadata: { source: 'request-workspace' },
          }).select('id').single(),
          'Project creation'
        )
        if (error) throw error
        if (!newProject?.id) throw new Error('Project creation returned no project ID')
        projectId = newProject.id
      }

      const { error: requestError } = await withTimeout(
        supabase.from('factory_requests').insert({
          project_id: projectId,
          owner_id: userId,
          title: project.trim(),
          prompt: text.trim(),
          status: 'draft',
          metadata: { source: 'web-ui' },
        }),
        'Request save'
      )
      if (requestError) throw requestError

      setText('')
      setMessage('Request saved')
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save request')
    } finally {
      setBusy(false)
    }
  }

  return <main className="shell"><header className="topbar"><div><strong>REQUESTS</strong><span> FACTORY WORKSPACE</span></div><Link href="/">Home</Link></header><section className="hero" style={{ gridTemplateColumns: '1fr' }}><div><p className="eyebrow">REQUEST INTAKE</p><h1 style={{ fontSize: 'clamp(40px,6vw,64px)' }}>Turn intent into a run.</h1><p className="lede">Create a project and persist an owned factory request. Authentication and RLS remain the authority for ownership.</p><input value={project} onChange={e => setProject(e.target.value)} placeholder="Project name" style={{ width: '100%', marginBottom: 12, padding: 16, borderRadius: 12, border: '1px solid #33405f', background: '#0c1220', color: '#eef3ff', fontSize: 16 }} /><textarea value={text} onChange={e => setText(e.target.value)} placeholder="Describe the software you want the factory to build…" style={{ width: '100%', minHeight: 160, padding: 18, borderRadius: 12, border: '1px solid #33405f', background: '#0c1220', color: '#eef3ff', fontSize: 16 }} /><div className="actions"><button onClick={() => void save()} disabled={busy} className="primary" style={{ border: 0 }}>{busy ? 'Saving…' : 'Save request'}</button>{message && <span role="status" aria-live="polite" style={{ marginLeft: 12, color: '#9eabc5' }}>{message}</span>}</div></div></section><section className="grid">{rows.map(r => <article className="card" key={r.id}><div className="cardtop"><h2>{r.title}</h2><span>{r.status}</span></div><p>{r.prompt}</p><small>{new Date(r.created_at).toLocaleString()}</small></article>)}</section></main>
}
