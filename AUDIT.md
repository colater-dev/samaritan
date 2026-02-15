# Codebase Audit — Samaritan Bio Website

**Date:** 2026-02-15
**Repo:** samaritan (Eleventy 3.x + Tailwind CSS 4.x static site)
**Client:** Samaritan Bio (M/S Samaritan AI Private Limited, Bengaluru)
**Built by:** Public Knowledge Studio

---

## Summary

The site is a well-structured static marketing site for an early-stage medical device startup. Technology choices are appropriate (Eleventy + Tailwind for a small team), the information architecture is strong, and the content quality is high. However, there are several bugs that undermine reliability, and some clear product-level gaps to close.

---

## What's Working Well

- **Right stack for the job.** Static site generator + utility CSS for a marketing site with a handful of pages and blog posts. No unnecessary backend complexity.
- **Clean information architecture.** Deck-style layout works well for the dual investor/clinician audience. Homepage flows logically: vision → problem → product → market → team → CTA.
- **Configurable CTA system.** `site.json` CTAs with per-post front matter overrides (`cta: pilot`, `cta: careers`) — well-designed for content editors.
- **Good content quality.** Blog posts are clinically grounded and well-sourced. Competitive research in onboarding docs is thorough.
- **SEO foundations in place.** JSON-LD structured data, Open Graph, Twitter Cards, canonical URLs, sitemap, robots.txt.
- **Accessibility basics.** Skip link, ARIA labels, semantic HTML, noscript fallback.

---

## Bugs and Issues

### Critical

#### 1. Draft posts are publicly visible

All 4 blog posts have `draft: true` in front matter, but nothing filters them out of the collection.

**File:** `eleventy.config.js:25-29`

```js
eleventyConfig.addCollection("blog", function (collectionApi) {
  return collectionApi.getFilteredByGlob("src/blog/*.md").sort((a, b) => {
    return b.date - a.date;
  });
});
```

Eleventy does not auto-exclude `draft: true` posts. Either add a filter (`.filter(post => !post.data.draft)`) or remove the `draft` flag from posts intended to be live.

#### 2. Homepage email signup form does nothing

**File:** `src/index.njk:49-52`

```html
<form class="hero-form reveal reveal-delay-2">
  <input type="email" placeholder="you@email.com" required>
  <button type="submit">Sign up for Updates</button>
</form>
```

No `action`, no `method`, no JS handler. Submitting reloads the page. A broken form is worse than no form — it erodes visitor trust.

### High

#### 3. Duplicate founder data in site.json

`site.team.founders` (with bios) and `site.founders` (names/LinkedIn only) contain overlapping data. Footer uses `site.founders`, team section uses `site.team.founders`. Updates to one won't propagate to the other.

**File:** `src/_data/site.json`

#### 4. No 404 page

Missing pages show the hosting provider's default error page, breaking the professional impression.

#### 5. Legacy dead code in repository

- `v1/` directory (old static HTML files)
- Root-level `index.html`, `arobag.html`, `styles.css`, `sitemap.xml` (v1 artifacts)

Adds confusion for any developer working on the project.

### Medium

#### 6. Build tools in wrong dependency group

`@11ty/eleventy`, `@tailwindcss/cli`, and `tailwindcss` are in `dependencies` — should be `devDependencies`.

**File:** `package.json:21-27`

#### 7. Unnecessary `npx` in npm scripts

`npx eleventy` and `npx tailwindcss` are used when packages are already installed locally. Adds latency, can pull wrong versions.

**File:** `package.json:7-12`

#### 8. No Node.js version pinning

No `.nvmrc`, no `engines` field. Eleventy 3.x requires Node 18+; new developers or CI could break the build.

#### 9. `dev` script orphans processes

`"dev": "npm run watch:css & npm run watch:11ty"` — `&` backgrounds the CSS watcher, so Ctrl+C only kills Eleventy. Tailwind process stays alive.

**File:** `package.json:12`

#### 10. JavaScript lacks null safety on DOM queries

`document.querySelector('.nav-hamburger')` etc. are called unconditionally. If any element is missing from a page layout, `.addEventListener()` throws and breaks all JS.

**File:** `src/js/main.js:28-31, 47-49`

---

## PM Recommendations — What to Do Next

### Phase 1: Fix What's Broken

1. **Fix draft filtering.** Add `.filter(post => !post.data.draft)` to the blog collection, or remove `draft: true` from posts that should be live.
2. **Fix or remove the email form.** Hook it up to Formspree/Netlify Forms, or replace with a `mailto:` link like the other CTAs.
3. **Add a 404 page.** Simple `src/404.njk` using the base layout.
4. **Consolidate duplicate founder data** in `site.json` to one source of truth.

### Phase 2: Reliability & Developer Experience

5. **Remove dead code.** Delete `v1/`, root-level HTML files, and root `styles.css`.
6. **Fix package.json.** Move build deps to `devDependencies`, drop `npx`, add `.nvmrc` and `engines`.
7. **Fix `dev` script.** Use `concurrently` to manage parallel watchers.
8. **Add null checks in main.js** (optional chaining on DOM queries).
9. **Set up basic CI.** A GitHub Actions workflow that runs `npm run build` on push to `main`.

### Phase 3: Product Improvements

10. **Add analytics.** Google Analytics or Plausible — at minimum track page views and CTA clicks.
11. **Add real lead capture.** Replace at least the "Book a Meeting" mailto with a proper form (Typeform, Tally, or Cal.com).
12. **Publish blog posts.** The content is strong and provides SEO value. Decide which to publish.
13. **Add Privacy Policy and Terms pages.** Table stakes for a medical device company pursuing regulatory approval.
14. **Add product renders to the AroBag page.** Onboarding docs say 3D mockups are available — the placeholder should be replaced.

### What NOT to Do

- **Don't add a CMS.** Markdown + JSON is the right abstraction for this team and content volume.
- **Don't add a backend.** Static + third-party services (forms, analytics, booking) is correct at this scale.
- **Don't refactor the CSS.** 2,651 lines but well-organized with section comments and Tailwind 4 `@theme` tokens.
- **Don't add template unit tests.** A working `npm run build` is sufficient. Lighthouse CI or link checking is higher value.
