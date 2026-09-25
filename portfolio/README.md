# Liza Alam — Portfolio

A hand-built, dependency-free portfolio site: dark/light themes, animated case studies for
every project, and no framework, build step or template.

```
portfolio/
├── index.html      # structure + hero terminal markup
├── styles.css      # the full design system
├── content.js      # ← ALL the words live here (edit this to update the site)
├── script.js       # interactions: typing, tabs, modal, reveals, theme
├── smoke-test.mjs  # optional JSDOM checks (dev tool, not part of the site)
└── README.md
```

## Run it

It's static — anything that serves files will do:

```bash
# from the repo root
npx serve portfolio          # or: python3 -m http.server 4173 --directory portfolio
```

Then open `http://localhost:4173`. Opening `index.html` directly also works.

## Editing content

Everything visible is data in `content.js`:

| Constant | Controls |
|---|---|
| `SOCIALS` | GitHub / LinkedIn / email links in the hero, mobile menu and contact card |
| `ROTATING_WORDS` | The typing headline in the hero |
| `SKILL_CATEGORIES` | Skill tabs, blurbs and proficiency bars (`level: 0–100`) |
| `TOOLBELT` | The "also in the toolbelt" chips |
| `EXPERIENCE` | Internship cards (role, company, remote/duration, bullet points, stack) |
| `PROJECTS` | Project cards **and** their full case-study tabs (HTML allowed inside `tabs`) |

Common edits:

- **Email address** — search `hello@lizaalam.dev` in `content.js` and `index.html`, replace with yours.
- **LinkedIn URL** — the `SOCIALS` entry at the top of `content.js`.
- **Availability line** — the `.pill` text near the top of `index.html`.

## Design notes

- **Two themes.** Dark by default; the toggle stores the choice in `localStorage` and the
  `<html data-theme>` attribute drives the whole palette. Every colour is a CSS variable in the
  `:root` block of `styles.css` — change `--violet` / `--cyan` there to re-skin the entire site.
- **Motion respects the user.** `prefers-reduced-motion` disables typing, counters, parallax and
  reveal animations, and the `noscript` block keeps the page readable with JavaScript off.
- **No layout shift.** The hero terminal's output is pre-rendered and only revealed, so the panel
  occupies its final height from first paint.
- **Accessibility.** Skip link, focus-visible rings, labelled controls, tab/tabpanel roles,
  keyboard-closable modal with a focus trap, and 4.5:1+ contrast in both themes.
- **Performance.** Three tiny files, no runtime dependencies, no build. Fonts load from Google
  Fonts with `display=swap`.

## Smoke test (optional)

```bash
npm i jsdom
node smoke-test.mjs
```

Renders the page in JSDOM with real `<script>` tags and asserts that the skills, timeline,
project cards, modal, tab switching and theme toggle all build correctly.

## Status of the wording

Two things are opinionated defaults — change them if they don't match reality:

1. The hero pill says **"Available for full-time roles & freelance"**.
2. The email is a placeholder address (`hello@lizaalam.dev`).
