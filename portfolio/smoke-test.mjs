/**
 * smoke-test.mjs — loads the portfolio in JSDOM (real <script> tags, real DOM
 * order) and asserts the page builds itself with no runtime errors.
 * Dev tool only, not part of the site.
 *
 *   npm i jsdom && node smoke-test.mjs
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const dir = new URL('.', import.meta.url).pathname;
const base = pathToFileURL(dir).href;

// point the relative <script> tags at real local files so JSDOM can load them
let html = readFileSync(`${dir}index.html`, 'utf8')
  .replace('src="content.js"', `src="${base}content.js"`)
  .replace('src="script.js"', `src="${base}script.js"`);

const errors = [];
const virtualConsole = new VirtualConsole();
// offline sandboxes can't fetch Google Fonts — that's an environment limit, not a page bug
const ignorable = (msg) => /fonts\.googleapis|fonts\.gstatic|Could not load (link|img)/i.test(msg);
virtualConsole.on('jsdomError', (e) => {
  if (!ignorable(e.message)) errors.push(`jsdomError: ${e.message}`);
});
virtualConsole.on('error', (m) => {
  if (!ignorable(String(m))) errors.push(`console.error: ${m}`);
});

const dom = new JSDOM(html, {
  url: base,
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.IntersectionObserver = class {
      constructor(cb) { this.cb = cb; }
      observe(el) { this.cb([{ isIntersecting: true, target: el }], this); }
      unobserve() {}
      disconnect() {}
    };
    window.matchMedia = (q) => ({
      matches: false, media: q,
      addListener() {}, removeListener() {},
      addEventListener() {}, removeEventListener() {},
    });
    window.navigator.clipboard = { writeText: async () => {} };
  },
});

const { window } = dom;

// wait for scripts + deferred rendering
await new Promise((resolve) => {
  const done = () => setTimeout(resolve, 250);
  if (window.document.readyState === 'complete') done();
  else window.addEventListener('load', done, { once: true });
  setTimeout(resolve, 3000);
});

const $ = (s) => window.document.querySelector(s);
const $$ = (s) => Array.from(window.document.querySelectorAll(s));
const bodyHtml = () => window.document.body.innerHTML;

const checks = [
  ['social links rendered', $$('.social-link').length >= 9],
  ['marquee populated', $$('.marquee-item').length >= 40],
  ['skill tabs rendered', $$('.tab-btn').length === 6],
  ['skill bars rendered', $$('.bar-fill').length >= 6],
  ['skill bar widths set', $$('.bar-fill').length > 0 && $$('.bar-fill').every((b) => b.style.width.includes('%'))],
  ['toolbelt chips rendered', $$('#toolbelt .chip').length >= 20],
  ['experience entries rendered', $$('.tl-item').length === 2],
  ['experience keeps employer names', bodyHtml().includes('U Devs')],
  ['experience remote badges', $$('.badge-remote').length === 2],
  ['experience completed badges', $$('.badge-done').length === 2],
  ['project cards rendered', $$('.project-card').length === 3],
  ['project metrics rendered', $$('.proj-metric').length === 9],
  ['case study buttons present', $$('[data-open]').length === 3],
  ['footer year set', $('#year').textContent === String(new Date().getFullYear())],
  ['no emoji in markup', !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(bodyHtml())],
  ['NeuralHub mentioned', bodyHtml().includes('NeuralHub')],
  ['Cyron mentioned', bodyHtml().includes('Cyron')],
  ['no student wording leaked', !/student|\bFYP\b|final year|university|Air University/i.test(bodyHtml())],
  ['stats counters rendered', $$('.stat-num').every((n) => n.textContent.trim() !== '')],
  ['github band present', !!$('.gh-band')],
  ['terminal output reserved (no reflow)', $$('.t-out').length === 4 && $$('.t-out').every((o) => o.innerHTML.trim() !== '')],
];

// exercise the case-study modal
$$('[data-open="neuralhub"]')[0]?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await new Promise((r) => setTimeout(r, 80));
checks.push(['modal opens', $('#modal').classList.contains('open')]);
checks.push(['modal tabs render', $$('.mtab').length === 4]);
checks.push(['modal body has content', $('#modalBody').innerHTML.length > 400]);
$$('.mtab')[1]?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
checks.push(['modal tab switch works', /Prisma|Tailwind|FastAPI/.test($('#modalBody').innerHTML)]);
$('.modal-close')?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
checks.push(['modal closes', !$('#modal').classList.contains('open')]);

// exercise the skill tabs
$$('.tab-btn')[3]?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await new Promise((r) => setTimeout(r, 40));
checks.push(['skill tab switch works', $('#skillGrid').innerHTML.includes('PostgreSQL')]);

// theme toggle
$('#themeToggle')?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
checks.push(['theme toggle switches', window.document.documentElement.getAttribute('data-theme') === 'light']);
$('#themeToggle')?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
checks.push(['theme toggle returns to dark', window.document.documentElement.getAttribute('data-theme') === 'dark']);

let failed = 0;
for (const [name, ok] of checks) {
  if (!ok) failed++;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}`);
}
if (errors.length) {
  console.log('\nRuntime errors:');
  errors.forEach((e) => console.log('  ! ' + e));
}
console.log(`\n${checks.length - failed}/${checks.length} checks passed${errors.length ? `, ${errors.length} runtime error(s)` : ''}`);
process.exit(failed || errors.length ? 1 : 0);
