import Link from 'next/link'

export const dynamicParams = false

export function generateStaticParams() {
  return []
}

export default function RunDetail() {
  return <main className="shell"><header className="topbar"><strong>RUN DETAIL</strong><Link href="/runs">Runs</Link></header><section className="hero" style={{gridTemplateColumns:'1fr'}}><div><p className="eyebrow">EXECUTION DETAIL</p><h1>Run details are server-backed.</h1><p className="lede">The static GitHub Pages preview intentionally excludes arbitrary dynamic run URLs. Production hosting exposes this route with live run, stage, artifact, repair and validation data.</p></div></section></main>
}
