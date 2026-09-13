'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type Row = Record<string, unknown>

type Props = {
  title: string
  eyebrow: string
  description: string
  table: string
  columns: string[]
  limit?: number
}

export default function FactoryTable({ title, eyebrow, description, table, columns, limit = 100 }: Props) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        window.location.href = '/login'
        return
      }
      const { data, error } = await supabase.from(table).select('*').limit(limit)
      if (!mounted) return
      if (error) setMessage(error.message)
      else setRows((data || []) as Row[])
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [table, limit])

  return <main className="shell">
    <header className="topbar"><div><strong>{title.toUpperCase()}</strong><span> FACTORY WORKSPACE</span></div><Link href="/">Overview</Link></header>
    <section className="hero" style={{ gridTemplateColumns: '1fr' }}>
      <div><p className="eyebrow">{eyebrow}</p><h1 style={{ fontSize: 'clamp(40px,6vw,64px)' }}>{title}</h1><p className="lede">{description}</p></div>
    </section>
    <section className="panel" style={{ overflowX: 'auto' }}>
      <div className="panel-head"><div><span className="section-label">LIVE DATA</span><h3>{rows.length} records</h3></div><Link href="/requests">Create request →</Link></div>
      {message && <p>{message}</p>}
      {loading ? <p>Loading secure workspace…</p> : rows.length === 0 ? <p>No records yet. The workspace is ready for authenticated factory data.</p> : <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr>{columns.map(c => <th key={c} style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #26324b' }}>{c}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={String(row.id ?? i)}>{columns.map(c => <td key={c} style={{ padding: 12, borderBottom: '1px solid #19243a', verticalAlign: 'top' }}>{String(row[c] ?? '—')}</td>)}</tr>)}</tbody></table>}
    </section>
  </main>
}
