import Link from 'next/link'
import AuthNav from '@/components/auth-nav'

const modules = [
  ['Requests', 'Create, edit, search and execute factory requests.', '/requests'],
  ['Runs', 'Track pipeline stages, logs, artifacts and failures.', '/runs'],
  ['Projects', 'Create and manage generated projects and validation state.', '/projects'],
  ['Digital Presence', 'SEO research, social content and governed publishing.', '/digital-presence'],
  ['Repairs', 'Review bounded self-healing actions and history.', '/repairs'],
  ['Validation', 'Inspect release gates before go-live.', '/validation'],
  ['Audit', 'Follow important factory events.', '/audit'],
]

const stages = ['REQUEST', 'PLANNER', 'GENERATOR', 'TEST', 'SELF-HEAL', 'VALIDATOR', 'GO-LIVE']

export default function Home() {
  return <main className="factory-shell">
    <aside className="sidebar">
      <div className="brand-mark"><span>AK</span><div><strong>AK VISIO</strong><small>SOFTWARE FACTORY V2</small></div></div>
      <nav>
        <p>CONTROL CENTER</p>
        <Link className="nav-active" href="/">Overview</Link>
        <Link href="/requests">Requests</Link>
        <Link href="/runs">Runs</Link>
        <p>DELIVERY</p>
        <Link href="/projects">Projects</Link>
        <Link href="/digital-presence">Digital presence</Link>
        <Link href="/repairs">Repairs</Link>
        <Link href="/validation">Validation</Link>
        <p>GOVERNANCE</p>
        <Link href="/audit">Audit trail</Link>
      </nav>
      <div className="sidebar-footer"><i /> Factory online<div>V2 · Isolated environment</div></div>
    </aside>

    <section className="workspace">
      <header className="workspace-head">
        <div><span className="kicker">SOFTWARE FACTORY CONTROL PLANE</span><h1>Operations overview</h1></div>
        <div className="head-actions">
          <span className="system-status"><i /> Operational</span>
          <Link href="/requests" className="create-btn">+ New request</Link>
          <AuthNav />
        </div>
      </header>

      <section className="hero-panel">
        <div className="hero-copy">
          <span className="section-label">FACTORY READY</span>
          <h2>Operate the factory.<br/><em>Do not just read it.</em></h2>
          <p>Use the control plane to create projects, insert requests, continue the next pipeline stage, inspect runs, repair failures and validate releases.</p>
          <div className="hero-actions">
            <Link href="/projects" className="primary-action">Create project</Link>
            <Link href="/requests" className="secondary-action">Insert request</Link>
            <Link href="/runs" className="secondary-action">Next: inspect runs →</Link>
          </div>
          <div className="hero-meta"><span>PIPELINE</span><b>REQUEST → GO-LIVE</b></div>
        </div>
        <div className="pipeline-visual">{stages.map((x, i) => <div className={'stage ' + (i < 1 ? 'done' : i === 1 ? 'active' : '')} key={x}><div className="stage-node">{i < 1 ? '✓' : String(i + 1).padStart(2, '0')}</div><strong>{x}</strong></div>)}</div>
      </section>

      <section className="quick-actions">
        <div className="panel-head"><div><span className="section-label">QUICK ACTIONS</span><h3>What do you want to do?</h3></div></div>
        <div className="quick-action-grid">
          <Link href="/projects" className="quick-action"><b>+</b><div><strong>Insert project</strong><span>Create a new factory project and persist it in Supabase.</span></div><em>→</em></Link>
          <Link href="/requests" className="quick-action"><b>+</b><div><strong>Insert request</strong><span>Add the next build instruction to a project.</span></div><em>→</em></Link>
          <Link href="/requests" className="quick-action"><b>↻</b><div><strong>Update / continue</strong><span>Open the request workspace and continue the next action.</span></div><em>→</em></Link>
          <Link href="/validation" className="quick-action"><b>✓</b><div><strong>Validate release</strong><span>Inspect the gates before a go-live decision.</span></div><em>→</em></Link>
        </div>
      </section>

      <section className="metrics">
        <article><span>AUTHENTICATION</span><strong>READY</strong><small>Sign in / sign out controls enabled</small></article>
        <article><span>PROJECT WORKSPACE</span><strong>LIVE</strong><small>Insert and manage projects from Projects</small></article>
        <article><span>REQUEST WORKSPACE</span><strong>LIVE</strong><small>Insert and continue requests from Requests</small></article>
        <article><span>GO-LIVE GATES</span><strong>7</strong><small>Validation, audit and publishing controls</small></article>
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-head"><div><span className="section-label">NEXT OPERATIONS</span><h3>Continue the factory</h3></div><Link href="/requests">Open →</Link></div>
          <div className="events">
            <div><i className="active"/><div><strong>1 · Create or select a project</strong><p>Open Projects and insert the project that owns the next request.</p></div><Link className="event-action" href="/projects">Projects</Link></div>
            <div><i className="active"/><div><strong>2 · Insert the build request</strong><p>Open Requests, select a project and persist the next instruction.</p></div><Link className="event-action" href="/requests">Requests</Link></div>
            <div><i className="active"/><div><strong>3 · Continue through the pipeline</strong><p>Inspect Runs, Repairs and Validation as the request progresses.</p></div><Link className="event-action" href="/runs">Next</Link></div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><div><span className="section-label">SAFETY</span><h3>Production posture</h3></div><Link href="/audit">Audit →</Link></div>
          <div className="gate-list safety-list">
            <span>Authentication <b>AVAILABLE</b></span>
            <span>RLS ownership <b>ENFORCED</b></span>
            <span>External publishing <b>FAIL-CLOSED</b></span>
            <span>Provider binding <b>REQUIRED</b></span>
          </div>
        </div>
      </section>

      <section className="modules"><span className="section-label">FACTORY MODULES</span><div className="module-grid">{modules.map(([title, desc, href]) => <Link className="module" href={href} key={title}><div><span>{title}</span><b>↗</b></div><p>{desc}</p></Link>)}</div></section>
      <footer><span>AK VISIO Software Factory V2</span><span>Dedicated Supabase project · Strictly isolated from ADTRAN Realindo</span></footer>
    </section>
  </main>
}
