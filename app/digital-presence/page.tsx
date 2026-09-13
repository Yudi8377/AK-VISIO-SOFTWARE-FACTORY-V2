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
  ['Instagram', 'Ready for connector', 'Generate profile + 30-day content'],
  ['Facebook', 'Ready for connector', 'Page copy + publishing queue'],
  ['TikTok', 'Connector-ready', 'Short-form hooks + scripts'],
  ['Pinterest', 'Connector-ready', 'Boards + visual briefs'],
  ['YouTube', 'Connector-ready', 'Video titles + descriptions'],
]

export default function DigitalPresencePage() {
  return <main className="factory-shell">
    <aside className="sidebar"><div className="brand-mark"><span>AK</span><div><strong>AK VISIO</strong><small>SOFTWARE FACTORY V2</small></div></div><nav><p>CONTROL CENTER</p><Link href="/">Overview</Link><Link href="/requests">Requests</Link><Link href="/runs">Runs</Link><p>DELIVERY</p><Link href="/projects">Projects</Link><Link href="/digital-presence" className="nav-active">Digital presence</Link><Link href="/repairs">Repairs</Link><Link href="/validation">Validation</Link><p>GOVERNANCE</p><Link href="/audit">Audit trail</Link></nav><div className="sidebar-footer"><i/> Factory online<div>V2 · Isolated environment</div></div></aside>
    <section className="workspace"><header className="workspace-head"><div><span className="kicker">DIGITAL PRESENCE AUTOMATION</span><h1>Research. Create. Publish.</h1></div><div className="head-actions"><span className="system-status"><i/> Operational</span><Link href="/requests" className="create-btn">+ New request</Link></div></header>
      <section className="hero-panel"><div className="hero-copy"><span className="section-label">REFERENCE WORKLOAD</span><h2>Forma Elan<br/><em>Digital Presence</em></h2><p>One governed workspace for SEO research, content generation, social campaigns and future connector-based publishing.</p><div className="hero-meta"><span>MODE: DEMONSTRATION</span><b>Connector-ready</b></div></div><div className="pipeline-visual">{['BRIEF','RESEARCH','SEO','CONTENT','SOCIAL','APPROVAL','PUBLISH'].map((x,i)=><div className={'stage '+(i<5?'done':i===5?'active':'')} key={x}><div className="stage-node">{i<5?'✓':String(i+1).padStart(2,'0')}</div><strong>{x}</strong></div>)}</div></section>
      <section className="content-grid"><div className="panel"><div className="panel-head"><div><span className="section-label">SEO STRATEGY</span><h3>Keyword clusters</h3></div><span>10 targets</span></div><div className="events">{keywordPlan.map(([stage,keyword,intent])=><div key={keyword}><i className={stage === 'BOFU' ? 'active' : 'success'}/><div><strong>{keyword}</strong><p>{stage} · {intent}</p></div></div>)}</div></div><div className="panel"><div className="panel-head"><div><span className="section-label">SOCIAL CONNECTORS</span><h3>Publishing readiness</h3></div><span>0 accounts connected</span></div><div className="gate-list">{channels.map(([name,status,desc])=><span key={name}>{name}<b>{status}</b><small>{desc}</small></span>)}</div></div></section>
      <section className="content-grid"><div className="panel"><div className="panel-head"><div><span className="section-label">AUTOMATION POLICY</span><h3>Safe execution modes</h3></div></div><div className="gate-list"><span>AUTO <b>Internal generation</b><small>SEO metadata, copy, schema, content plans, validation.</small></span><span>SEMI-AUTO <b>Approval required</b><small>External publishing after connector authorization and policy checks.</small></span><span>MANUAL <b>Human action</b><small>Account ownership, new platform authorization and destructive actions.</small></span></div></div><div className="panel"><div className="panel-head"><div><span className="section-label">HOW-TO SCHEMA</span><h3>Content workflow</h3></div></div><div className="gate-list"><span>01 <b>Define audience</b></span><span>02 <b>Choose topic</b></span><span>03 <b>Research keywords</b></span><span>04 <b>Build content</b></span><span>05 <b>Review SEO</b></span><span>06 <b>Publish & monitor</b></span></div></div></section>
      <section className="modules"><span className="section-label">FACTORY OUTPUT</span><div className="module-grid"><Link className="module" href="/requests"><div><span>Website</span><b>↗</b></div><p>Generate a complete business website from the same brief.</p></Link><Link className="module" href="/requests"><div><span>SEO research</span><b>↗</b></div><p>Persist keyword clusters and SERP evidence from an approved search provider.</p></Link><Link className="module" href="/requests"><div><span>Social campaign</span><b>↗</b></div><p>Generate channel-specific content and queue it for governed publishing.</p></Link></div></section>
      <footer><span>AK VISIO Software Factory V2</span><span>Digital Presence Automation · No external accounts are created without authorization</span></footer>
    </section>
  </main>
}
