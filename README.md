# My Blog

A modern, responsive blog built with Eleventy and Tailwind CSS, featuring light/dark theme support.

## Features

- 📝 Markdown-based blog posts
- 🎨 Tailwind CSS for styling
- 🌓 Light/dark theme toggle with persistence
- 📱 Fully responsive design
- 🚀 Fast static site generation with Eleventy
- 🎯 SEO-friendly
- 🖼️ Blog post cards with images, author, date, and summary
- 📜 Progressive post loading - homepage grid loads 10 posts at a time, with more revealed as you scroll
- 🏷️ Client-side tag filtering with OR logic and URL-hash persistence

## Getting Started

### Prerequisites

- Node.js 24 (see `.nvmrc` - CI pins to this exact version)
- npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd steve-kaschimer.github.io-2
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Your site will be available at `http://localhost:8080`

## Building for Production

To build the site for production:

```bash
npm run deploy
```

This will generate the static files in the `_site` directory.

## Adding Blog Posts

1. Create a new `.md` file in `src/posts/`
2. Add front matter with the following fields:

```markdown
---
layout: post.njk
title: Your Post Title
author: Steve Kaschimer
date: 2025-10-31
image: /images/posts/2025-10-31-your-slug-hero.webp
image_prompt: "Describes the hero image for provenance - not rendered, just documentation for whoever generates the image."
summary: A brief summary of your post (used for the card excerpt, meta/OG description, and RSS)
tags: ['tag1', 'tag2']
site_title: Tech Notes
---

Your content here...
```

The hero `image` should be a `.webp` under `src/images/posts/`, with `-400w`/`-600w`/`-800w` responsive variants alongside the full-size file (see any existing post's images for the naming convention) - the homepage card and post hero both derive a `srcset` from those filename suffixes. A post without an `image` field falls back to a gradient header/card automatically, so it's fine to omit while a post is still a draft.

## Deployment to GitHub Pages

Deployment is already automated - `.github/workflows/deploy.yml` builds (`npm run build` + `npm run build:css`) and deploys `_site` to GitHub Pages via `actions/deploy-pages`, no `gh-pages` branch involved. It runs on every push to `main`, on a daily cron, and via manual dispatch, then runs Lighthouse CI against the deployed URL (`.lighthouserc.json`). `.github/workflows/build-check.yml` gates pull requests the same way (`npm ci` + `npm run deploy` must succeed) without deploying.

In other words: merge to `main` and the site deploys itself. There's nothing to run manually.

## Project Structure

```
├── src/
│   ├── _data/site.json    # Site title, description, URL, author info
│   ├── _layouts/          # Page layouts
│   │   ├── base.njk      # HTML shell - nav, footer, all <head> metadata/SEO
│   │   └── post.njk      # Blog post layout (extends base.njk)
│   ├── posts/             # Blog posts (markdown, YYYY-MM-DD-slug.md)
│   ├── styles/input.css   # Tailwind v4 CSS-native config + custom utilities
│   ├── js/                # Client-side JS (theme toggle, tag filter, code copy)
│   ├── images/posts/      # Post hero images (.png source + .webp variants)
│   ├── index.njk          # Homepage (post grid + tag filter)
│   ├── about.njk / privacy.njk / terms.njk / 404.njk
│   ├── feed.njk           # Atom feed
│   └── sitemap.njk / robots.njk
├── scripts/a11y-check.js  # axe-core accessibility scan (see CLAUDE.md)
├── .github/workflows/     # build-check.yml (PR gate), deploy.yml (auto-deploy)
├── editorial-plan.md      # Content calendar
├── .eleventy.js           # Eleventy configuration
└── package.json
```

## Customization

### Theme Colors

Tailwind v4 uses CSS-native configuration - there's no `tailwind.config.js`. Edit the `primary-*` color scale (and font variables) in the `@theme` block at the top of `src/styles/input.css`.

### Site Information

Update the following:
- `src/_data/site.json` - site title, description, canonical URL, author/contact info (used across templates and meta tags)
- `src/_layouts/base.njk` - nav/footer markup and logo SVG
- `src/about.njk` - About page content

## License

MIT
