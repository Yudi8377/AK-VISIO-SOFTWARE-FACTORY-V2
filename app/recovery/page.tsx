'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

type Incident = {
  id: string
  incidentKey: string
  organizationId: string
  environment: string
  currentDeploymentId: string
  targetDeploymentId: string
  status: 'detected' | 'recovering' | 'recovered' | 'escalated' | 'suppressed'
  attemptCount: number
  maxPercobaan: number
  cooldownUntil: string | null
  leaseUntil: string | null
  lastRecoveryId: string | null
  lastError: string | null
  detectedAt: string
  startedAt: string | null
  resolvedAt: string | null
  updatedAt: string
}

type Summary = Record<'total' | 'detected' | 'recovering' | 'recovered' | 'escalated' | 'suppressed', number>
const initialSummary: Summary = { total: 0, detected: 0, recovering: 0, recovered: 0, escalated: 0, suppressed: 0 }

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function statusLabel(status: Incident['status']) { const labels: Record<Incident['status'], string> = { detected: 'TERDETEKSI', recovering: 'MEMULIHKAN', recovered: 'DIPULIHKAN', escalated: 'DIESKALASIKAN', suppressed: 'DITAHAN' }; return labels[status] }

export default function Recovery() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [summary, setSummary] = useState<Summary>(initialSummary)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState('')

  const load = useCallback(async () => {
    setMessage('')
    const query = '/api/factory/recovery-incidents?limit=100' + (filter ? '&status=' + encodeURIComponent(filter) : '')
    const response = await fetch(query, { cache: 'no-store' })
    if (response.status === 401) { window.location.assign('/login'); return }
    const body = await response.json().catch(() => ({}))
    if (!response.ok) { setMessage(body.error || 'Tidak dapat memuat insiden pemulihan'); setLoading(false); return }
    setIncidents(body.incidents || [])
    setSummary(body.summary || initialSummary)
    setLoading(false)
  }, [filter])

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => void load(), 30000)
    return () => window.clearInterval(timer)
  }, [load])

  return <main className="shell">
    <header className="topbar">
      <div><strong>SELF-HEALING</strong><span> KENDALI INSIDEN</span></div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Link href="/">Ikhtisar</Link><Link href="/repairs">Perbaikan</Link></div>
    </header>

    <section className="hero" style={{ gridTemplateColumns: '1fr' }}>
      <div>
        <p className="eyebrow">OBSERVABILITAS PEMULIHAN PRODUKSI</p>
        <h1 style={{ fontSize: 'clamp(40px,6vw,64px)' }}>Kendali Insiden</h1>
        <p className="lede">Visibilitas berdasarkan pemilik atas status pemulihan otomatis, percobaan, cooldown, lineage verifikasi, dan eskalasi. Eksekusi pemulihan tetap hanya melalui trusted secret.</p>
      </div>
    </section>

    <section className="panel">
      <div className="panel-head">
        <div><span className="section-label">RINGKASAN INSIDEN</span><h3>{summary.total} insiden ditampilkan</h3></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ background: '#0c121e', color: '#b9c5db', border: '1px solid #26324b', borderRadius: 8, padding: '9px 10px' }}>
            <option value="">Semua status</option><option value="detected">Terdeteksi</option><option value="recovering">Sedang memulihkan</option><option value="recovered">Berhasil dipulihkan</option><option value="suppressed">Ditekan</option><option value="escalated">Dieskalasikan</option>
          </select>
          <button type="button" onClick={() => void load()} style={{ background: '#121b2b', color: '#d9e2f4', border: '1px solid #2c3a57', borderRadius: 8, padding: '9px 12px', cursor: 'pointer' }}>Segarkan</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10, marginBottom: 22 }}>
        {(['recovering','suppressed','escalated','recovered'] as const).map(key => <div key={key} style={{ border: '1px solid #24314a', borderRadius: 10, padding: 14, background: '#0b111d' }}>
          <small style={{ color: '#6f7f9d' }}>{key.toUpperCase()}</small><strong style={{ display: 'block', fontSize: 28, marginTop: 4 }}>{summary[key]}</strong>
        </div>)}
      </div>

      {message && <p role="alert">{message}</p>}
      {loading ? <p>Memuat kendali insiden aman…</p> : incidents.length === 0 ? <p>Tidak ada insiden pemulihan yang sesuai dengan status yang dipilih.</p> : <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Status','Lingkungan','Percobaan','Saat ini','Target','Kesalahan terakhir','Diperbarui'].map(c => <th key={c} style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #26324b', whiteSpace: 'nowrap' }}>{c}</th>)}</tr></thead>
          <tbody>{incidents.map(item => <tr key={item.id}>
            <td style={{ padding: 12, borderBottom: '1px solid #19243a' }}><strong>{statusLabel(item.status)}</strong><div style={{ color: '#65738d', fontSize: 11 }}>{item.incidentKey}</div></td>
            <td style={{ padding: 12, borderBottom: '1px solid #19243a' }}>{item.environment}<div style={{ color: '#65738d', fontSize: 11 }}>{item.organizationId}</div></td>
            <td style={{ padding: 12, borderBottom: '1px solid #19243a' }}>{item.attemptCount} / {item.maxPercobaan}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #19243a', fontFamily: 'monospace', fontSize: 11 }}>{item.currentDeploymentId}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #19243a', fontFamily: 'monospace', fontSize: 11 }}>{item.targetDeploymentId}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #19243a', maxWidth: 320, color: item.lastError ? '#d9a7a7' : '#65738d' }}>{item.lastError || 'Tidak ada'}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #19243a', whiteSpace: 'nowrap' }}>{formatDate(item.updatedAt)}</td>
          </tr>)}</tbody>
        </table>
      </div>}
      <p style={{ color: '#596983', fontSize: 11, marginTop: 18 }}>Pembaruan otomatis: 30 detik · Eksekusi pemulihan tidak tersedia sebagai aksi dari dashboard ini.</p>
    </section>
  </main>
}
