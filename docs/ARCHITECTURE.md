# Architecture Overview

This document provides a comprehensive overview of the Tech Notes blog architecture, technology choices, and system design.

## Technology Stack

### Core Technologies

#### Eleventy (11ty)
- **Purpose:** Static site generator
- **Version:** 2.0.1
- **Why Eleventy:**
  - Simple and flexible
  - Fast build times
  - Multiple template language support
  - No client-side JavaScript framework required
  - Excellent performance

#### Tailwind CSS
- **Purpose:** Utility-first CSS framework
- **Version:** 3.4.0
- **Features Used:**
  - Responsive design utilities
  - Dark mode support (`class` strategy)
  - Typography plugin for prose content
  - Custom color palette

#### Nunjucks
- **Purpose:** Template engine
- **Why Nunjucks:**
  - Powerful templating with inheritance
  - Filters and macros support
  - Good integration with Eleventy
  - Familiar syntax for developers

### Supporting Libraries

- **Prism.js** - Syntax highlighting for code blocks
- **D3.js** (d3-cloud, d3-selection) - Tag cloud visualization
- **npm-run-all** - Run multiple npm scripts in parallel

## Project Structure

```
steve-kaschimer.github.io/
│
├── .eleventy.js              # Eleventy configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── package.json              # Dependencies and scripts
│
├── src/                      # Source files
│   ├── _layouts/            # Page layouts
│   │   ├── base.njk         # Base layout with nav/footer
│   │   └── post.njk         # Blog post layout
│   │
│   ├── _includes/           # Reusable components (if any)
│   │
│   ├── posts/               # Blog post markdown files
│   │   └── YYYY-MM-DD-title.md
│   │
│   ├── images/              # Static images
│   │   └── posts/           # Post-specific images
│   │
│   ├── js/                  # JavaScript files
│   │   ├── theme.js         # Dark/light theme toggle
│   │   ├── tag-filter-checkboxes.js  # Tag filtering
│   │   ├── tag-cloud.js     # Tag cloud visualization
│   │   ├── tag-filter.js    # Alternative tag filter
│   │   └── code-copy.js     # Copy code button
│   │
│   ├── styles/              # CSS files
│   │   ├── input.css        # Tailwind input
│   │   └── output.css       # Generated CSS (in _site)
│   │
│   ├── index.njk            # Homepage
│   ├── about.njk            # About page
│   ├── privacy.njk          # Privacy policy page
│   └── terms.njk            # Terms page
│
├── _site/                   # Generated static site (output)
│   └── [generated files]
│
└── .github/
    └── workflows/
        └── deploy.yml       # GitHub Actions deployment
```

## System Architecture

### Build Process

```
┌─────────────────────────────────────────────────┐
│          Development Workflow                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. Source Files (src/)                        │
│     ├── Markdown Posts                         │
│     ├── Nunjucks Templates                     │
│     └── Static Assets                          │
│                                                 │
│  2. Eleventy Processing                        │
│     ├── Read markdown files                    │
│     ├── Apply front matter data               │
│     ├── Render templates                       │
│     ├── Generate collections                   │
│     └── Copy static files                      │
│                                                 │
│  3. Tailwind CSS Processing                    │
│     ├── Scan content for classes              │
│     ├── Generate minimal CSS                   │
│     └── Minify output                          │
│                                                 │
│  4. Output (_site/)                            │
│     └── Static HTML, CSS, JS, images          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────┐
│ Markdown     │
│ Posts        │
└──────┬───────┘
       │
       │ Front Matter
       ↓
┌──────────────────────┐
│ Eleventy Collections │
│ - posts              │
│ - tagList            │
│ - tagListWithCounts  │
└──────┬───────────────┘
       │
       │ Template Rendering
       ↓
┌──────────────┐      ┌─────────────┐
│ base.njk     │◄─────┤ index.njk   │
│ (Layout)     │      │ post.njk    │
└──────┬───────┘      └─────────────┘
       │
       │ HTML Generation
       ↓
┌──────────────┐
│ Static HTML  │
│ Files        │
└──────────────┘
```

## Key Components

### 1. Eleventy Configuration (.eleventy.js)

**Collections:**
- `posts` - Filters and sorts blog posts by date
  - Excludes future posts
  - Sorts newest first
- `tagList` - Unique tags from all posts
- `tagListWithCounts` - Tags with post counts

**Filters:**
- `readableDate` - Formats dates for display

**Configuration:**
- Input: `src/`
- Output: `_site/`
- Template formats: `md`, `njk`, `html`

### 2. Layouts System

#### base.njk (Base Layout)
- Navigation bar with logo and links
- Dark/light theme toggle
- Footer with links and copyright
- Loads all global scripts and styles
- Responsive mobile menu

#### post.njk (Blog Post Layout)
- Extends base layout
- Post header with title, author, date
- Tag badges
- Article content with prose styling
- Code syntax highlighting integration

### 3. Theme System

**Implementation:**
- Uses Tailwind CSS dark mode (`class` strategy)
- JavaScript toggles `dark` class on `<html>`
- Persists preference in localStorage
- Syncs across browser tabs
- Respects system preference by default

**Files:**
- `src/js/theme.js` - Theme toggle logic
- `tailwind.config.js` - Dark mode configuration

### 4. Tag Filtering System

**Features:**
- Checkbox-based multi-tag filtering
- OR logic (show posts with ANY selected tag)
- URL hash persistence (#tags=tag1,tag2)
- Real-time post count updates
- Smooth animations

**Files:**
- `src/js/tag-filter-checkboxes.js` - Main filtering logic
- Collections provide tag data

### 5. Content Management

**Blog Posts:**
- Written in Markdown
- Front matter metadata:
  - `title`, `author`, `date`
  - `summary`, `image`, `tags`
  - `layout`, `site_title`
- File naming: `YYYY-MM-DD-post-title.md`
- Automatically sorted by date
- Future posts excluded from build

## Configuration Files

### package.json Scripts

```json
{
  "build": "npx @11ty/eleventy",
  "start": "npx @11ty/eleventy --serve",
  "build:css": "npx tailwindcss -i ./src/styles/input.css -o ./_site/styles/output.css --minify",
  "watch:css": "npx tailwindcss -i ./src/styles/input.css -o ./_site/styles/output.css --watch",
  "dev": "npm-run-all --parallel start watch:css",
  "deploy": "npm run build && npm run build:css"
}
```

### Tailwind Configuration

- **Dark Mode:** `class` strategy
- **Content:** Scans `src/**/*.{html,md,njk,js}`
- **Custom Colors:** Primary blue palette (50-900)
- **Typography Plugin:** Custom prose styles for light/dark

## Performance Considerations

### Build Performance
- Eleventy is fast - typical builds complete in < 1 second
- Incremental builds during development
- Efficient collection filtering

### Runtime Performance
- No client-side JavaScript framework
- Minimal JavaScript (theme, filtering, code copy)
- Tailwind CSS purged to minimal size
- Static HTML - instant page loads

### SEO Optimization
- Semantic HTML
- Meta tags (Open Graph, Twitter Cards)
- Readable URLs
- Fast load times
- Mobile responsive

## Deployment Architecture

```
┌──────────────┐
│ GitHub Repo  │
│    (main)    │
└──────┬───────┘
       │ Push/Schedule
       ↓
┌──────────────────┐
│ GitHub Actions   │
│ - Build site     │
│ - Run tests      │
│ - Generate CSS   │
└──────┬───────────┘
       │ Artifact
       ↓
┌──────────────────┐
│ GitHub Pages     │
│ (gh-pages)       │
└──────────────────┘
```

**Deployment Triggers:**
- Push to `main` branch
- Manual workflow dispatch
- Daily cron schedule (00:00 UTC)

## Security Considerations

- Static site - minimal attack surface
- No server-side processing
- No database
- No user authentication required
- Content Security via GitHub permissions
- HTTPS enabled by GitHub Pages

## Extension Points

The architecture supports easy extension:

1. **New Pages:** Add `.njk` or `.md` files to `src/`
2. **New Features:** Add JavaScript to `src/js/`
3. **Custom Filters:** Add to `.eleventy.js`
4. **New Collections:** Define in `.eleventy.js`
5. **Style Changes:** Modify `tailwind.config.js`

## Best Practices

1. **Content:** Keep markdown clean and semantic
2. **Templates:** Use Nunjucks inheritance
3. **Styles:** Use Tailwind utilities, avoid custom CSS
4. **JavaScript:** Keep minimal and progressive enhancement
5. **Images:** Optimize before adding to repo
6. **Performance:** Test build times regularly

## Dependencies Management

- Regular updates via `npm update`
- Security audits via `npm audit`
- Lock file committed for reproducible builds
- Development vs production dependencies separated

---

**Next:** [Features Documentation](FEATURES.md) | [Development Guide](DEVELOPMENT.md)
