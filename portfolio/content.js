/* =============================================================================
   content.js — every word on the site lives here.
   Edit this file to update the portfolio. No build step, just save & refresh.
   ============================================================================= */

/* ---------------------------------------------------------------- socials -- */
/* EDIT ME: swap the LinkedIn URL for your real profile. */
const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/lizaalamm',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/lizaalamm',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.6c0-1.34-.02-3.06-1.9-3.06-1.9 0-2.2 1.45-2.2 2.96V21H9V9Z"/></svg>',
  },
  {
    label: 'Email',
    href: 'mailto:hello@lizaalam.dev',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 5.5L20 7"/></svg>',
  },
];

/* ------------------------------------------------------------------ hero -- */
const ROTATING_WORDS = [
  'AI-powered platforms.',
  'multi-agent systems.',
  'secure full-stack apps.',
  'RAG pipelines that scale.',
  'interfaces people trust.',
];

/* ----------------------------------------------------------------- skills -- */
const SKILL_CATEGORIES = [
  {
    id: 'frontend',
    name: 'Frontend',
    blurb: 'Pixel-accurate, accessible interfaces with typed data flow.',
    icon: '<path d="m9 8-5 4 5 4M15 8l5 4-5 4"/><path d="m13.5 4-3 16"/>',
    skills: [
      { name: 'React 18', level: 92 },
      { name: 'Next.js (App Router)', level: 90 },
      { name: 'TypeScript', level: 86 },
      { name: 'Tailwind CSS', level: 93 },
      { name: 'Shadcn UI / Radix', level: 88 },
      { name: 'Redux Toolkit', level: 84 },
      { name: 'Material UI', level: 82 },
    ],
  },
  {
    id: 'backend',
    name: 'Backend',
    blurb: 'Service layers with clean contracts and predictable errors.',
    icon: '<rect x="3" y="4" width="18" height="7" rx="2.4"/><rect x="3" y="13" width="18" height="7" rx="2.4"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    skills: [
      { name: 'Python + FastAPI', level: 90 },
      { name: 'Node.js + Express', level: 88 },
      { name: 'REST API design', level: 90 },
      { name: 'Prisma ORM', level: 86 },
      { name: 'Sequelize', level: 82 },
      { name: 'Async workers & queues', level: 80 },
    ],
  },
  {
    id: 'ai',
    name: 'AI / ML',
    blurb: 'Retrieval, agents and models that can explain themselves.',
    icon: '<rect x="6" y="6" width="12" height="12" rx="3"/><path d="M9.5 2.5v3M14.5 2.5v3M9.5 18.5v3M14.5 18.5v3M2.5 9.5h3M2.5 14.5h3M18.5 9.5h3M18.5 14.5h3"/>',
    skills: [
      { name: 'LangChain', level: 86 },
      { name: 'RAG pipelines', level: 87 },
      { name: 'Cohere / OpenAI / Gemini APIs', level: 89 },
      { name: 'Vector search & embeddings', level: 85 },
      { name: 'Scikit-learn', level: 82 },
      { name: 'TensorFlow / Keras (LSTM)', level: 76 },
      { name: 'Pandas / NumPy', level: 84 },
    ],
  },
  {
    id: 'data',
    name: 'Data & Infra',
    blurb: 'Where the data lives, moves and gets found again in milliseconds.',
    icon: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    skills: [
      { name: 'PostgreSQL', level: 88 },
      { name: 'Qdrant vector DB', level: 84 },
      { name: 'Redis', level: 78 },
      { name: 'Cloudinary', level: 82 },
      { name: 'Docker / Compose', level: 84 },
      { name: 'ELK Stack', level: 74 },
    ],
  },
  {
    id: 'security',
    name: 'Security',
    blurb: 'Access control, threat detection and audit-ready compliance.',
    icon: '<path d="M12 3 5 6v5.5c0 4.3 2.9 8.1 7 9.5 4.1-1.4 7-5.2 7-9.5V6l-7-3Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    skills: [
      { name: 'JWT / bcrypt / OAuth 2.0', level: 89 },
      { name: 'RBAC & permission matrices', level: 90 },
      { name: 'Anomaly detection (Isolation Forest)', level: 80 },
      { name: 'MITRE ATT&CK mapping', level: 82 },
      { name: 'PCI DSS v4.0 controls', level: 78 },
      { name: 'Threat intel / IOC handling', level: 80 },
    ],
  },
  {
    id: 'tooling',
    name: 'Tooling',
    blurb: 'The day-to-day kit: build, test, document, ship, review.',
    icon: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 2.5 2.5L7 14M12.5 15H17"/>',
    skills: [
      { name: 'Git & PR workflows', level: 92 },
      { name: 'Vite', level: 88 },
      { name: 'Electron.js', level: 78 },
      { name: 'Pytest / Locust', level: 76 },
      { name: 'Postman', level: 88 },
      { name: 'Figma → production UI', level: 82 },
    ],
  },
];

const TOOLBELT = [
  'Clerk Auth', 'Neon Postgres', 'NextAuth flow design', 'Cloudinary media', 'Redis queues',
  'LangChain loaders', 'Cohere Embeddings', 'HITL workflows', 'Prisma migrations', 'Express validators',
  'httpOnly cookies', 'Google OAuth 2.0', 'SMTP alerts', 'SMS API alerts', 'Kali Linux',
  'Log parsing', 'Docker Compose', 'Audit logging', 'Data seeding', 'Role-based dashboards',
  'Responsive layouts', 'WCAG contrast', 'Performance budgets', 'API documentation',
];

/* ------------------------------------------------------------- experience -- */
const EXPERIENCE = [
  {
    role: 'Software Engineer — Intern',
    company: 'Carbon Repro',
    companyHref: 'https://carbonrepro.com',
    location: 'Remote · Houston, TX (US)',
    duration: '3 Months',
    status: 'Completed',
    period: 'Internship 02',
    summary:
      'Joined a product team building web platforms and automation systems for client brands, working remotely with the US-based team.',
    points: [
      'Shipped production features across the web stack, from interface work through API integration.',
      'Worked in a reviewed Git flow — scoped branches, clear PR descriptions, no direct pushes to protected branches.',
      'Built and refined UI to an existing design system, keeping components reusable instead of page-specific.',
      'Collaborated asynchronously across time zones, taking features from ticket to verified delivery.',
    ],
    stack: ['React', 'JavaScript', 'REST APIs', 'Git & PR reviews', 'Responsive UI'],
  },
  {
    role: 'Full-Stack Developer — Intern',
    company: 'U Devs',
    companyHref: null,
    location: 'Remote · Pakistan',
    duration: '3 Months',
    status: 'Completed',
    period: 'Internship 01',
    summary:
      'Built a role-aware showroom management platform covering sales applications, financing plans, payments and delivery.',
    points: [
      'Delivered a 5-role platform (Super Admin, Admin, Manager, Customer, Staff) with a mirrored permission matrix on both API and UI.',
      'Implemented JWT authentication with bcrypt hashing, httpOnly cookies and per-route role guards.',
      'Modelled a 9-step application workflow — from submission through verification, finance approval, payment and delivery handover.',
      'Added an audit trail, validation chains on every endpoint and offline fallback data so no screen dead-ends.',
    ],
    stack: ['React + Redux Toolkit', 'Express', 'Sequelize', 'PostgreSQL', 'JWT', 'Material UI'],
  },
];

/* --------------------------------------------------------------- projects -- */
const PROJECTS = [
  {
    id: 'neuralhub',
    name: 'NeuralHub',
    tag: 'AI · Healthcare',
    accent: 'violet',
    year: '2025',
    headline: 'Multi-agent healthcare platform for secure patient workspaces.',
    summary:
      'A high-contrast, multi-agent healthcare platform giving medical professionals secure patient workspaces, strict validation schemas and real-time retrieval across distributed knowledge indices.',
    metrics: [
      { v: 'Sub-second', l: 'vector retrieval' },
      { v: 'Per-agent', l: 'isolated indexes' },
      { v: 'Zero', l: 'direct client→DB access' },
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind + Shadcn UI', 'Clerk', 'FastAPI', 'Prisma', 'PostgreSQL (Neon)', 'Qdrant', 'Cloudinary', 'LangChain', 'Cohere'],
    tabs: {
      Overview: `
        <p class="m-p">NeuralHub is built around one non-negotiable rule: <strong>the Next.js client talks only to verified API controllers.</strong> No loose connections, no raw schema queries, no external vector evaluation looping outside the dedicated FastAPI service layer. That single constraint is what makes a multi-agent clinical product auditable.</p>
        <h4>The problem it solves</h4>
        <p class="m-p">Clinical teams sit on documents, notes and media that must stay inside a patient workspace, stay traceable, and still be instantly searchable. NeuralHub pairs strict relational records with semantic retrieval so a doctor can ask a question in plain language and get an answer grounded in that patient's own indexed material.</p>
        <h4>Agent surface</h4>
        <ul class="m-list">
          <li><strong>Medical RAG agent</strong> — document ingestion, chunk parsing, grounded question answering over a dedicated vector collection.</li>
          <li><strong>DDx agent</strong> — differential-diagnosis reasoning over patient context and indexed evidence.</li>
          <li><strong>Medication adherence agent</strong> — adherence analytics and risk surfacing for ongoing prescriptions.</li>
          <li><strong>Therapy agent</strong> — multi-turn conversational reasoning with prompt-state tracking.</li>
          <li><strong>AI back-office admin</strong> — operational console with self-contained UI modules and human-in-the-loop review flows.</li>
        </ul>
        <h4>Frontend architecture</h4>
        <p class="m-p">Every agent owns one folder under <code>dashboard/(agents)/</code> and keeps its own <code>hooks/</code>, <code>modules/</code> and <code>modals/</code>. Feature state lives in hooks like <code>usePatientCard</code> and <code>useAdherenceAnalytics</code>, not scattered inside page components — which keeps each agent independently replaceable.</p>
      `,
      'Tech Stack': `
        <table class="m-table">
          <thead><tr><th>Layer</th><th>Technology</th><th>Why</th></tr></thead>
          <tbody>
            <tr><td>Frontend core</td><td>Next.js (App Router, TypeScript)</td><td>SSR, type-safe routing, structural code optimisation</td></tr>
            <tr><td>Visual system</td><td>Tailwind CSS + Shadcn UI</td><td>High-contrast minimalist, accessibility-first design</td></tr>
            <tr><td>Auth</td><td>Clerk managed auth SDK</td><td>Compliance token issuance, security isolation</td></tr>
            <tr><td>API engine</td><td>Python + FastAPI</td><td>Decoupled application logic, multi-route ingestion</td></tr>
            <tr><td>Relational DB</td><td>PostgreSQL (Neon) + Prisma ORM</td><td>Patient files, audit records, deterministic meta-logs</td></tr>
            <tr><td>Vector store</td><td>Qdrant</td><td>Semantic multi-tenant indexes, sub-second retrieval</td></tr>
            <tr><td>Media storage</td><td>Cloudinary</td><td>Managed stream storage for raw clinical media</td></tr>
            <tr><td>AI / agents</td><td>LangChain + Cohere LLM API</td><td>Prompt-state tracking, chunk graphs, multi-turn reasoning</td></tr>
          </tbody>
        </table>
        <div class="m-note"><strong>Multi-tenancy by convention:</strong> Qdrant is per-agent. Each new agent ships its own collection credentials — <code>AgentName_QDRANT_API_KEY</code> and <code>AgentName_QDRANT_URL</code> — so one agent's index can never leak into another's retrieval scope.</div>
      `,
      Architecture: `
        <h4>Document ingestion pipeline (RAG)</h4>
        <ol class="m-steps">
          <li><span class="step-n">01</span><div><strong>File submission</strong><p>An authenticated upload field streams clinical documents as multipart form-data to the FastAPI server.</p></div></li>
          <li><span class="step-n">02</span><div><strong>Cloud media sync</strong><p>The media service uploads the byte stream to Cloudinary and returns a secure URL plus asset metadata.</p></div></li>
          <li><span class="step-n">03</span><div><strong>Database record</strong><p>Prisma writes a file row into PostgreSQL, mapping the patient profile ID to the Cloudinary URL.</p></div></li>
          <li><span class="step-n">04</span><div><strong>Chunk parsing</strong><p>An async worker parses document text with LangChain loaders and splits it into overlapping token windows.</p></div></li>
          <li><span class="step-n">05</span><div><strong>Vector indexing</strong><p>Cohere embeddings convert each chunk into float arrays pushed to Qdrant alongside parent record keys.</p></div></li>
        </ol>
        <h4>Backend contribution model</h4>
        <p class="m-p">Every agent is a vertical slice — <code>routes/agents/</code>, <code>controllers/agents/</code>, <code>services/agents/</code> — and is registered once, in <code>main.py</code>. That file is the single entry point for route mounting, which keeps the surface of the API reviewable at a glance.</p>
        <h4>Database workflow</h4>
        <p class="m-p">Schema changes go through Prisma only — never raw SQL and never a second ORM. Migrations are reviewed (<code>prisma migrate dev</code>) instead of pushed blindly, and existing models are extended rather than duplicated, so the schema can't drift into near-duplicate tables.</p>
        <h4>Delivery discipline</h4>
        <p class="m-p">Protected <code>main</code>, one scoped branch per feature, and a PR with a written description before review. Every process — the API server and the async worker — runs separately, because chunking and index writes must never block a request.</p>
      `,
      Highlights: `
        <ul class="m-list">
          <li><strong>Hard architectural boundary</strong> — the client can only call verified controllers, which makes PHI-touching paths enumerable and auditable.</li>
          <li><strong>Two data planes, one source of truth</strong> — Postgres holds the audit-deterministic record; Qdrant holds the semantic index; every vector carries its parent record key back.</li>
          <li><strong>Agent isolation</strong> — separate route/controller/service folders, separate vector credentials, separate frontend folders.</li>
          <li><strong>Async by default</strong> — ingestion, chunking and indexing run in a worker so uploads stay fast and the API stays responsive.</li>
          <li><strong>Accessibility as a design rule</strong> — high-contrast minimalist UI with reusable module boundaries rather than one-off screens.</li>
          <li><strong>Contribution-ready</strong> — documented folder conventions and a strict PR flow, so a new contributor can add an agent without touching anyone else's code.</li>
        </ul>
        <div class="m-note"><strong>What I'd build next:</strong> streaming token output in the agent chat, per-chunk citation anchors in answers, and a retrieval-evaluation harness so answer quality can be measured instead of felt.</div>
      `,
    },
  },
  {
    id: 'cyron',
    name: 'Cyron',
    tag: 'Security · AI',
    accent: 'cyan',
    year: '2025',
    headline: 'Context-aware intelligent SOC with automated threat response.',
    summary:
      'An AI-powered desktop security operations platform for small and medium businesses that are attacked daily but priced out of enterprise SIEMs — behavioural profiling, explainable risk scoring and automated response in under 30 seconds.',
    metrics: [
      { v: '< 30s', l: 'detection → isolation' },
      { v: '5-factor', l: 'explainable risk score' },
      { v: '10', l: 'threat-ownership modules' },
    ],
    stack: ['Electron.js', 'React 18 + Vite', 'Tailwind CSS', 'FastAPI', 'PostgreSQL', 'Redis', 'ELK Stack', 'Scikit-learn', 'TensorFlow / Keras', 'JWT + OAuth 2.0', 'Docker'],
    tabs: {
      Overview: `
        <p class="m-p">Small and mid-sized businesses are targeted as relentlessly as enterprises, but they can't spend $50,000 a year on a SIEM or hire a round-the-clock SOC team. Cyron closes that gap with open-source components, machine-learned detection and a response layer that doesn't wait for a human.</p>
        <table class="m-table">
          <thead><tr><th>Existing tool</th><th>Where it falls short</th></tr></thead>
          <tbody>
            <tr><td>Enterprise SIEM</td><td>Five-figure annual cost and a 16&nbsp;GB RAM floor before it runs well.</td></tr>
            <tr><td>Rule-based open source</td><td>No machine learning, no behavioural baselines, no automated response.</td></tr>
            <tr><td>Managed detection</td><td>Manual response measured in hours — most intrusions finish in 10–15 minutes.</td></tr>
            <tr><td>Behavioural AI suites</td><td>Flags threats without explaining them; no compliance reporting.</td></tr>
          </tbody>
        </table>
        <h4>What Cyron does differently</h4>
        <ul class="m-list">
          <li><strong>Behavioural profiling</strong> — a 30-day baseline per user, with deviations flagged automatically.</li>
          <li><strong>Automated response in under 30 seconds</strong> — from log line to endpoint isolation without waiting for an analyst.</li>
          <li><strong>Regionally aware threat intelligence</strong> — local fraud patterns and regional APT profiles mapped to MITRE ATT&amp;CK.</li>
          <li><strong>Offline-first</strong> — core monitoring keeps running through internet outages and power interruptions.</li>
          <li><strong>Explainable scoring</strong> — five weighted factors give every alert an auditable reason.</li>
          <li><strong>Compliance built in</strong> — continuous control checks with audit-ready reporting.</li>
        </ul>
      `,
      'Tech Stack': `
        <table class="m-table">
          <thead><tr><th>Layer</th><th>Technology</th></tr></thead>
          <tbody>
            <tr><td>Desktop frontend</td><td>Electron.js + React 18 (Vite, Tailwind CSS)</td></tr>
            <tr><td>Backend</td><td>Python 3.10+ / FastAPI</td></tr>
            <tr><td>Database</td><td>PostgreSQL (Docker)</td></tr>
            <tr><td>Caching &amp; real-time</td><td>Redis</td></tr>
            <tr><td>Log processing</td><td>ELK Stack — Elasticsearch, Logstash, Kibana</td></tr>
            <tr><td>AI / ML</td><td>Scikit-learn (Isolation Forest), TensorFlow/Keras (LSTM, Autoencoder)</td></tr>
            <tr><td>Data processing</td><td>Pandas, NumPy</td></tr>
            <tr><td>Authentication</td><td>JWT (PyJWT), bcrypt hashing, Google OAuth 2.0</td></tr>
            <tr><td>Alerting</td><td>SMTP + SMS API integration</td></tr>
            <tr><td>Testing &amp; validation</td><td>Pytest (unit), Locust (load), Kali Linux (attack simulation)</td></tr>
          </tbody>
        </table>
        <div class="m-note"><strong>Deployment target:</strong> a single desktop install wrapping the same React frontend — no second codebase to maintain, and it runs on modest hardware without a cloud dependency.</div>
      `,
      Architecture: `
        <h4>Detection-to-response pipeline</h4>
        <ol class="m-steps">
          <li><span class="step-n">01</span><div><strong>Log ingestion</strong><p>Auth, endpoint and network events stream into the ELK pipeline with Redis handling hot-path caching.</p></div></li>
          <li><span class="step-n">02</span><div><strong>Module detection</strong><p>Identity, insider-threat and network modules run in parallel — rule logic, Isolation Forest outliers and LSTM sequence models.</p></div></li>
          <li><span class="step-n">03</span><div><strong>Threat intel correlation</strong><p>Hits are matched against the IOC repository of IPs, domains and hashes, plus regional APT signatures.</p></div></li>
          <li><span class="step-n">04</span><div><strong>Risk prioritisation</strong><p>A five-factor weighted engine scores the event and assigns a severity label.</p></div></li>
          <li><span class="step-n">05</span><div><strong>Automated response</strong><p>IP blocking, endpoint isolation or forced re-authentication execute within the SLA — with rollback available.</p></div></li>
          <li><span class="step-n">06</span><div><strong>Compliance &amp; reporting</strong><p>Actions are written to the audit record, mapped to PCI DSS controls and surfaced in daily and weekly reports.</p></div></li>
        </ol>
        <h4>Five-factor risk scoring</h4>
        <div class="m-factor-grid">
          <span class="m-factor"><em>01</em> Time</span>
          <span class="m-factor"><em>02</em> Location</span>
          <span class="m-factor"><em>03</em> Behaviour</span>
          <span class="m-factor"><em>04</em> Peer comparison</span>
          <span class="m-factor"><em>05</em> Threat intelligence</span>
        </div>
        <h4>Ten threat-ownership modules</h4>
        <ul class="m-list m-list-2col">
          <li>Identity &amp; access threats</li>
          <li>Insider threat / UBA</li>
          <li>Network intrusion &amp; malware</li>
          <li>Threat intelligence correlation</li>
          <li>Risk prioritisation &amp; decisions</li>
          <li>Automated incident response</li>
          <li>Compliance monitoring &amp; audit</li>
          <li>SOC dashboard, alerts, reporting</li>
          <li>Reports &amp; analytics</li>
          <li>Settings &amp; configuration</li>
        </ul>
        <h4>Role model</h4>
        <p class="m-p">Admins own configuration, threat intelligence, response actions and compliance; analysts work alerts, escalation and reporting. The split is enforced in the routing layer and the dashboard, with server-side enforcement per endpoint as the next hardening step.</p>
      `,
      Highlights: `
        <ul class="m-list">
          <li><strong>Automated response under 30 seconds</strong> — IP blocking, endpoint isolation and forced re-auth with a rollback path, so speed never means losing the option to undo.</li>
          <li><strong>Explainable AI</strong> — every score decomposes into five weighted factors, so an analyst can defend the alert instead of trusting a black box.</li>
          <li><strong>Region-aware intelligence</strong> — local fraud patterns (mobile-wallet scams, fake ID portals) and regional APT profiles (APT36 / Transparent Tribe, SideCopy) sourced from national advisories and MITRE ATT&amp;CK.</li>
          <li><strong>Offline-first architecture</strong> — monitoring survives connectivity loss and load shedding, which matters in the market it targets.</li>
          <li><strong>PCI DSS v4.0 monitoring</strong> — continuous control checks, automated gap analysis and PDF-ready audit exports.</li>
          <li><strong>Desktop deployment</strong> — Electron wraps the same React app, so there is one frontend codebase and no cloud bill.</li>
        </ul>
        <div class="m-note"><strong>Honest limitations:</strong> sophisticated zero-days can still evade detection, behavioural baselines need their first 30 days to become accurate, and 4&nbsp;GB-RAM hardware caps extreme log volumes. Naming these keeps the risk picture honest instead of overselling the model.</div>
      `,
    },
  },
  {
    id: 'showroom',
    name: 'Showroom Platform',
    tag: 'Enterprise · Workflow',
    accent: 'emerald',
    year: '2025',
    headline: 'Role-aware showroom, financing and delivery management system.',
    summary:
      'A multi-role management system that runs the full sales cycle of a vehicle showroom — applications, verification, financing plans, installments and delivery — with permissions enforced on both the API and the UI.',
    metrics: [
      { v: '5 roles', l: 'with mirrored permissions' },
      { v: '9 steps', l: 'application lifecycle' },
      { v: 'Full', l: 'audit trail per action' },
    ],
    stack: ['React 18', 'Redux Toolkit', 'Material UI', 'Vite', 'Express', 'Sequelize', 'PostgreSQL', 'JWT + bcrypt', 'express-validator'],
    tabs: {
      Overview: `
        <p class="m-p">A showroom's sales cycle is an approval chain, not a CRUD app. This platform models it as one: a customer applies for a vehicle, a manager verifies the information and configures a financing plan, payments are tracked against installments, and delivery only completes once approval has actually been granted.</p>
        <h4>The rule that keeps it honest</h4>
        <p class="m-p">You can only manage roles strictly below your own. That single rule produces a permission matrix rather than a pile of ad-hoc checks — and the same matrix is mirrored on the API and the UI, so hiding a button is never mistaken for security.</p>
        <h4>Roles</h4>
        <ul class="m-list">
          <li><strong>Super Admin</strong> — creates users, approves applications, assigns managers, owns finance rules and audit logs.</li>
          <li><strong>Admin</strong> — operational work inside granted modules only; cannot approve or complete orders.</li>
          <li><strong>Manager</strong> — sees assigned customers only, verifies details and configures down payment and installment plans.</li>
          <li><strong>Customer</strong> — own data only: apply, track status, view assigned manager, finance plan and payment history.</li>
          <li><strong>Staff</strong> — inventory, suppliers and reporting screens.</li>
        </ul>
      `,
      'Tech Stack': `
        <table class="m-table">
          <thead><tr><th>Layer</th><th>Technology</th></tr></thead>
          <tbody>
            <tr><td>Frontend</td><td>React 18 + Redux Toolkit + React Router</td></tr>
            <tr><td>Design system</td><td>Material UI with a custom themed palette</td></tr>
            <tr><td>Build tool</td><td>Vite</td></tr>
            <tr><td>API</td><td>Node.js + Express (route → middleware → controller → service)</td></tr>
            <tr><td>ORM / DB</td><td>Sequelize → PostgreSQL</td></tr>
            <tr><td>Auth</td><td>JWT with httpOnly cookies, bcrypt password hashing</td></tr>
            <tr><td>Validation</td><td>express-validator chains per endpoint</td></tr>
            <tr><td>Auditing</td><td>Audit-log model recording every privileged action</td></tr>
          </tbody>
        </table>
      `,
      Architecture: `
        <h4>Request path</h4>
        <p class="m-code">React UI → Redux Toolkit → Axios → Express route → auth &amp; permission middleware → controller → Sequelize → PostgreSQL</p>
        <h4>Application lifecycle</h4>
        <p class="m-p">Applications move through a nine-step status flow — submission, verification, information requests, manager assignment, vehicle selection, finance configuration, approval, payment tracking and delivery. Each transition records who made it and when.</p>
        <h4>Permission architecture</h4>
        <ul class="m-list">
          <li>A shared constants layer defines roles, permissions and the matrix once, then imports it on both sides of the stack.</li>
          <li>Route guards check authentication, role and granular permission before a controller is ever reached.</li>
          <li>Responses use a single envelope so the frontend handles success, validation and error states identically everywhere.</li>
        </ul>
        <h4>Resilience</h4>
        <p class="m-p">Every service has an offline fallback dataset, so the interface stays explorable and demonstrable even without a running API — useful for reviews, and it stopped a lot of blank-screen bug reports.</p>
      `,
      Highlights: `
        <ul class="m-list">
          <li><strong>One permission matrix, two enforcement points</strong> — API and UI stay in sync because they read the same definition.</li>
          <li><strong>Workflow over CRUD</strong> — status transitions, manager assignment and finance configuration are explicit domain operations, not generic updates.</li>
          <li><strong>Audit by default</strong> — privileged actions write to an audit log, so "who approved this?" has a real answer.</li>
          <li><strong>Seeded demo environment</strong> — scripts create role accounts and a showroom catalogue so the app is reviewable in one command.</li>
          <li><strong>Validation at the edge</strong> — per-endpoint validator chains keep malformed data out of the models entirely.</li>
          <li><strong>Offline-tolerant frontend</strong> — fallback data keeps every screen usable during API downtime.</li>
        </ul>
      `,
    },
  },
];
