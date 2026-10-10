# Portfolio UI/UX Design System — Phase 1 Specification

**Owner:** Pugazenthi D — Data Engineer / Data Analyst
**Site:** https://pugazh308.github.io/PORTFOLIO/
**Phase:** 1 — Design system + page-level visual specification (no implementation)
**Locked direction:** Dark Editorial with Lime accents · Balanced density · Immersive motion · Hybrid Editorial + Technical
**Status:** Draft for review. Do not implement until approved.

> **Evidence legend used throughout:**
> **[Verified]** = read directly from the repo source this session (`index.html`, `styles.css`, `script.js`, `scene.js`).
> **[Assumption]** = not verified by running the live site or a real browser/device in this environment.
> I could **not** run the live URL, a real browser, screenshot tooling, a contrast analyzer, or physical devices here. Rendered-output, interaction-timing, and device claims are therefore labelled **[Assumption]** or computed by hand and labelled as such. Contrast ratios for the *new* palette were computed by hand from the WCAG relative-luminance formula and are labelled **[Computed]**.

---

## 1. Executive Summary

The current site (internally "Aurora Glass") is a competent, modern single-page portfolio: semantic HTML, a working dark/light theme, an interactive 3D (Three.js) hero, glassmorphism cards, scroll-reveal, scrollspy, and reduced-motion handling. **[Verified]**

However, measured against the **locked design direction**, it diverges on four fundamentals:

1. **Palette** — current is cyan / violet / pink aurora (`#5ed0ff`, `#a78bfa`, `#f472b6`); the locked direction is **dark editorial olive-charcoal with a single lime accent** (`#C4F56A`). These are different identities.
2. **Material** — current leans heavily on glassmorphism (translucent blur on nav, every card, buttons, hints) and decorative multi-colour gradients; the locked direction explicitly **reduces glassmorphism and removes decorative gradients** in favour of solid editorial surfaces.
3. **Type** — current display font is **Sora**; the locked direction is **Space Grotesk**. Body (Inter) and mono (JetBrains Mono) are already aligned.
4. **Signature** — current signature is a ~150 KB Three.js 3D graph; the direction favours an immersive but **lightweight, performance-respecting** data motif.

This document proposes a complete **Dark Editorial + Lime** design system (tokens, type, spacing, components, motion), a prioritised audit of the current build, page-by-page visual specs, responsive rules, and an accessibility/performance contract. It is a **redesign specification**, not a reskin: the goal is to make technical credibility legible in seconds, make projects easy to scan and verify, and feel intentional rather than templated.

**Headline recommendations (detail in §9):**
- Adopt the lime editorial palette and Space Grotesk as a deliberate identity reset.
- Replace heavy glassmorphism with solid `surface`/`elevated` cards + hairline borders; keep one restrained ambient effect, not five.
- Fix two correctness issues first: **content hidden if JS fails** (reveal starts at `opacity:0`) and the **nav breakpoint gap (781–920px)** where nav links wrap awkwardly. **[Verified]**
- Put **text first on mobile** — today the decorative 3D canvas renders above the name/role on narrow screens. **[Verified]**
- Resolve the open decision on the hero signature (lighter 2D canvas pipeline vs. lazy-loaded Three.js) before Phase 2.

---

## 2. Existing Website Audit

### 2.1 What was inspected
- `index.html` — full structure, semantics, meta, script/font loading. **[Verified]**
- `styles.css` — all tokens, components, media queries. **[Verified]**
- `script.js` — theme, nav, reveal, spotlight, count-up, rotator, progress, scrollspy, magnetic. **[Verified]**
- `scene.js` — Three.js graph with WebGL guard, reduced-motion path, off-screen pause (authored this session). **[Verified]**
- **Not** inspected: live rendering, real mobile/tablet devices, actual interaction timings, Lighthouse/axe output. **[Assumption]** flags used where relevant.

### 2.2 Current structure (verified)
Section order: Nav → Hero (two-column copy + 3D scene, then a 2-tile stats row) → About → Skills (7 cards) → Experience (3-entry timeline) → Projects (4 cards) → Certifications (5 link cards) → Education (2 cards) → Contact (4 link cards) → Footer. Headings: one `h1`, `h2` per section (with a visually-hidden numeric index still in the DOM), `h3` per card. **[Verified]**

### 2.3 Prioritised findings

Priority key: **Critical** (breaks usability/credibility), **High**, **Medium**, **Low**.

| # | Area | Current state **[Verified]** | Problem | Why it matters | Recommendation | Priority |
|---|------|------------------------------|---------|----------------|----------------|----------|
| 1 | Robustness | `.reveal { opacity: 0 }`; visibility only added by `script.js` via IntersectionObserver | If `script.js` fails to load or throws before the reveal block, **all revealed content stays invisible** | A single JS error = blank page for a recruiter; violates "no essential content hidden" | Ship a no-JS/safe fallback: `html.no-js .reveal { opacity:1 }` (or set `is-visible` by default and let JS *remove* it only when it will animate). Never gate content on JS. | **Critical** |
| 2 | Responsive nav | Burger appears at `≤780px`; hero collapses at `≤920px`; `.nav__links` is `flex-wrap: wrap` | At **781–920px** the full 7-link bar can wrap to two lines inside the pill | Looks broken on small laptops/large tablets; erodes credibility | Single breakpoint for nav collapse (recommend 900px) and remove `flex-wrap` on the desktop bar | **High** |
| 3 | Mobile hierarchy | `.hero__visual { order: -1 }` at `≤920px` | Decorative 3D canvas renders **above** name/role/value-prop on mobile & tablet | Buries the credibility message; likely hurts LCP | Text-first on mobile; visual below or reduced to a compact band | **High** |
| 4 | Direction mismatch | Palette cyan/violet/pink; display font Sora; heavy glass | Does not match locked Dark-Editorial-Lime direction | The brief's whole premise is a distinctive, non-generic identity | Adopt §3 tokens + §4 type; cut glass per §5 | **High** |
| 5 | Performance | Three.js r128 (~150 KB gzip **[Assumption]**) + 3 blurred aurora blobs + many `backdrop-filter` layers + spotlight listeners | Multiple simultaneous GPU-heavy effects | Jank/battery drain on low-end Android; conflicts with "performance as a constraint" | Keep **one** ambient effect; lazy-load or replace Three.js (see §9 open decision); cap blur usage | **High** |
| 6 | Evidence gap | Projects have **no images/screenshots** | Recruiters can't *see* the Star Air dashboard or app UIs | Visual proof converts far better than prose | Define image slots now (§5, §C); add assets in a later phase | **High** |
| 7 | Contrast (light theme) | `--text-mute:#6b7891` on translucent white glass; stat gradient `#0ea5e9→#7c3aed` on near-white | Small mono captions and gradient numerals sit near the AA threshold | WCAG 2.2 AA risk for normal-size text | New dark-only palette resolves most of it; verify any retained light theme with a real analyzer | **Medium** |
| 8 | Focus visibility | `.btn`/`.icon-btn` have a `:focus-visible` ring; `.nav__links a`, `.cert`, `.contact__card`, body links rely on UA default outline | Inconsistent, low-contrast focus on some controls | Keyboard users lose their place; WCAG 2.4.7 | One token-driven focus ring on **all** interactive elements (§7) | **Medium** |
| 9 | Semantics | Hidden `.section__num` ("01"…) is `display:none` but still in the `h2` text | Screen readers announce "01 About" | Minor noise for AT users | Move numbering to a `::before` with `aria-hidden`, or drop from DOM | **Low** |
| 10 | Nav coupling | `.nav { margin-bottom: -68px }` pulls hero under sticky nav | Fragile magic-number overlap | Small content/padding changes can cause overlap | Use normal flow + `scroll-margin-top`; avoid negative-margin coupling | **Low** |
| 11 | Link affordance | Body links (`.projects__note a`) distinguished by colour; underline only on hover | Colour-only link signifier | WCAG 1.4.1 (use of colour) | Persistent underline or non-colour cue for in-text links | **Low** |
| 12 | Touch targets | Nav links ~32px tall; icon buttons 38px | Passes WCAG 2.2 AA (24px min) but below the 44px comfort target | Mis-taps on mobile | Target ≥44px for primary tap targets in the redesign | **Low** |
| 13 | Content labelling (noted, out of scope) | "Licenses & Certifications" lists course/workshop **badges** as certifications | Slight over-statement vs. one true exam cert (DP-700) | Credibility with sharp reviewers | Phase-later: split "Certifications" vs "Badges & Courses" (content change — not this phase) | Low |

### 2.4 What is already good (keep)
- Semantic landmarks (`header`/`main`/`footer`/`nav`), one `h1`, sensible `h2`/`h3`. **[Verified]**
- `prefers-reduced-motion` is respected globally and in JS (reveal, count-up, rotator, spotlight, magnetic all gated). **[Verified]**
- `scene.js` guards WebGL, provides a CSS fallback orb, and pauses off-screen/hidden. **[Verified]**
- Theme persistence via `localStorage` wrapped in try/catch. **[Verified]**
- Resume/LinkedIn/GitHub/email conversion links already present in hero + contact. **[Verified]**
- Dependency-light: only Three.js + Google Fonts are external. **[Verified]**

---

## 3. Design Tokens (Finalised)

Dark-editorial, single-accent. These are the Phase-1 source of truth.

### 3.1 Core palette (locked values, retained)

| Token | Value | Role |
|------|-------|------|
| `--bg` | `#111310` | Page background |
| `--surface` | `#1B1E19` | Cards, panels |
| `--elevated` | `#242720` | Hover/active/raised surfaces, inputs |
| `--text` | `#F3F2EB` | Headlines, primary content |
| `--text-secondary` | `#A3A69D` | Body support, metadata |
| `--accent` | `#C4F56A` | Primary actions, active state, focus, key highlight |
| `--border` | `#363930` | Dividers, card outlines |

### 3.2 Derived / semantic tokens (proposed additions)

| Token | Value | Role | Note |
|------|-------|------|------|
| `--accent-ink` | `#141611` | Text/icon **on** lime surfaces | Never white on lime |
| `--accent-dim` | `#9FD14E` | Hover of lime links/borders | Slightly deeper lime |
| `--accent-soft` | `rgba(196,245,106,0.12)` | Tint fills (active nav, selected chip) | Low-alpha lime |
| `--text-faint` | `#767A6F` | Captions, disabled text | Must only be used ≥ the computed AA pairings in §7 |
| `--focus` | `#C4F56A` | Focus ring colour | = accent for max contrast |
| `--danger` | `#F2795B` | Error/validation (if forms added later) | Reserve |
| `--surface-translucent` | `rgba(27,30,25,0.72)` | **Sticky nav only** scrolled bg | The *one* sanctioned blur surface |
| `--shadow-1` | `0 1px 2px rgba(0,0,0,.4)` | Resting card | Subtle |
| `--shadow-2` | `0 12px 32px -16px rgba(0,0,0,.65)` | Hover/raised | Editorial, soft |

**Rule:** lime is a scalpel, not a highlighter. At most **one dominant lime element per viewport** (e.g., the primary CTA *or* the active nav item, not a wall of lime). Everything else earns attention through type, spacing, and hierarchy. This is the core of "editorial."

### 3.3 Contrast verification (new palette) **[Computed]**

Hand-computed from WCAG relative luminance; recommend re-checking with a real analyzer before Phase 2 sign-off.

| Pair | Ratio | Verdict |
|------|-------|---------|
| `--text` on `--bg` | ≈ 16.8:1 | AAA |
| `--text-secondary` on `--bg` | ≈ 7.5:1 | AA/AAA (normal text) |
| `--text-secondary` on `--surface` | ≈ 6.8:1 | AA |
| `--text-secondary` on `--elevated` | ≈ 6.0:1 | AA |
| `--accent` on `--bg` | ≈ 14.9:1 | AAA (lime text/links on dark) |
| `--accent-ink` on `--accent` | ≈ 14.9:1 | AAA (dark text on lime buttons) |
| **white on `--accent`** | ≈ 1.1:1 | **FAILS — never do this** |
| `--border` on `--bg` | ≈ 1.5:1 | Non-text divider only; **not** a sole state indicator (needs 3:1 → use focus ring/accent instead) |

**Implication:** lime buttons use `--accent-ink` text. Focus/active states must not rely on `--border` alone.

### 3.4 Light theme decision
Locked direction is **Dark Editorial**. **Recommendation:** ship **dark-only** for Phase 2 (cleaner identity, half the QA surface, removes the current light-theme contrast risks in finding #7). Keep the toggle *out* unless the owner wants it. **[Open decision — see §9.]** If a light theme is retained later, it must be specified and contrast-verified as its own token set.

---

## 4. Typography System

### 4.1 Families
- **Display:** `Space Grotesk` (600/700) — headlines, section titles, stat numerals. Geometric, technical character.
- **Body:** `Inter` (400/500/600) — paragraphs, UI text.
- **Mono / technical labels:** `JetBrains Mono` (400/500) — eyebrows, section indices, tech tags, metadata, dates.
- Fallback stacks: `Space Grotesk, "Segoe UI", system-ui, sans-serif` · `Inter, system-ui, -apple-system, sans-serif` · `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`.

**Loading:** self-host subset `woff2` (latin) for the exact weights used, `font-display: swap`, `preload` the two above-the-fold faces (Space Grotesk 700, Inter 400). This removes the third-party Google Fonts request and trims the current 5-weight Sora + Inter + mono payload. **[Recommendation]** If self-hosting is out of scope, keep Google Fonts but cut to the weights listed above.

### 4.2 Type scale (fluid)

| Role | Font / weight | Size (`clamp(min, vw, max)`) | Line-height | Letter-spacing |
|------|---------------|------------------------------|-------------|----------------|
| Display (H1) | Space Grotesk 700 | `clamp(2.5rem, 5.5vw, 4.5rem)` | 1.05 | −0.02em |
| H2 (section) | Space Grotesk 600 | `clamp(1.75rem, 3.5vw, 2.5rem)` | 1.15 | −0.01em |
| H3 (card title) | Space Grotesk 600 | `1.25rem` (20px) | 1.3 | −0.005em |
| Body-lg (intro) | Inter 400 | `clamp(1.0625rem, 1.4vw, 1.1875rem)` | 1.6 | 0 |
| Body | Inter 400 | `1rem` (16px) | 1.65 | 0 |
| Small / meta | Inter 500 | `0.875rem` (14px) | 1.5 | 0 |
| Label / eyebrow (mono) | JetBrains Mono 500 | `0.75rem` (12px) | 1.4 | 0.08em, UPPERCASE |
| Stat numeral | Space Grotesk 700 | `clamp(2rem, 4vw, 3rem)` | 1.0 | −0.01em |

**Rules:** body measure ≤ 70ch; never size body below 16px; mono reserved for *technical* labels (tech tags, dates, section indices, credential IDs) — not paragraphs. Minimum 1.5 line-height for body blocks per WCAG 1.4.12.

---

## 5. Spacing, Grid & Layout

### 5.1 Spacing scale (4px base)
`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120, 144` → tokens `--space-1 … --space-14` (or t-shirt: `xs=8, sm=12, md=16, lg=24, xl=32, 2xl=48, 3xl=64, 4xl=96, 5xl=144`).

### 5.2 Container & gutters
- Max content width: **1200px**.
- Desktop gutters: **64px** (≥1200), stepping to **40px** (1024–1199).
- Tablet gutters: **32px**.
- Mobile gutters: **20–24px**.
- Content column for long-form text capped at **~70ch** even inside the 1200px container.

### 5.3 Section rhythm
- Desktop vertical section padding: **120–144px**.
- Tablet: **88–104px**.
- Mobile: **64–80px**.
- Consistent **24px** inter-card gaps (grids), **16px** for dense metadata rows.

### 5.4 Grid proportions
- **Hero:** 2-col `1.1fr / 0.9fr` (copy / visual) ≥1024px; single column below, **copy first**.
- **Skills:** `repeat(auto-fit, minmax(240px, 1fr))`.
- **Projects:** featured row = 1 full-width panel; supporting = `repeat(auto-fit, minmax(300px, 1fr))` (see §C).
- **Certs / Contact:** `repeat(auto-fit, minmax(260px, 1fr))`.

### 5.5 Radii & borders
- Card radius: **14px**; button radius: **10px**; pill/chip: **999px**; input: **10px**.
- Hairline borders `1px solid var(--border)`; never rely on a border alone to signal an interactive state.

### 5.6 Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768–1199px
- **Desktop:** ≥ 1200px
- Internal layout shifts may also use 900px/1024px where content demands (e.g., hero collapse at 1024px). Keep **one** nav-collapse breakpoint to avoid finding #2.

---

## 6. Component Specifications

States to define for every interactive component: **default, hover, active/pressed, focus-visible, disabled**, and (where relevant) **loading**.

### 6.1 Navigation (sticky)
- Height ≈ 64px; max-width 1200px; brand/monogram left, links centre/right, résumé action far right.
- **Transparent over hero**, transitioning to `--surface-translucent` + hairline bottom border after ~24px scroll (single sanctioned blur). No negative-margin coupling.
- Links: `--text-secondary` default → `--text` hover; **active = `--accent` text + `--accent-soft` pill** (scrollspy).
- Résumé action styled as a **secondary/outline button** (see 6.2) to stand out from text links without competing with the hero's primary lime CTA.
- Focus-visible: 2px `--focus` ring, 2px offset.
- **Mobile (<900px):** hamburger → full-height or dropdown sheet on `--surface`, hairline border, 44px rows, `aria-expanded` toggled, focus trapped while open, `Esc` closes, body scroll locked. First focus moves to the first link on open; focus returns to the toggle on close.

### 6.2 Buttons
- **Primary:** `--accent` bg, `--accent-ink` text, radius 10px, padding 12–14px × 22–24px. Hover: `--accent-dim` or +4% brightness + `--shadow-2`; active: translateY(1px); focus: ring.
- **Secondary (outline):** transparent bg, `1px --border`, `--text`; hover: border `--accent`, text `--accent`, `--accent-soft` fill.
- **Text button / link-button:** no border; `--accent` text; underline or icon affordance on hover.
- Disabled: 40% opacity, `cursor: not-allowed`, no hover.
- Max **one** primary (lime) button per viewport; everything else secondary/text. Drop the "magnetic" transform (it fights Fitts's-law targeting and adds pointer cost) or make it ≤4px and `pointer:fine`-only.

### 6.3 Text links (in prose)
- `--accent` with persistent 1px underline (offset 2px); hover deepens to `--accent-dim`. Never colour-only.

### 6.4 Project card (supporting)
- `--surface` bg, hairline border, radius 14px, padding 24px, `flex-column`.
- Content order: **media slot → eyebrow (org/type, mono) → title (H3) → 2–3 line summary → tech tags (mono chips) → actions (Code / Live / Case study) pinned to bottom**.
- Hover: border → `--accent` at low alpha, `--shadow-2`, translateY(−4px), media subtle zoom. Focus-within mirrors hover. Respect reduced-motion (no transform).
- Entire card not a single link if it holds multiple actions; make the title the primary link and actions separate (avoid nested interactive elements).

### 6.5 Featured-project panel (Star Air)
- Full-width, 2-col on desktop: **left** = large media slot (16:10) for the dashboard/architecture; **right** = title, role eyebrow, problem→approach→outcome summary, tech stack, actions.
- Distinct from supporting cards via size and a single lime accent (e.g., a lime "Featured" eyebrow or left keyline). Not a different colour system.
- Mobile: media on top, content below.

### 6.6 Technical badge / tag chip
- Mono 12px, `--surface`/`--elevated` bg, hairline border, radius 999px or 8px, padding 4–6px × 10px, `--text-secondary` text. Non-interactive by default; if filterable later, add hover/selected (`--accent-soft` + `--accent` text).

### 6.7 Section heading + index
- `h2` in Space Grotesk; optional mono index (e.g., `// 02`) via `::before`, `aria-hidden`, `--text-faint`/`--accent`. Index must not be part of the accessible heading name (fixes finding #9).

### 6.8 Timeline entry (Experience)
- Vertical rail (`--border`) with lime node per entry (filled for current role, outline for past).
- Hierarchy: **role (H3)** → company (`--accent` or `--text`) → date (mono, `--text-secondary`) → employment-type tag → bullets.
- Keep the distinction between **training**, **internship**, and **professional delivery** explicit (e.g., a small mono tag: `Full-time`, `Internship`, `Training`) — do not inflate. (Presentation only; no content change.)

### 6.9 Certification / badge item
- `--surface` card, hairline border, radius 14px. Title (H3, 16px), issuer + credential meta (mono, `--text-secondary`), external-link affordance (↗) visible on hover/focus.
- Visually separate a true **Certification** from **Badges & Courses** (grouping/subheading) — presentation of the split can be specced now; the content re-labelling is a later-phase decision (finding #13).

### 6.10 Architecture diagram / data-viz (hero signature + any inline diagrams)
- Must have a **text alternative**: `role="img"` + `aria-label`, or an adjacent visually-hidden description, or a `<figure><figcaption>`.
- Colours limited to `--text`, `--text-secondary`, `--accent`, `--border` on `--bg` — no rainbow.
- Must have a **static, meaningful** state for reduced-motion and for no-WebGL/no-JS (not a blank box). A labelled SVG pipeline (Source → Stage → Transform → Mart → BI) is a strong editorial fallback and doubles as the reduced-motion state.

### 6.11 Contact links
- Grid of cards or a single editorial block: label (mono, uppercase) + value (Inter 500). Email/phone/LinkedIn/GitHub. 44px targets. Focus ring. `mailto:`/`tel:` retained.

### 6.12 Global states
- **Focus-visible:** 2px `--focus` ring + 2px offset on **every** interactive element (fixes #8).
- **Loading (3D/data):** skeleton or the static SVG fallback; never a blank region.
- **Reduced-motion:** all transforms/animations replaced by instant state or opacity-only.

---

## 7. Motion & Interaction System

Immersive **through restraint and craft**, not volume. One ambient system + purposeful micro-interactions.

### 7.1 Timing & easing
- Micro (hover, focus, button, nav): **150–200ms**, `ease-out` (`cubic-bezier(0.22,1,0.36,1)` for a crisp settle).
- Section entrance / hero sequence: **450–650ms**, standard ease-out, **staggered 60–90ms** between siblings.
- No single animation over ~700ms. No infinite high-frequency motion in the reading area.

### 7.2 Hero entrance
- On load: headline, eyebrow, sub, CTAs fade+rise (12–16px), staggered ~70ms. **Non-blocking** — content is present in the DOM and readable even if animation never runs (ties to finding #1). Completes < 900ms total.

### 7.3 Signature data motif (hero)
- The data-pipeline / node motif animates subtly (slow drift, occasional "data pulse" along an edge). Amplitude low; it must not pull the eye off the headline.
- **Ambient, not interactive-required.** Drag/parallax is an enhancement; the content and message never depend on it.
- Pauses when off-screen and when the tab is hidden (already done in `scene.js` — carry forward). **[Verified]**
- Reduced-motion → static labelled diagram.

### 7.4 Section reveals
- IntersectionObserver fade+rise, threshold ~0.15, trigger once, stagger children.
- **Critical:** default state must be *visible*; JS only adds the animation when it is safe to animate (no-JS and errors leave content shown). Fixes #1.

### 7.5 Project card hover/focus
- translateY(−4px), border→accent(low alpha), shadow raise, optional media zoom ≤1.03. `focus-within` mirrors it. Reduced-motion: colour/shadow only.

### 7.6 Nav / mobile menu
- Scrolled bg + border crossfade 180ms. Mobile sheet slide/fade 200ms; focus management per 6.1.

### 7.7 Buttons & links
- 150ms colour/shadow/translate. Pressed = 1px down. Keep "magnetic" ≤4px, pointer-fine only, or remove (recommended for editorial calm).

### 7.8 Ambient background
- **One** effect only. Recommend a very low-contrast static or slow-drifting technical grid/plot texture in `--border` at low alpha — not three blurred colour blobs. Must not reduce text contrast.

### 7.9 Hard constraints
- No scroll hijacking. No blocking intro. No content hidden pending animation. No permanent distracting motion in reading zones. Respect `prefers-reduced-motion`. Touch devices get equivalent non-hover affordances. Motion must not regress INP/CLS.

---

## 8. Page-Level Visual Specification

Content and professional claims unchanged. Presentation only.

### A. Navigation
- 64px sticky bar, 1200px max, 64/40/24px gutters by breakpoint.
- Monogram "PD" left (lime-ink on lime tile, or outline), nav links centre-right, **Résumé** as outline button right, theme toggle only if a light theme is kept (see §3.4).
- Transparent over hero → `--surface-translucent` + hairline on scroll.
- Mobile (<900px): hamburger → accessible sheet (6.1).

### B. Hero
- Two columns ≥1024px (`1.1fr / 0.9fr`): **left copy**, **right signature visual**.
- Line 1 eyebrow (mono, status dot). H1 display with a tasteful break; keep the rotating phrase but ensure the base phrase is real text (SEO + no-JS). Intro ≤ 60ch. CTAs: **one primary (lime)** = Résumé *or* LinkedIn; the rest secondary/outline (GitHub, Email). 
- Visual = signature data motif with labelled static fallback.
- Background: subtle technical grid, low alpha, masked.
- **Mobile: copy first, visual second** (fixes #3); stats become a 2-up row beneath.
- Establishes "Data Engineer" identity instantly via type + the data motif.

### C. Projects (featured + supporting)
- **Star Air = featured panel** at the top (6.5): large 16:10 media slot (dashboard or galaxy-schema architecture), problem→approach→outcome, stack chips, Code/Live/Case-study actions. Visual prominence, not rewritten content; no fabricated metrics.
- Supporting grid (DeutschMate, Macular, Sentiment) as uniform cards (6.4) with **consistent media aspect ratio (16:10)** and per-card icon/eyebrow so they read as a set without looking identical.
- Each card: repo + demo actions pinned bottom; hover/focus per 7.5.
- Mobile: single column, featured stacks media-over-content.
- Image specs: 16:10, served responsive (`srcset`), lazy-loaded, explicit width/height to prevent CLS, descriptive `alt`. (Assets added later; slots defined now.)

### D. Experience & Skills
- Experience: vertical timeline (6.8); role→company→date→type-tag→bullets; current role node filled lime.
- Skills: grouped cards (Databases & Query, Transformation & Pipelines, Modelling & Warehousing, Programming, Web & Backend, BI & Viz, Languages) with mono chips. **No progress bars.** Primary (DE) groups ordered first.
- Certifications: card grid (6.9) with issuer/credential meta and ↗; present a clear Certification vs. Badges/Courses grouping (presentation only this phase).

### E. Supporting projects layout
- A single reusable card pattern (6.4) flexible enough for data, full-stack-AI, and ML projects: swap icon, eyebrow, stack chips, and action set per card so types stay distinguishable without bespoke layouts.

### F. Contact & Footer
- Contact: short editorial lead + link grid (Email, Phone, LinkedIn, GitHub) as 44px targets; one lime primary (e.g., Email) if desired.
- Footer: compact — monogram, mini-nav, © + year, "back to top". Hairline top border, `--text-secondary`, mono for the meta line.
- Mobile: stack, centre-left aligned, 44px targets.

---

## 9. Responsive Behaviour

### Desktop (≥1200px)
- Full 2-col hero; multi-col grids; 120–144px section rhythm; 64px gutters; full nav bar; full (bounded) motion.

### Tablet (768–1199px)
- Hero collapses to single column at 1024px, **copy first**; grids 2-col; 88–104px rhythm; 32–40px gutters; nav still a bar until 900px then hamburger; project media 16:10 maintained; motion intact but lighter stagger.

### Mobile (<768px)
- Single column throughout; **copy-first hero**, compact/again-smaller signature visual (or static fallback for perf); 64–80px rhythm; 20–24px gutters; hamburger sheet; stats 2-up; type steps down per §4 clamps; images full-width 16:10 with `srcset`; disable parallax/magnetic/spotlight (pointer-coarse); 44px targets; keep reveal (opacity-only) but never hide content if JS fails.

For each section, responsive intent: **column count** collapses toward 1; **type** scales via clamp; **media** keeps aspect ratio and re-crops art-directed where needed; **nav** switches to sheet; **spacing** steps down one tier; **motion** reduces pointer-driven effects; **targets** grow to ≥44px. Not a shrink of desktop — re-ordered for mobile reading priority.

---

## 10. Accessibility & Performance Contract

### Accessibility — target **WCAG 2.2 AA**
- **Contrast:** use only the §3.3-verified pairings; re-verify with a real analyzer. Lime buttons = `--accent-ink` text. UI state never signalled by `--border` alone.
- **Keyboard:** every control reachable and operable; visible 2px lime focus ring everywhere; logical tab order; mobile menu traps focus + `Esc` + restores focus; skip-to-content link before nav.
- **Semantics:** keep landmarks + single `h1`; section indices `aria-hidden`; no heading-level skips.
- **Links/buttons:** descriptive names ("Download résumé (PDF)", "Star Air — view code on GitHub"); external links keep `rel="noopener"` and an accessible "opens in new tab" cue.
- **Images/diagrams:** meaningful `alt`; the data motif has a text alternative and a static fallback.
- **Reduced motion:** honoured for every animation (carry forward current behaviour).
- **Zoom/reflow:** usable at 200% zoom and 320px width with no loss of content/function (WCAG 1.4.10); no `maximum-scale`/`user-scalable=no`.
- **Targets:** ≥44px primary; never below 24px (2.5.8).
- **Forms (if added later):** labels, error text, `aria-describedby`.

### Performance — treat as design constraints
- **No new animation library.** Resolve the Three.js question (§ open decisions). If kept: `defer` + lazy-init on view + the existing off-screen pause; if replaced: a small bespoke Canvas2D/SVG motif.
- **One** ambient effect; cap `backdrop-filter` to the single nav surface.
- **Fonts:** self-hosted woff2 subset, `swap`, preload 2 faces; drop unused weights.
- **Images:** optimized (AVIF/WebP), responsive `srcset`, lazy, explicit dimensions (no CLS).
- **No layout shift:** reserve media boxes; avoid late-injected content moving the page.
- **Lightweight CSS:** token-driven, no heavy frameworks; current vanilla approach is a strength — keep it.
- Budget targets **[Assumption, to validate in later phase]**: LCP < 2.5s on mid mobile, CLS < 0.1, INP < 200ms, JS (excl. optional 3D) < ~30KB gzip.

---

## 11. Implementation Priorities & Dependencies (for Phase 2 planning only)

1. **Tokens + type + base reset** (foundation; everything depends on it).
2. **Fix correctness: no-JS reveal fallback (#1) + nav breakpoint (#2) + mobile copy-first hero (#3).**
3. **Nav + buttons + links + focus system** (shared primitives).
4. **Hero** incl. signature-motif decision (§ open decisions) + static fallback.
5. **Projects** (featured + supporting; image slots) — highest recruiter value.
6. **Experience / Skills / Certs / Education.**
7. **Contact / Footer.**
8. **Motion pass** (entrances, hover, ambient) within the reduced-motion contract.
9. **A11y + performance validation** (axe, Lighthouse, keyboard pass, 200% zoom, real device check).

Dependencies: tokens → components → sections → motion → validation. Image assets block the projects visual upgrade (owner to provide screenshots). Font self-hosting blocks the font-loading optimization.

---

## 12. Unresolved Design Decisions (need owner input before Phase 2)

1. **Hero signature:** keep Three.js (lazy-loaded) **or** replace with a lighter bespoke Canvas2D/SVG data-pipeline motif? *Recommendation: replace with a lightweight, labelled pipeline motif — better matches "performance as a constraint" and the editorial tone; the Three.js graph is impressive but heavy and only decorative.*
2. **Light theme:** dark-only (recommended) or retain a toggle? Affects token work and QA.
3. **Project media:** are real screenshots/architecture diagrams available (Star Air dashboard, DeutschMate UI, Macular app)? If company assets are confidential, do we use sanitized diagrams instead?
4. **Font hosting:** self-host woff2 (recommended) vs. keep Google Fonts?
5. **Certifications vs Badges labelling:** adopt the split now (presentation) and re-label content in a later phase — confirm wording when we get there (content change, not this phase).
6. **"Magnetic" buttons / cursor spotlight:** keep (reduced) or remove for editorial calm? *Recommendation: remove spotlight, keep button micro-motion only.*

---

## 13. Phase 1 Acceptance Checklist

- [x] Documented colour palette + semantic tokens (§3) with contrast verification (§3.3).
- [x] Typography system + responsive type scale (§4).
- [x] Spacing, grid, container, breakpoints (§5).
- [x] Component specs + interaction states (§6).
- [x] Navigation + section hierarchy (§2.2, §8).
- [x] Desktop / tablet / mobile layouts (§9 + per-section §8).
- [x] Motion guidelines + reduced-motion behaviour (§7).
- [x] Accessibility (WCAG 2.2 AA) + performance requirements (§10).
- [x] Prioritised UI/UX audit (§2.3).
- [x] Section-by-section visual specification (§8).
- [x] Explicit unresolved decisions (§12).

**Phase 1 is a specification only. No website files were modified. Awaiting approval before Phase 2 (homepage visual design + implementation planning).**


---

# Phase 1 Decision Resolution + Phase 2 Homepage Design and Implementation Plan

**Status:** Design decisions finalized; Phase 2 planning only.
**Implementation status:** NOT APPROVED. No website code or existing website files may be changed until the owner explicitly approves implementation.

## 14. Resolved Design Decisions

The following decisions supersede the corresponding open items in §12.

### 14.1 Hero signature: lightweight animated SVG pipeline

**Decision: Replace Three.js.**

Use a bespoke, lightweight SVG data-pipeline illustration rather than a WebGL/Three.js scene.

Design intent:
- Show a clear flow from source data through staging and transformation to warehouse/marts and analytics.
- Use the existing design tokens: text, secondary text, lime accent, and border on the dark background.
- Make the diagram feel alive with restrained SVG/CSS animation: subtle path-drawing on entry and occasional low-amplitude data pulses.
- Avoid particle clouds, simulated dashboards, excessive node movement, and visual effects that compete with the headline.
- Preserve a static, meaningful SVG state if animation is disabled, JavaScript fails, or reduced motion is requested.
- Provide an accessible text alternative. The graphic must not carry essential information that is unavailable elsewhere in text.
- Prefer CSS/SVG animation over adding an animation library.

Planning note: SVG is the selected design direction. Actual bundle size, loading behaviour, and browser performance must be validated during implementation and testing; do not claim measured performance gains before measuring them.

### 14.2 Theme: dark-only

**Decision: Remove the light/dark theme toggle.**

- The design system has one intended appearance: charcoal, warm white, muted grey, and lime.
- Remove theme-switching from the future design plan and QA matrix.
- Retain system-level accessibility features such as reduced motion; dark-only does not mean ignoring user preferences.
- Verify text and interface contrast against the final rendered components.

### 14.3 Project media: real screenshots are available

**Decision: Plan around genuine project screenshots.**

- Use real screenshots supplied by the owner for the applicable dashboard and application projects.
- Star Air should receive the primary media slot in the featured-project panel.
- Use actual project visuals rather than stock images, invented dashboards, or fabricated results.
- Confirm that screenshots contain no credentials, personal data, confidential business information, or proprietary information that should not be public.
- If an image cannot be shared safely, use a sanitized architecture diagram based on the real project rather than presenting a mockup as a real application.
- Do not crop out context in a way that misrepresents the work.
- During implementation, use responsive image sizes, explicit dimensions/aspect ratios, descriptive alt text, and lazy loading for below-the-fold media.

Asset inventory is still required in Phase 2 planning: list the actual available files, which project each belongs to, image dimensions, confidentiality status, and any gaps. The statement that real screenshots are available does not establish which exact files or projects they cover.

### 14.4 Fonts: self-host WOFF2

**Decision: Self-host font files.**

- Use Space Grotesk for display typography, Inter for body/UI text, and JetBrains Mono for technical metadata.
- Self-host optimized WOFF2 subsets for the required character set and weights.
- Use `font-display: swap` and preload only the minimum above-the-fold fonts justified by testing.
- Keep robust system-font fallbacks.
- Do not fetch fonts from Google Fonts at runtime once self-hosting is implemented.
- Confirm font licenses and retain required license notices in the repository.
- Do not add unused weights or duplicate font files.

### 14.5 Cursor spotlight and magnetic buttons

**Decision: Remove both effects.**

- Remove cursor spotlight effects.
- Remove magnetic pointer-following button movement.
- Keep purposeful micro-interactions: clear hover/focus states, subtle card elevation, button press feedback, navigation transitions, and restrained section reveals.
- Do not make important actions depend on hover.
- On coarse pointers and touch devices, preserve equivalent visible affordances without pointer-specific effects.

### 14.6 Certification presentation

**Decision: Separate the presentation of Certifications from Badges & Courses; do not alter content in this phase.**

- Define two distinct visual groups in the design specification.
- Preserve existing item names, issuers, links, and descriptions for now.
- Do not silently reclassify an item or rewrite its label during Phase 2 planning.
- During a later content-review phase, the owner can approve any reclassification or wording changes based on the actual credentials.

## 15. Phase 2 Objective and Boundaries

Phase 2 is the **homepage visual design and implementation plan**, not implementation.

Its objective is to turn the approved design system into a concrete, section-by-section homepage blueprint grounded in the existing website and available real project assets.

### In scope
- Define the homepage composition and visual hierarchy.
- Specify section proportions, alignment, spacing, image slots, and responsive changes.
- Detail the hero SVG pipeline composition and its static/reduced-motion states.
- Map real project screenshots to their intended slots, once the files are inventoried.
- Define the interaction sequence and motion behaviour.
- Create a component-by-component implementation plan and dependencies.
- Define validation and acceptance tests.

### Out of scope
- Editing `index.html`, `styles.css`, `script.js`, `scene.js`, or any other website source.
- Writing or applying implementation code.
- Deploying to GitHub Pages or changing repository configuration.
- Rewriting project descriptions, experience, achievements, credentials, or other existing content.
- Inventing performance metrics, business outcomes, or project evidence.
- Removing existing files or dependencies before implementation is explicitly approved.

**Stop condition:** deliver the plan and wait for explicit owner approval. Do not interpret the request to plan Phase 2 as permission to implement it.

## 16. Phase 2 Homepage Visual Blueprint

The current section order from the repository audit remains the baseline. This is a visual and presentation plan, not a content rewrite.

### 16.1 Global page frame

- Dark-only editorial system using the approved design tokens in §3.
- Centered content container with a maximum width of approximately 1,200px.
- Consistent responsive gutters and section spacing from §5.
- Hairline separators used to establish rhythm, not to box every element.
- One dominant lime action per viewport where practical.
- Solid card surfaces as the default; reserve translucent blur for the scrolled navigation only.
- No cursor spotlight, magnetic movement, or decorative multicolour gradients.
- Keep semantic structure and all existing content intact during design planning.

### 16.2 Navigation

Composition:
- Monogram/brand at the left.
- Existing section links in a clear horizontal sequence on desktop.
- Résumé as a secondary/outline action.
- Transparent over the top of the hero; transitions to the sanctioned dark translucent surface and border after scrolling.
- One consistent breakpoint for collapsing the navigation; target approximately 900px, subject to actual content testing.
- Mobile menu must be keyboard operable, announce its expanded state, close with Escape, restore focus to the trigger, and prevent background scrolling while open.

Visual rules:
- Compact 64px target height.
- Clear text hierarchy and generous enough link spacing.
- Active section state uses lime text and a subtle lime-tinted background.
- Visible focus ring on every interactive item.
- No theme toggle.

### 16.3 Hero

Desktop composition:
- Two-column layout at sufficiently wide viewports: approximately 1.1fr copy to 0.9fr visual.
- Left: retain the existing eyebrow, headline, intro, and calls to action without rewriting their wording.
- Right: SVG pipeline illustration.
- Maintain a clear gap between text and visual; avoid compressing the headline to make room for the illustration.
- Background grid may be used at very low contrast, masked so it does not interfere with reading.
- Only one primary lime CTA; other actions remain secondary or text links.

SVG visual sequence:
1. Source node.
2. Ingestion/staging node.
3. Transformation/dbt node.
4. Warehouse/mart node.
5. Analytics/output node.

The exact node labels must reflect the existing project/portfolio content and must not imply tools or systems the owner has not used. The motif is a professional signature, not a claim that the user's personal workflow always follows one specific architecture.

Motion:
- On entry, reveal connection paths and nodes in a short, non-blocking sequence.
- Use occasional low-frequency data pulses only if they remain subtle.
- Avoid continuous high-frequency movement.
- Pause when off-screen where scripting is used.
- Reduced-motion and no-JavaScript states display the complete static pipeline.

Mobile composition:
- Text, name, role, and calls to action appear first.
- Pipeline appears below the copy in a compact, readable form.
- Stats remain below the core introduction, using the existing content.
- No visual canvas or decorative graphic may appear above the professional identity on mobile.

### 16.4 About

- Keep the existing content unchanged.
- Use a restrained editorial text block with a comfortable measure of approximately 60–70 characters per line.
- Use a clear section heading, optional decorative index that is hidden from assistive technology, and consistent vertical spacing.
- Avoid a large glass panel around ordinary text.
- On desktop, the text may align with a narrow secondary column or small metadata area only if this does not make the section feel sparse or fragment the reading flow.
- On mobile, present a straightforward single-column reading experience.

### 16.5 Skills

- Keep existing skill names and categories unchanged in this phase.
- Present skills as grouped solid-surface cards or compact editorial groups, using the existing category structure where possible.
- Prioritize the data-engineering groups visually without deleting or hiding other skills.
- Use small technical chips with consistent spacing and restrained borders.
- Do not use proficiency percentages or decorative progress bars.
- Desktop: multiple columns based on available width; tablet: two columns where readable; mobile: one column or compact grouped flow.
- Ensure chips wrap naturally and do not cause horizontal overflow.

### 16.6 Experience

- Use a vertical timeline with a thin neutral rail and lime nodes.
- Make role/company the strongest metadata; dates and employment type are secondary.
- Keep all existing role descriptions and dates unchanged.
- Clearly preserve the distinction already present in the content between training, internships, and professional employment; do not invent or change labels in this phase.
- Use simple text hierarchy rather than enclosing every entry in a heavy card.
- Mobile timeline spacing must allow the date and role to wrap without collision.

### 16.7 Projects

Featured Star Air panel:
- Full-width featured section with a two-column desktop layout.
- Left: real dashboard screenshot or a genuine, sanitized architecture diagram.
- Right: existing title, summary, technology metadata, and existing actions.
- Media target aspect ratio: approximately 16:10.
- Use one restrained lime accent to distinguish the featured project.
- Preserve existing wording and claims. Do not add numerical outcomes or production claims.

Supporting projects:
- Use a consistent card family with flexible content for application, AI, and machine-learning projects.
- Use genuine project screenshots when available.
- Preserve a consistent 16:10 media area to create a coherent grid.
- Keep title, existing summary, technical metadata, and actions in a predictable order.
- Keep multiple actions as separate links; do not nest interactive elements.
- Desktop: featured panel followed by a balanced supporting grid.
- Tablet: two columns if cards remain readable.
- Mobile: single-column cards, media above text.

Media handling plan:
- Create an asset inventory before implementation.
- Confirm each image's project, authenticity, permitted public use, and best crop.
- Use descriptive alt text based on the actual image.
- Provide explicit dimensions or aspect-ratio reservations to avoid layout shifts.
- Use responsive image variants and lazy-load below-the-fold images.
- Do not use stock imagery to imply it is a screenshot of the owner's project.

### 16.8 Certifications and Badges & Courses

- Use two separate visual groups with clear subheadings.
- Keep the same card family, but make issuer and credential metadata easy to scan.
- Preserve every current item and its current text during this phase.
- Make external-link affordances visible on hover and keyboard focus, not hover alone.
- Ensure the visual split does not imply an unapproved change to the status of an individual item.
- Any content reclassification requires separate owner approval later.

### 16.9 Education

- Keep existing entries and wording.
- Use a compact, clean layout with institution, qualification, and dates in a predictable hierarchy.
- Avoid giving this section the same visual weight as the flagship project.
- Use a simple two-column layout on desktop only if the existing content benefits from it; stack on mobile.

### 16.10 Contact and footer

- Use a strong but concise contact-section composition.
- Present existing email, LinkedIn, GitHub, résumé, and other contact actions without changing destinations.
- Make tap targets at least 44px where practical.
- Keep the footer compact: monogram, relevant links, copyright line, and back-to-top affordance if retained.
- Use a hairline top border and muted metadata.
- Ensure links remain understandable without colour alone.

## 17. Asset Inventory and Homepage Mockup Inputs

Before implementation approval, produce an inventory of the real screenshot assets available to the project.

For each asset, record:
- Filename/path.
- Project it belongs to.
- What the screenshot actually depicts.
- Original pixel dimensions and aspect ratio.
- Whether it contains confidential, personal, or sensitive information.
- Proposed display slot and crop.
- Whether a sanitized version is needed.
- Whether alt text can be drafted from the actual image.

Do not assume the assets are already in the repository just because the owner says real screenshots are available. If files are not accessible, request them or mark the media slot as pending.

The Phase 2 visual blueprint should include a written wireframe for:
- Desktop hero and navigation.
- Mobile hero and navigation.
- Featured Star Air project.
- Supporting project grid.
- Experience and skills sections.
- Certification/badge grouping.
- Contact and footer.

If image or browser-preview tooling is available, a static visual mockup may be proposed as a review artifact. It must not be mistaken for an implemented or deployed website.

## 18. Phase 2 Implementation Plan (Planning Only)

Implementation should be organized into reviewable stages after explicit approval.

### Stage 0 — Asset and baseline verification
- Inventory repository files and available real screenshots.
- Record the current site structure and relevant dependencies.
- Capture baseline screenshots and run a baseline accessibility/performance audit if browser tooling is available.
- Record current behaviour before removing Three.js, theme switching, spotlight, or magnetic interactions.
- No source changes before approval.

### Stage 1 — Foundation
- Introduce approved design tokens and typography.
- Plan the self-hosted WOFF2 assets and licensing.
- Define global resets, containers, spacing, focus states, and link styles.
- Add safe no-JavaScript behaviour so essential content is never hidden.
- Resolve navigation breakpoints and sticky-header layout without negative-margin coupling.

### Stage 2 — Shared components
- Navigation and mobile menu.
- Buttons, links, chips, cards, focus states.
- Section heading pattern and timeline components.
- Image/media container behaviour.

### Stage 3 — Hero
- Replace Three.js with the SVG pipeline motif.
- Preserve static fallback and accessible text alternative.
- Implement copy-first mobile hierarchy.
- Add restrained entrance animation and reduced-motion behaviour.

### Stage 4 — Project media and cards
- Integrate owner-supplied genuine screenshots.
- Build the featured Star Air panel and supporting project grid.
- Verify responsive crops, image dimensions, and action links.
- Do not alter project content or add unsupported claims.

### Stage 5 — Remaining sections
- Apply the visual system to About, Skills, Experience, Certifications/Badges & Courses, Education, Contact, and Footer.
- Preserve existing content.
- Remove the theme toggle, spotlight, and magnetic movement only as part of the approved implementation.

### Stage 6 — Motion and responsive refinement
- Add purposeful micro-interactions and section reveals.
- Verify touch behaviour and reduced-motion states.
- Test navigation and layout at mobile, tablet, and desktop widths.

### Stage 7 — Validation and deployment readiness
- Keyboard-only walkthrough.
- Screen-reader/semantic review where tooling is available.
- WCAG contrast check using an actual analyzer.
- Test at 320px width and 200% zoom.
- Verify no-JavaScript fallback and failed-font behaviour.
- Run Lighthouse and/or equivalent checks where available.
- Check console errors, broken links, missing images, layout shifts, and navigation states.
- Compare before/after screenshots at matching viewport sizes.
- Confirm that no project content or professional claims changed unexpectedly.
- Deployment remains a separate, explicitly approved action.

## 19. Acceptance Criteria for the Future Implementation

The redesign can be considered ready for release only when all applicable checks pass:

- [ ] Dark editorial palette is consistent across the page.
- [ ] Typography, spacing, surfaces, borders, and controls follow the design tokens.
- [ ] The SVG pipeline is readable, lightweight by design, accessible, and has a static reduced-motion/no-JS state.
- [ ] No Three.js hero remains in the approved final implementation.
- [ ] No light-theme toggle remains.
- [ ] Fonts are self-hosted WOFF2 with appropriate fallbacks and license notices.
- [ ] Spotlight and magnetic button effects are removed.
- [ ] Hover, focus, pressed, and mobile interaction states remain clear.
- [ ] The mobile hero places text before the pipeline graphic.
- [ ] Genuine project screenshots are used only where available and safe to publish.
- [ ] Certifications and Badges & Courses are visually separated without unapproved content changes.
- [ ] No content is hidden if JavaScript fails.
- [ ] Navigation does not wrap awkwardly at intermediate widths.
- [ ] Keyboard navigation, visible focus, reduced motion, and semantic labels work.
- [ ] No horizontal overflow at 320px width; layout remains usable at 200% zoom.
- [ ] Contrast and performance are tested rather than merely assumed.
- [ ] No fabricated results, screenshots, or claims are introduced.
- [ ] Owner has reviewed the result before deployment.

## 20. Approval Gate

**Phase 2 planning is complete only when the owner has reviewed the homepage visual blueprint, asset mapping, and staged implementation plan.**

This document does not authorize implementation. Do not edit website source files, modify the repository, or deploy changes until the owner explicitly approves implementation.
