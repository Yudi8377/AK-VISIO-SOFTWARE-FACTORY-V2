import Link from 'next/link'

const keywordPlan = [
  ['TOFU', 'desain interior rumah', 'Informational'],
  ['TOFU', 'inspirasi interior rumah', 'Informational'],
  ['TOFU', 'interior minimalis', 'Informational'],
  ['MOFU', 'jasa desain interior Jakarta', 'Commercial'],
  ['MOFU', 'custom furniture Jakarta', 'Commercial'],
  ['MOFU', 'jasa kitchen set Jakarta', 'Commercial'],
  ['BOFU', 'konsultasi interior Jakarta', 'Transactional'],
  ['BOFU', 'harga jasa desain interior Jakarta', 'Transactional'],
  ['BOFU', 'jasa interior custom Jakarta', 'Transactional'],
  ['BOFU', 'desain interior kantor Jakarta', 'Commercial'],
]

const channels = [
  ['Instagram', 'Ready for connector', 'Buat profil + konten 30 hari'],
  ['Facebook', 'Ready for connector', 'Salinan halaman + antrean publikasi'],
  ['TikTok', 'Siap dihubungkan', 'Hook dan skrip konten singkat'],
  ['Pinterest', 'Siap dihubungkan', 'Papan + brief visual'],
  ['YouTube', 'Siap dihubungkan', 'Judul + deskripsi video'],
]

export default function DigitalPresencePage() {
  return <main className="factory-shell">
    <aside className="sidebar"><div className="brand-mark"><span>AK</span><div><strong>AK VISIO</strong><small>SOFTWARE FACTORY V2</small></div></div><nav><p>PUSAT KENDALI</p><Link href="/">Ikhtisar</Link><Link href="/requests">Permintaan</Link><Link href="/runs">Eksekusi</Link><p>DELIVERY</p><Link href="/projects">Proyek</Link><Link href="/digital-presence" className="nav-active">Kehadiran Digital</Link><Link href="/repairs">Perbaikan</Link><Link href="/validation">Validasi</Link><p>GOVERNANCE</p><Link href="/audit">Jejak Audit</Link></nav><div className="sidebar-footer"><i/> Factory aktif<div>V2 · Lingkungan terisolasi</div></div></aside>
    <section className="workspace"><header className="workspace-head"><div><span className="kicker">OTOMATISASI KEHADIRAN DIGITAL</span><h1>Riset. Buat. Publikasikan.</h1></div><div className="head-actions"><span className="system-status"><i/> Operational</span><Link href="/requests" className="create-btn">+ Permintaan baru</Link></div></header>
      <section className="hero-panel"><div className="hero-copy"><span className="section-label">BEBAN KERJA REFERENSI</span><h2>Forma Elan<br/><em>Kehadiran Digital</em></h2><p>Satu ruang kerja terkelola untuk riset SEO, pembuatan konten, kampanye sosial, dan publikasi berbasis connector di masa depan.</p><div className="hero-meta"><span>MODE: DEMONSTRASI</span><b>Siap dihubungkan</b></div></div><div className="pipeline-visual">{['BRIEF','RESEARCH','SEO','CONTENT','SOCIAL','APPROVAL','PUBLISH'].map((x,i)=><div className={'stage '+(i<5?'done':i===5?'active':'')} key={x}><div className="stage-node">{i<5?'✓':String(i+1).padStart(2,'0')}</div><strong>{x}</strong></div>)}</div></section>
      <section className="content-grid"><div className="panel"><div className="panel-head"><div><span className="section-label">STRATEGI SEO</span><h3>Kelompok kata kunci</h3></div><span>10 targets</span></div><div className="events">{keywordPlan.map(([stage,keyword,intent])=><div key={keyword}><i className={stage === 'BOFU' ? 'active' : 'success'}/><div><strong>{keyword}</strong><p>{stage} · {intent}</p></div></div>)}</div></div><div className="panel"><div className="panel-head"><div><span className="section-label">CONNECTOR SOSIAL</span><h3>Kesiapan publikasi</h3></div><span>0 akun terhubung</span></div><div className="gate-list">{channels.map(([name,status,desc])=><span key={name}>{name}<b>{status}</b><small>{desc}</small></span>)}</div></div></section>
      <section className="content-grid"><div className="panel"><div className="panel-head"><div><span className="section-label">KEBIJAKAN OTOMATISASI</span><h3>Mode eksekusi aman</h3></div></div><div className="gate-list"><span>AUTO <b>Generasi internal</b><small>SEO metadata, copy, schema, content plans, validation.</small></span><span>SEMI-AUTO <b>Persetujuan diperlukan</b><small>Publikasi eksternal setelah otorisasi connector dan pemeriksaan kebijakan.</small></span><span>MANUAL <b>Tindakan manusia</b><small>Kepemilikan akun, otorisasi platform baru, dan tindakan destruktif.</small></span></div></div><div className="panel"><div className="panel-head"><div><span className="section-label">SKEMA CARA KERJA</span><h3>Alur konten</h3></div></div><div className="gate-list"><span>01 <b>Tentukan audiens</b></span><span>02 <b>Pilih topik</b></span><span>03 <b>Riset kata kunci</b></span><span>04 <b>Bangun konten</b></span><span>05 <b>Tinjau SEO</b></span><span>06 <b>Publikasikan & pantau</b></span></div></div></section>
      <section className="modules"><span className="section-label">HASIL FACTORY</span><div className="module-grid"><Link className="module" href="/requests"><div><span>Situs web</span><b>↗</b></div><p>Buat situs bisnis lengkap dari brief yang sama.</p></Link><Link className="module" href="/requests"><div><span>Riset SEO</span><b>↗</b></div><p>Simpan kelompok kata kunci dan bukti SERP dari provider pencarian yang disetujui.</p></Link><Link className="module" href="/requests"><div><span>Kampanye sosial</span><b>↗</b></div><p>Buat konten khusus kanal dan antrekan untuk publikasi terkelola.</p></Link></div></section>
      <footer><span>AK VISIO Software Factory V2</span><span>Kehadiran Digital Automation · Tidak ada akun eksternal yang dibuat tanpa otorisasi</span></footer>
    </section>
  </main>
}
