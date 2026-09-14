import Link from 'next/link'
import AuthNav from '@/components/auth-nav'
import styles from './home.module.css'

const stages = [
  ['01', 'Request'], ['02', 'Plan'], ['03', 'Generate'], ['04', 'Test'], ['05', 'Heal'], ['06', 'Validate'], ['07', 'Go-live'],
]

const modules = [
  ['Requests', 'Create, update, search and continue build instructions.', '/requests', '01'],
  ['Runs', 'Follow execution, stages, logs, artifacts and failures.', '/runs', '02'],
  ['Projects', 'Create and manage isolated factory projects.', '/projects', '03'],
  ['Digital presence', 'Research SEO, plan content and govern publishing.', '/digital-presence', '04'],
  ['Repairs', 'Review bounded self-healing actions and outcomes.', '/repairs', '05'],
  ['Validation', 'Check release gates before a go-live decision.', '/validation', '06'],
  ['Audit trail', 'Trace important factory and governance events.', '/audit', '07'],
]

export default function Home() {
  return <main className="factory-shell">
    <aside className="sidebar">
      <div className="brand-mark"><span>AK</span><div><strong>AK VISIO</strong><small>SOFTWARE FACTORY V2</small></div></div>
      <nav>
        <p>COMMAND</p><Link className="nav-active" href="/">Overview</Link><Link href="/requests">Requests</Link><Link href="/runs">Runs</Link>
        <p>DELIVERY</p><Link href="/projects">Projects</Link><Link href="/digital-presence">Digital presence</Link><Link href="/repairs">Repairs</Link><Link href="/validation">Validation</Link>
        <p>GOVERNANCE</p><Link href="/audit">Audit trail</Link>
      </nav>
      <div className="sidebar-footer"><i /> Factory online<div>V2 · Isolated environment</div></div>
    </aside>

    <section className="workspace">
      <header className="workspace-head">
        <div><span className="kicker">AK VISIO / COMMAND CENTER</span><h1>Build. Repair. Validate. Ship.</h1></div>
        <div className="head-actions"><span className="system-status"><i /> Operational</span><AuthNav /></div>
      </header>

      <section className={styles.commandHero}>
        <div className={styles.commandCopy}>
          <div className={styles.eyebrow}><span>FACTORY CONTROL PLANE</span><b>READY</b></div>
          <h2>Turn an idea into a<br/><em>verified release.</em></h2>
          <p>One place to create the project, insert the request, continue execution, repair failures and verify every gate before go-live.</p>
          <div className={styles.heroActions}>
            <Link href="/projects" className={styles.primaryAction}><strong>＋</strong> Create project</Link>
            <Link href="/requests" className={styles.secondaryAction}>Insert request <span>→</span></Link>
          </div>
          <div className={styles.heroNote}><span>7 stages</span><span>Supabase persistence</span><span>RLS enforced</span></div>
        </div>
        <div className={styles.pipelineCard}>
          <div className={styles.pipelineHeader}><span>LIVE WORKFLOW</span><Link href="/runs">Open runs →</Link></div>
          <div className={styles.pipeline}>{stages.map(([number, label], index) => <div className={styles.stage} key={number}>
            <div className={`${styles.stageNode} ${index === 0 ? styles.done : index === 1 ? styles.current : ''}`}>{index === 0 ? '✓' : number}</div>
            <span>{label}</span>
            {index < stages.length - 1 && <i />}
          </div>)}</div>
          <div className={styles.pipelineFooter}><span><i /> Entry point</span><b>REQUEST → GO-LIVE</b></div>
        </div>
      </section>

      <section className={styles.operatorDeck}>
        <div className={styles.sectionHeading}><div><span>OPERATOR DECK</span><h3>What happens next?</h3></div><Link href="/requests">Open workspace →</Link></div>
        <div className={styles.operatorGrid}>
          <Link href="/projects" className={styles.operatorCard}><div className={styles.operatorNumber}>01</div><div><strong>Create or select project</strong><p>Define the project that owns the next build.</p></div><span>→</span></Link>
          <Link href="/requests" className={styles.operatorCard}><div className={styles.operatorNumber}>02</div><div><strong>Insert a request</strong><p>Write the instruction the factory must execute.</p></div><span>→</span></Link>
          <Link href="/requests" className={styles.operatorCard}><div className={styles.operatorNumber}>03</div><div><strong>Update / continue</strong><p>Continue the request from its current state.</p></div><span>→</span></Link>
          <Link href="/validation" className={styles.operatorCard}><div className={styles.operatorNumber}>04</div><div><strong>Validate and go-live</strong><p>Review gates before release and publishing.</p></div><span>→</span></Link>
        </div>
      </section>

      <section className={styles.statusStrip}>
        <div><span>AUTH</span><strong>AVAILABLE</strong><small>Sign in / sign out</small></div>
        <div><span>DATA</span><strong>PROTECTED</strong><small>Owner-scoped RLS</small></div>
        <div><span>EXECUTION</span><strong>CONTROLLED</strong><small>Fail-closed runtime</small></div>
        <div><span>PUBLISHING</span><strong>GATED</strong><small>Approval + provider binding</small></div>
      </section>

      <section className={styles.moduleSection}>
        <div className={styles.sectionHeading}><div><span>FACTORY MODULES</span><h3>Every operation has a destination</h3></div></div>
        <div className={styles.moduleGrid}>{modules.map(([title, desc, href, number]) => <Link className={styles.module} href={href} key={title}><div><small>{number}</small><b>↗</b></div><strong>{title}</strong><p>{desc}</p></Link>)}</div>
      </section>

      <footer><span>AK VISIO Software Factory V2</span><span>Dedicated Supabase project · Strictly isolated from ADTRAN Realindo</span></footer>
    </section>
  </main>
}
