/* =============================================================================
   script.js — interactions for the portfolio.
   Depends on content.js (must load first).
   ============================================================================= */
'use strict';

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const escapeHtml = (str = '') =>
  String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* localStorage can throw in private modes / opaque origins — never let it break the page */
const store = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
  },
};

/* ─────────────────────────────────────────────────────────── 1. theme ─── */
(function theme() {
  const root = document.documentElement;
  const preferred = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  root.setAttribute('data-theme', store.get('la-theme') || preferred);

  const btn = $('#themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('la-theme', next);
    });
  }
})();

/* ─────────────────────────────────────────────────────── 2. socials ─── */
(function socials() {
  const html = SOCIALS.map(
    (s) => `<a class="social-link" href="${s.href}" data-tip="${escapeHtml(s.label)}"
              aria-label="${escapeHtml(s.label)}"${s.href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${s.icon}</a>`
  ).join('');
  ['#heroSocials', '#mobileSocials', '#contactSocials'].forEach((sel) => {
    const el = $(sel);
    if (el) el.innerHTML = html;
  });
})();

/* ────────────────────────────────────────────────────────── 3. nav ─── */
(function nav() {
  const navEl = $('#nav');
  const menuBtn = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');
  const links = $$('.nav-links a');
  const sections = links
    .map((a) => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);

  const onScroll = () => {
    const y = window.scrollY;
    navEl.classList.toggle('scrolled', y > 24);

    // scroll progress
    const max = document.documentElement.scrollHeight - window.innerHeight;
    $('#scrollBar').style.width = `${Math.min(100, (y / Math.max(max, 1)) * 100)}%`;

    // back to top
    $('#toTop').classList.toggle('show', y > 700);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // active link
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((s) => spy.observe(s));

  // mobile menu
  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('inert', '');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  };
  const openMenu = () => {
    mobileMenu.classList.add('open');
    mobileMenu.removeAttribute('inert');
    menuBtn.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
  };
  menuBtn.addEventListener('click', () => (mobileMenu.classList.contains('open') ? closeMenu() : openMenu()));
  $$('#mobileMenu a').forEach((a) => a.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());
  window.addEventListener('resize', () => window.innerWidth > 1080 && closeMenu());

  $('#toTop').addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
  );
})();

/* ───────────────────────────────────────────────── 4. word rotator ─── */
(function rotator() {
  const el = $('#rotator');
  if (!el) return;
  const words = ROTATING_WORDS;
  const caret = '<span class="caret"></span>';

  if (reducedMotion) {
    el.innerHTML = words[0] + caret;
    return;
  }

  let w = 0;
  let i = 0;
  let deleting = false;

  const tick = () => {
    const word = words[w];
    i += deleting ? -1 : 1;
    el.innerHTML = `${escapeHtml(word.slice(0, i))}${caret}`;

    let delay = deleting ? 34 : 62;
    if (!deleting && i === word.length) {
      delay = 1900;
      deleting = true;
    } else if (deleting && i === 0) {
      deleting = false;
      w = (w + 1) % words.length;
      delay = 260;
    }
    setTimeout(tick, delay);
  };
  setTimeout(tick, 420);
})();

/* ─────────────────────────────────────────────────────── 5. terminal ─── */
(function terminal() {
  const body = $('#termBody');
  if (!body) return;

  const lines = $$('.t-line', body);
  const outEls = $$('.t-out', body);
  const cmds = lines.map((line) => line.dataset.type);

  // Reduced motion: print everything at once, no typing.
  if (reducedMotion) {
    lines.forEach((line, idx) => {
      line.innerHTML = `<span class="prompt">➜ ~</span> <span class="cmd">${escapeHtml(cmds[idx])}</span>`;
    });
    outEls.forEach((o) => o.classList.add('show'));
    return;
  }

  // Outputs are already in the DOM (invisible) so the panel never changes height.
  const typeLine = (lineIdx) => {
    if (lineIdx >= cmds.length) return;
    const line = lines[lineIdx];
    const text = cmds[lineIdx];
    let ci = 0;

    const step = () => {
      line.innerHTML = `<span class="prompt">➜ ~</span> <span class="cmd">${escapeHtml(text.slice(0, ci))}</span>`;
      if (ci++ < text.length) {
        setTimeout(step, 62);
      } else {
        setTimeout(() => {
          outEls[lineIdx]?.classList.add('show');
          setTimeout(() => typeLine(lineIdx + 1), lineIdx === 0 ? 520 : 460);
        }, 240);
      }
    };
    step();
  };

  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        io.disconnect();
        setTimeout(() => typeLine(0), 500);
      }
    },
    { threshold: 0.35 }
  );
  io.observe($('#terminal'));
})();

/* ──────────────────────────────────────────────────────── 6. marquee ─── */
(function marquee() {
  const el = $('#marquee');
  if (!el) return;
  const items = [
    'Next.js', 'React 18', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'Node.js', 'PostgreSQL',
    'Prisma', 'Qdrant', 'LangChain', 'Cohere', 'Clerk', 'Redis', 'Docker', 'Electron.js',
    'Scikit-learn', 'TensorFlow', 'ELK Stack', 'JWT / OAuth 2.0', 'Express',
  ];
  const group = `<div class="marquee-group">${items
    .map((i) => `<span class="marquee-item">${escapeHtml(i)}</span>`)
    .join('')}</div>`;
  el.innerHTML = group + group; // duplicated for a seamless loop
})();

/* ─────────────────────────────────────────────────────── 7. counters ─── */
(function counters() {
  const nums = $$('.stat-num');
  if (!nums.length) return;

  const animate = (el) => {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || '';
    if (reducedMotion) {
      el.textContent = target + suffix;
      return;
    }
    const dur = 1500;
    const start = performance.now();
    const run = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  nums.forEach((n) => io.observe(n));
})();

/* ─────────────────────────────────────────────────────── 8. reveal ─── */
(function reveal() {
  const els = $$('.reveal');
  if (!els.length) return;
  if (reducedMotion) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const delay = Number(e.target.dataset.delay || 0);
        setTimeout(() => e.target.classList.add('in'), delay);
        io.unobserve(e.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach((el) => io.observe(el));
})();

/* ─────────────────────────────────────────────────────── 9. skills ─── */
(function skills() {
  const tabsEl = $('#skillTabs');
  const gridEl = $('#skillGrid');
  const beltEl = $('#toolbelt');
  if (!tabsEl || !gridEl) return;

  const renderCards = (cat) => {
    gridEl.innerHTML = `
      <article class="skill-card">
        <div class="skill-card-head">
          <span class="skill-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${cat.icon}</svg>
          </span>
          <div class="skill-card-title">
            <h3>${escapeHtml(cat.name)}</h3>
            <p class="skill-blurb">${escapeHtml(cat.blurb)}</p>
          </div>
        </div>
        <div class="bar-grid">
          ${cat.skills
            .map(
              (s, i) => `
            <div class="bar-row">
              <div class="bar-top">
                <span class="bar-name">${escapeHtml(s.name)}</span>
                <span class="bar-val">${s.level}%</span>
              </div>
              <div class="bar-track"><span class="bar-fill" data-level="${s.level}" style="transition-delay:${i * 70}ms"></span></div>
            </div>`
            )
            .join('')}
        </div>
      </article>`;

    requestAnimationFrame(() => {
      $$('.bar-fill', gridEl).forEach((bar) => {
        bar.style.width = `${bar.dataset.level}%`;
      });
    });
  };

  tabsEl.innerHTML = SKILL_CATEGORIES.map(
    (c, i) => `<button class="tab-btn${i === 0 ? ' active' : ''}" type="button" role="tab" aria-selected="${i === 0}" aria-controls="skillGrid" data-cat="${c.id}">${escapeHtml(c.name)}</button>`
  ).join('');

  tabsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    $$('.tab-btn', tabsEl).forEach((b) => {
      const on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', String(on));
    });
    const cat = SKILL_CATEGORIES.find((c) => c.id === btn.dataset.cat);
    if (cat) renderCards(cat);
  });

  renderCards(SKILL_CATEGORIES[0]);
  if (beltEl) beltEl.innerHTML = TOOLBELT.map((t) => `<span class="chip">${escapeHtml(t)}</span>`).join('');
})();

/* ─────────────────────────────────────────────────── 10. experience ─── */
(function experience() {
  const el = $('#timeline');
  if (!el) return;

  const pin = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>`;
  const clock = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></svg>`;
  const link = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-8.5 8.5"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>`;

  el.innerHTML = EXPERIENCE.map(
    (job) => `
    <li class="tl-item reveal">
      <span class="tl-dot" aria-hidden="true"></span>
      <article class="exp-card">
        <div class="exp-top">
          <div>
            <h3 class="exp-role">${escapeHtml(job.role)}</h3>
            ${
              job.companyHref
                ? `<a class="exp-company" href="${job.companyHref}" target="_blank" rel="noopener noreferrer">${escapeHtml(job.company)} ${link}</a>`
                : `<span class="exp-company">${escapeHtml(job.company)}</span>`
            }
          </div>
          <div class="exp-badges">
            <span class="badge badge-num">${escapeHtml(job.period)}</span>
            <span class="badge badge-remote">Remote</span>
            <span class="badge badge-done">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><path d="M20 6.5 9.6 17 4 11.4"/></svg>
              ${escapeHtml(job.status)}
            </span>
          </div>
        </div>
        <ul class="exp-meta">
          <li>${clock} ${escapeHtml(job.duration)}</li>
          <li>${pin} ${escapeHtml(job.location)}</li>
        </ul>
        <p class="exp-summary">${escapeHtml(job.summary)}</p>
        <ul class="exp-points">
          ${job.points.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
        </ul>
        <div class="chips">
          ${job.stack.map((s) => `<span class="chip">${escapeHtml(s)}</span>`).join('')}
        </div>
      </article>
    </li>`
  ).join('');

  // newly injected reveals need observing
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = `${Number(e.target.dataset.delay || 0)}ms`;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    },
    { threshold: 0.1 }
  );
  $$('.tl-item.reveal', el).forEach((item, i) => {
    item.dataset.delay = i * 60;
    io.observe(item);
  });
})();

/* ─────────────────────────────────────────────────── 11. projects ─── */
(function projects() {
  const grid = $('#projectGrid');
  if (!grid) return;

  grid.innerHTML = PROJECTS.map((p) => {
    const tabKeys = Object.keys(p.tabs);
    return `
    <article class="project-card reveal" data-accent="${escapeHtml(p.accent)}" data-id="${escapeHtml(p.id)}">
      <div class="proj-top">
        <span class="proj-tag">${escapeHtml(p.tag)}</span>
        <span class="proj-year">${escapeHtml(p.year)}</span>
      </div>
      <h3 class="proj-name">${escapeHtml(p.name)}</h3>
      <p class="proj-headline">${escapeHtml(p.headline)}</p>
      <p class="proj-summary">${escapeHtml(p.summary)}</p>
      <div class="proj-metrics">
        ${p.metrics.map((m) => `<div class="proj-metric"><span class="pm-v">${escapeHtml(m.v)}</span><span class="pm-l">${escapeHtml(m.l)}</span></div>`).join('')}
      </div>
      <div class="proj-stack">
        ${p.stack.slice(0, 8).map((s) => `<span class="stack-chip">${escapeHtml(s)}</span>`).join('')}
        ${p.stack.length > 8 ? `<span class="stack-chip">+${p.stack.length - 8}</span>` : ''}
      </div>
      <div class="proj-foot">
        <button class="case-btn" type="button" data-open="${escapeHtml(p.id)}" aria-haspopup="dialog">
          ${tabKeys.length} sections · Read case study
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </article>`;
  }).join('');

  // re-observe injected reveals
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = `${Number(e.target.dataset.delay || 0)}ms`;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    },
    { threshold: 0.08 }
  );
  $$('.project-card.reveal', grid).forEach((c, i) => {
    c.dataset.delay = i * 80;
    io.observe(c);
  });

  /* ── modal ─────────────────────────────────────────────────────────── */
  const modal = $('#modal');
  const modalTitle = $('#modalTitle');
  const modalTag = $('#modalTag');
  const tabsEl = $('#modalTabs');
  const bodyEl = $('#modalBody');
  let lastFocus = null;
  let activeProject = null;

  const showTab = (key) => {
    if (!activeProject) return;
    $$('.mtab', tabsEl).forEach((t) => {
      const on = t.dataset.tab === key;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
    });
    bodyEl.innerHTML = activeProject.tabs[key];
    bodyEl.scrollTop = 0;
  };

  const openModal = (id) => {
    const project = PROJECTS.find((p) => p.id === id);
    if (!project) return;
    activeProject = project;
    lastFocus = document.activeElement;

    modalTag.textContent = `${project.tag} · ${project.year}`;
    modalTitle.textContent = project.name;
    tabsEl.innerHTML = Object.keys(project.tabs)
      .map((k, i) => `<button class="mtab${i === 0 ? ' active' : ''}" type="button" role="tab" aria-selected="${i === 0}" aria-controls="modalBody" data-tab="${escapeHtml(k)}">${escapeHtml(k)}</button>`)
      .join('');
    showTab(Object.keys(project.tabs)[0]);

    modal.removeAttribute('inert');
    modal.classList.add('open');
    document.body.classList.add('no-scroll');
    setTimeout(() => $('.modal-close').focus(), 60);
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('inert', '');
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open]');
    if (btn) openModal(btn.dataset.open);
  });
  tabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('.mtab');
    if (tab) showTab(tab.dataset.tab);
  });
  modal.addEventListener('click', (e) => {
    if (e.target.dataset.close) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // focus trap
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = $$('button, a[href], [tabindex]:not([tabindex="-1"])', modal).filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();

/* ─────────────────────────────────────────────────── 12. pointer fx ─── */
(function pointerFx() {
  const glow = $('#cursorGlow');
  if (!glow || reducedMotion || window.matchMedia('(hover: none)').matches) return;

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let cx = x;
  let cy = y;

  window.addEventListener('mousemove', (e) => {
    x = e.clientX;
    y = e.clientY;
    document.body.classList.add('has-pointer');
  });

  const loop = () => {
    cx += (x - cx) * 0.12;
    cy += (y - cy) * 0.12;
    glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(loop);
  };
  loop();

  // spotlight on cards
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.mini-card, .project-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
})();

/* ────────────────────────────────────────────────────── 13. copy ─── */
(function copyEmail() {
  const toast = $('#toast');
  let timer;

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('show'), 2400);
  };

  $$('[data-email]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const email = btn.dataset.email;
      const label = btn.querySelector('.copy-label');
      try {
        await navigator.clipboard.writeText(email);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = email;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch { /* clipboard unavailable */ }
        ta.remove();
      }
      showToast(`Copied — ${email}`);
      if (label) {
        const original = label.textContent;
        label.textContent = 'Copied!';
        setTimeout(() => (label.textContent = original), 2000);
      }
    });
  });
})();

/* ─────────────────────────────────────────────────────── 14. misc ─── */
(function misc() {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
