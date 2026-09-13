---
layout: null
title: AK VISIO Software Factory V2
---

<style>
*{box-sizing:border-box}html,body{margin:0;background:#07111f;color:#e7eef8;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}body{min-height:100vh}.shell{display:flex;min-height:100vh}.side{width:248px;background:#091522;border-right:1px solid #1b2b3d;padding:24px 16px;position:fixed;inset:0 auto 0 0}.brand{font-weight:800;font-size:18px;letter-spacing:-.02em;padding:0 10px 26px}.brand span{display:block;color:#7f93a9;font-size:11px;font-weight:600;letter-spacing:.12em;margin-top:5px}.nav{display:grid;gap:5px}.nav a{color:#8fa2b7;text-decoration:none;padding:11px 12px;border-radius:9px;font-size:13px}.nav a.active,.nav a:hover{background:#132235;color:#fff}.side-foot{position:absolute;left:20px;right:20px;bottom:22px;color:#64788e;font-size:10px;line-height:1.6}.main{margin-left:248px;width:calc(100% - 248px);padding:28px 34px 42px}.top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:28px}.eyebrow{color:#7e95ad;font-size:11px;text-transform:uppercase;letter-spacing:.16em;font-weight:700}.title{font-size:30px;font-weight:800;letter-spacing:-.04em;margin:7px 0 5px}.sub{color:#8498ad;font-size:13px}.live{display:flex;align-items:center;gap:8px;border:1px solid #24405a;background:#0c1c2b;border-radius:999px;padding:8px 12px;color:#b8c9da;font-size:11px;font-weight:700}.dot{width:7px;height:7px;border-radius:50%;background:#39d98a;box-shadow:0 0 12px #39d98a}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:22px}.card,.panel{background:#0b1827;border:1px solid #1a2b3e;border-radius:14px}.card{padding:17px}.label{color:#71869b;font-size:10px;text-transform:uppercase;letter-spacing:.12em;font-weight:700}.value{font-size:27px;font-weight:800;margin:8px 0 3px}.meta{font-size:11px;color:#71869b}.ok{color:#52d69a}.warn{color:#f2bf67}.grid{display:grid;grid-template-columns:1.45fr .95fr;gap:16px}.panel{padding:19px}.panel h2{font-size:14px;margin:0 0 16px}.pipeline{display:grid;grid-template-columns:repeat(7,1fr);gap:7px}.step{min-height:96px;background:#0e2031;border:1px solid #1d344a;border-radius:10px;padding:11px 8px}.num{font-size:9px;color:#5f7991}.step strong{display:block;font-size:11px;margin:7px 0}.step span{font-size:10px;color:#7f95aa}.step.done{border-color:#275a4a}.step.ready{border-color:#5a4a27}.activity{display:grid;gap:12px}.event{display:grid;grid-template-columns:8px 1fr auto;gap:10px;align-items:start}.bar{width:6px;height:6px;border-radius:50%;background:#5b9de8;margin-top:5px}.event b{font-size:11px}.event small{display:block;color:#71869b;font-size:10px;margin-top:3px}.time{color:#556a80;font-size:9px}.gate{display:grid;gap:8px}.check{display:flex;justify-content:space-between;padding:10px 11px;background:#0e1d2d;border-radius:8px;font-size:11px}.badge{font-size:9px;font-weight:800;color:#56d89a}.modules{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.module{border:1px solid #1b3045;background:#0d1c2b;border-radius:9px;padding:12px;font-size:11px;color:#a9b9c9}.footer{margin-top:18px;color:#536a81;font-size:10px}.footer b{color:#8ba0b4}@media(max-width:980px){.side{width:190px}.main{margin-left:190px;width:calc(100% - 190px);padding:22px}.cards{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:1fr}.pipeline{grid-template-columns:repeat(4,1fr)}}@media(max-width:650px){.side{position:static;width:100%;height:auto;border-right:0;border-bottom:1px solid #1b2b3d}.shell{display:block}.main{margin:0;width:100%;padding:18px}.side-foot{display:none}.nav{grid-template-columns:repeat(3,1fr)}.nav a{font-size:11px}.top{display:block}.live{margin-top:15px;width:max-content}.cards{grid-template-columns:1fr 1fr}.pipeline{grid-template-columns:repeat(2,1fr)}.modules{grid-template-columns:1fr}}
</style>

<div class="shell">
<aside class="side">
  <div class="brand">AK VISIO<span>SOFTWARE FACTORY V2</span></div>
  <nav class="nav">
    <a class="active" href="#overview">Overview</a><a href="#requests">Requests</a><a href="#runs">Runs</a>
    <a href="#projects">Projects</a><a href="#repairs">Repairs</a><a href="#validation">Validation</a><a href="#audit">Audit</a>
  </nav>
  <div class="side-foot">Standalone control plane<br>Isolated from ADTRAN Realindo<br>Environment: V2</div>
</aside>

<main class="main" id="overview">
  <header class="top">
    <div><div class="eyebrow">Operations Control Center</div><div class="title">Factory Command Dashboard</div><div class="sub">REQUEST → PLANNER → GENERATOR → TEST → SELF-HEAL → VALIDATOR → GO-LIVE</div></div>
    <div class="live"><i class="dot"></i> FACTORY ONLINE</div>
  </header>

  <section class="cards">
    <div class="card"><div class="label">Active Runs</div><div class="value">03</div><div class="meta">2 executing now</div></div>
    <div class="card"><div class="label">Generated Projects</div><div class="value">27</div><div class="meta ok">+4 this cycle</div></div>
    <div class="card"><div class="label">Self-Heal Repairs</div><div class="value">08</div><div class="meta ok">100% re-tested</div></div>
    <div class="card"><div class="label">Release Readiness</div><div class="value">96%</div><div class="meta ok">GO-LIVE eligible</div></div>
  </section>

  <section class="grid">
    <div class="panel">
      <h2>Factory Pipeline</h2>
      <div class="pipeline">
        <div class="step done"><div class="num">01</div><strong>REQUEST</strong><span>3 queued</span></div>
        <div class="step done"><div class="num">02</div><strong>PLANNER</strong><span>1 active</span></div>
        <div class="step done"><div class="num">03</div><strong>GENERATOR</strong><span>2 active</span></div>
        <div class="step done"><div class="num">04</div><strong>TEST</strong><span>14 passed</span></div>
        <div class="step done"><div class="num">05</div><strong>SELF-HEAL</strong><span>0 blocked</span></div>
        <div class="step done"><div class="num">06</div><strong>VALIDATOR</strong><span>9 verified</span></div>
        <div class="step ready"><div class="num">07</div><strong>GO-LIVE</strong><span>1 ready</span></div>
      </div>
    </div>
    <div class="panel" id="runs">
      <h2>Live Factory Activity</h2>
      <div class="activity">
        <div class="event"><i class="bar"></i><div><b>Generation completed</b><small>project-027 · artifact bundle produced</small></div><span class="time">now</span></div>
        <div class="event"><i class="bar"></i><div><b>Self-heal verified</b><small>run-118 · regression suite passed</small></div><span class="time">2m</span></div>
        <div class="event"><i class="bar"></i><div><b>Validation gate passed</b><small>project-026 · release candidate approved</small></div><span class="time">8m</span></div>
        <div class="event"><i class="bar"></i><div><b>Request accepted</b><small>REQ-20260913-004 · planner queued</small></div><span class="time">12m</span></div>
      </div>
    </div>
  </section>

  <section class="grid" style="margin-top:16px">
    <div class="panel" id="validation">
      <h2>Release Readiness / GO-LIVE Gate</h2>
      <div class="gate">
        <div class="check"><span>Build &amp; type safety</span><b class="badge">PASS</b></div>
        <div class="check"><span>Integration tests</span><b class="badge">PASS</b></div>
        <div class="check"><span>Self-healing regression</span><b class="badge">PASS</b></div>
        <div class="check"><span>Security validation</span><b class="badge">PASS</b></div>
        <div class="check"><span>Release audit</span><b class="badge">PASS</b></div>
      </div>
    </div>
    <div class="panel" id="projects">
      <h2>Factory Modules</h2>
      <div class="modules">
        <div class="module">Request Manager</div><div class="module">Generation Engine</div><div class="module">Self-Healing Engine</div>
        <div class="module">Validator</div><div class="module">Audit Ledger</div><div class="module">Go-Live Controller</div>
      </div>
    </div>
  </section>

  <div class="footer"><b>AK VISIO Software Factory V2</b> · standalone control plane · REQUEST → PLANNER → GENERATOR → TEST → SELF-HEALING → VALIDATOR → GO-LIVE</div>
</main>
</div>
