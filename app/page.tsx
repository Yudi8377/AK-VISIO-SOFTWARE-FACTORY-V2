import Link from 'next/link'

const modules = [
  ['Requests','Create, edit, search and execute factory requests.','/requests'],
  ['Runs','Track pipeline stages, logs, artifacts and failures.','/runs'],
  ['Projects','Manage generated projects and validation state.','/projects'],
  ['Repairs','Review bounded self-healing actions and history.','/repairs'],
  ['Validation','Inspect release gates before go-live.','/validation'],
  ['Audit','Follow important factory events.','/audit'],
]

export default function Home(){return <main className="shell">
  <header className="topbar"><div><strong>AK VISIO</strong><span> SOFTWARE FACTORY V2</span></div><div className="status"><i/> Operational</div></header>
  <section className="hero"><div><p className="eyebrow">SOFTWARE FACTORY CONTROL PLANE</p><h1>Build. Test. Heal. Validate. Ship.</h1><p className="lede">A standalone, data-driven factory workspace for turning requests into validated software with observable execution.</p><div className="actions"><Link href="/requests" className="primary">Create request</Link><Link href="/runs" className="secondary">Open runs</Link></div></div><div className="pipeline">{['REQUEST','PLAN','GENERATE','TEST','HEAL','VALIDATE','GO-LIVE'].map((x,i)=><div key={x}><b>{String(i+1).padStart(2,'0')}</b><span>{x}</span></div>)}</div></section>
  <section className="grid">{modules.map(([title,desc,href])=><Link className="card" href={href} key={title}><div className="cardtop"><h2>{title}</h2><span>→</span></div><p>{desc}</p></Link>)}</section>
  <footer>V2 is isolated from ADTRAN Realindo · Dedicated Supabase project · Production-safe stage contracts</footer>
</main>}
