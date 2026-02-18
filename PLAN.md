# Implementation Plan — Samaritan Bio Website Fixes

**Based on:** AUDIT.md findings
**Constraint:** Do not touch `v1/` directory — kept for reference

---

## Phase 1: Fix What's Broken

### 1.1 Fix draft filtering in blog collection
**File:** `eleventy.config.js:25-29`
**Change:** Add `.filter(post => !post.data.draft)` to the blog collection so posts with `draft: true` are excluded from the built site.

```js
eleventyConfig.addCollection("blog", function (collectionApi) {
  return collectionApi.getFilteredByGlob("src/blog/*.md")
    .filter(post => !post.data.draft)
    .sort((a, b) => b.date - a.date);
});
```

Then decide which posts to publish by removing `draft: true` from their front matter. Currently all 4 are marked draft — at minimum `why-urine-biomarkers-matter.md` reads as ready to publish.

### 1.2 Fix or replace the broken hero email form
**File:** `src/index.njk:49-52`
**Option A (recommended):** Replace the `<form>` with a mailto CTA matching the existing pattern used everywhere else on the site. This keeps things consistent and working until a real form backend is set up.
**Option B:** Integrate Formspree (free tier, no backend needed) — add `action="https://formspree.io/f/{id}"` and `method="POST"` to the form tag.

For now, go with Option A to eliminate the broken state immediately.

### 1.3 Add a 404 page
**New file:** `src/404.njk`
**Change:** Create a simple page using `layouts/base.njk` with a heading, a short message, and a link back to `/`. Add front matter with `permalink: /404.html` so hosting providers (Netlify, Vercel, GitHub Pages) pick it up automatically.

### 1.4 Consolidate duplicate founder data in site.json
**File:** `src/_data/site.json`
**Change:** Remove the top-level `founders` array (lines 51-64). Update `src/_includes/layouts/base.njk` footer (lines 125-127, 135) to reference `site.team.founders` instead of `site.founders`. This gives one source of truth for founder data.

---

## Phase 2: Reliability & Developer Experience

### 2.1 Fix package.json
**File:** `package.json`
**Changes:**
- Move `@11ty/eleventy`, `@tailwindcss/cli`, `tailwindcss`, `@tailwindcss/typography`, and `luxon` to `devDependencies` (all are build-time only)
- Remove `npx` prefix from all scripts (local `node_modules/.bin` is already on the PATH in npm scripts)
- Add `engines` field: `"engines": { "node": ">=18.0.0" }`

### 2.2 Add .nvmrc
**New file:** `.nvmrc`
**Content:** The Node.js version currently used for development (e.g., `20`).

### 2.3 Fix dev script process management
**File:** `package.json`
**Change:** Install `concurrently` as a dev dependency and update the `dev` script:
```json
"dev": "concurrently \"npm run watch:css\" \"npm run watch:11ty\""
```
This ensures Ctrl+C kills both watchers instead of orphaning the CSS watcher.

### 2.4 Add null safety to main.js DOM queries
**File:** `src/js/main.js:28-31, 47-49`
**Change:** Guard the mobile nav setup so it only runs if elements exist:

```js
const hamburger = document.querySelector('.nav-hamburger');
const overlay = document.querySelector('.mobile-nav-overlay');
const drawer = document.querySelector('.mobile-nav-drawer');
const closeBtn = document.querySelector('.mobile-nav-close');

if (hamburger && overlay && drawer && closeBtn) {
  hamburger.addEventListener('click', openMobileNav);
  closeBtn.addEventListener('click', closeMobileNav);
  overlay.addEventListener('click', closeMobileNav);
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });
}
```

### 2.5 Set up basic CI
**New file:** `.github/workflows/build.yml`
**Change:** A minimal GitHub Actions workflow that runs `npm ci && npm run build` on push to `main`. No deployment — just validates the build doesn't break.

---

## Phase 3: Product Improvements (no code changes — decisions needed from client)

### 3.1 Add analytics
Integrate Google Analytics 4 or Plausible. Requires a tracking ID from the client. Implementation is a single `<script>` tag in `base.njk` `<head>`.

### 3.2 Add real lead capture
Replace at least the "Book a Meeting" CTA with a Cal.com or Calendly embed. Optionally replace the hero form (once fixed) with a Formspree/Tally integration for newsletter signups.

### 3.3 Publish blog posts
Client decision on which of the 4 posts to take live. Implementation is just removing `draft: true` from front matter.

### 3.4 Add Privacy Policy and Terms pages
Need legal copy from the client. Implementation is two new Markdown/Nunjucks pages using the existing `page.njk` layout, plus footer links.

### 3.5 Add product renders to AroBag page
Need image assets from the client. Replace the placeholder at `src/pages/arobag.njk:50-62` with actual product imagery.

---

## Execution Order

Phases 1 and 2 can be implemented without client input. Phase 3 items each require a decision or asset from the client before they can proceed.

Within Phase 1, items 1.1–1.4 are independent and can be done in any order (or in parallel). Within Phase 2, item 2.3 depends on installing `concurrently` (part of 2.1), so 2.1 should come first.
