# API Reference

Complete technical reference for configuring and extending the Tech Notes blog.

## Table of Contents

- [Configuration Files](#configuration-files)
- [Front Matter Schema](#front-matter-schema)
- [Eleventy Configuration](#eleventy-configuration)
- [Collections API](#collections-api)
- [Filters](#filters)
- [Tailwind Configuration](#tailwind-configuration)
- [JavaScript APIs](#javascript-apis)
- [File Structure](#file-structure)

## Configuration Files

### package.json

Located at: `/package.json`

**Scripts:**

| Script | Command | Description |
|--------|---------|-------------|
| `build` | `npx @11ty/eleventy` | Build site only |
| `start` | `npx @11ty/eleventy --serve` | Start dev server |
| `build:css` | `npx tailwindcss -i ./src/styles/input.css -o ./_site/styles/output.css --minify` | Build and minify CSS |
| `watch:css` | `npx tailwindcss -i ./src/styles/input.css -o ./_site/styles/output.css --watch` | Watch and rebuild CSS |
| `dev` | `npm-run-all --parallel start watch:css` | Run dev server + CSS watch |
| `deploy` | `npm run build && npm run build:css` | Production build |

**Dependencies:**

```json
{
  "devDependencies": {
    "@11ty/eleventy": "^2.0.1",
    "@11ty/eleventy-plugin-syntaxhighlight": "^5.0.2",
    "@tailwindcss/typography": "^0.5.10",
    "npm-run-all": "^4.1.5",
    "tailwindcss": "^3.4.0"
  },
  "dependencies": {
    "d3-cloud": "^1.2.7",
    "d3-selection": "^3.0.0"
  }
}
```

### .eleventy.js

Located at: `/.eleventy.js`

Main Eleventy configuration file.

**Return Object:**

```javascript
{
  dir: {
    input: "src",           // Source directory
    output: "_site",        // Output directory
    includes: "_includes",  // Includes directory
    layouts: "_layouts"     // Layouts directory
  },
  templateFormats: ["md", "njk", "html"],
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk"
}
```

### tailwind.config.js

Located at: `/tailwind.config.js`

Tailwind CSS configuration.

**Structure:**

```javascript
module.exports = {
  content: ["./src/**/*.{html,md,njk,js}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { /* custom colors */ },
      typography: { /* prose styles */ }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
```

## Front Matter Schema

### Blog Post Front Matter

Located in: `src/posts/*.md`

**Required Fields:**

```yaml
author: string          # Author name
date: YYYY-MM-DD       # Publication date
layout: string         # Template file (usually "post.njk")
summary: string        # Brief description (100-160 chars)
title: string          # Post title (50-60 chars)
```

**Optional Fields:**

```yaml
image: string          # Image path (e.g., "/images/posts/hero.svg")
tags: string[]         # Array of tags (e.g., ['javascript', 'tutorial'])
site_title: string     # Override site title (default: "Tech Notes")
description: string    # Meta description (overrides summary)
```

**Example:**

```yaml
---
author: Steve Kaschimer
date: 2025-12-04
image: /images/posts/2025-12-04-hero.svg
layout: post.njk
site_title: Tech Notes
summary: Learn how to build a modern blog with Eleventy and Tailwind CSS.
tags: ['eleventy', 'tailwind', 'tutorial']
title: Building a Modern Blog
---
```

### Page Front Matter

Located in: `src/*.njk`

**Required Fields:**

```yaml
layout: string         # Template file (usually "base.njk")
site_title: string     # Site title
title: string          # Page title
```

**Optional Fields:**

```yaml
description: string    # Meta description
```

**Example:**

```yaml
---
layout: base.njk
site_title: Tech Notes
title: About
description: Learn more about this blog
---
```

## Eleventy Configuration

### Collections

Defined in: `.eleventy.js`

#### posts Collection

Returns all published blog posts, sorted by date (newest first).

**Definition:**

```javascript
eleventyConfig.addCollection("posts", function(collectionApi) {
  const now = new Date();
  return collectionApi.getFilteredByGlob("src/posts/*.md")
    .filter(post => post.date <= now)
    .sort((a, b) => b.date - a.date);
});
```

**Usage:**

```njk
{% for post in collections.posts %}
  {{ post.data.title }}
{% endfor %}
```

**Properties:**

- `post.data.title` - Post title
- `post.data.author` - Author name
- `post.data.date` - Publication date
- `post.data.summary` - Post summary
- `post.data.tags` - Array of tags
- `post.data.image` - Image path
- `post.url` - Generated URL
- `post.content` - HTML content

#### tagList Collection

Returns unique tags from all posts, alphabetically sorted.

**Definition:**

```javascript
eleventyConfig.addCollection("tagList", function(collectionApi) {
  const tagSet = new Set();
  collectionApi.getAll().forEach(item => {
    if ("tags" in item.data) {
      let tags = item.data.tags;
      if (typeof tags === "string") tags = [tags];
      for (const tag of tags) {
        if (tag && tag !== "posts" && tag !== "all") {
          tagSet.add(tag);
        }
      }
    }
  });
  return [...tagSet].sort();
});
```

**Usage:**

```njk
{% for tag in collections.tagList %}
  {{ tag }}
{% endfor %}
```

#### tagListWithCounts Collection

Returns tags with post counts.

**Definition:**

```javascript
eleventyConfig.addCollection("tagListWithCounts", function(collectionApi) {
  const tagCount = {};
  const posts = collectionApi.getFilteredByGlob("src/posts/*.md");
  
  posts.forEach(post => {
    if ("tags" in post.data) {
      let tags = item.data.tags;
      if (typeof tags === "string") tags = [tags];
      for (const tag of tags) {
        if (tag && tag !== "posts" && tag !== "all") {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        }
      }
    }
  });
  
  return Object.keys(tagCount)
    .sort()
    .map(tag => ({ tag: tag, count: tagCount[tag] }));
});
```

**Usage:**

```njk
{% for item in collections.tagListWithCounts %}
  {{ item.tag }}: {{ item.count }}
{% endfor %}
```

**Properties:**

- `item.tag` - Tag name
- `item.count` - Number of posts

### Adding Custom Collections

**Syntax:**

```javascript
eleventyConfig.addCollection("collectionName", function(collectionApi) {
  return collectionApi.getFilteredByGlob("glob/pattern/*.md")
    .filter(item => /* custom filter */)
    .sort((a, b) => /* custom sort */);
});
```

**Collection API Methods:**

- `getAll()` - Get all items
- `getFilteredByGlob(glob)` - Filter by glob pattern
- `getFilteredByTag(tag)` - Filter by tag
- `getAllSorted()` - Get all, sorted by date

## Filters

### Built-in Filters

#### readableDate

Formats dates for human readability.

**Definition:**

```javascript
eleventyConfig.addFilter("readableDate", (dateObj) => {
  return new Date(dateObj).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});
```

**Usage:**

```njk
{{ post.data.date | readableDate }}
```

**Input:** `2025-12-04`  
**Output:** `December 4, 2025`

### Adding Custom Filters

**Syntax:**

```javascript
eleventyConfig.addFilter("filterName", function(value, arg1, arg2) {
  // Process value
  return processedValue;
});
```

**Examples:**

```javascript
// Uppercase filter
eleventyConfig.addFilter("uppercase", function(value) {
  return value.toUpperCase();
});

// Limit filter
eleventyConfig.addFilter("limit", function(array, limit) {
  return array.slice(0, limit);
});

// Excerpt filter
eleventyConfig.addFilter("excerpt", function(content, length = 200) {
  return content.substring(0, length) + "...";
});
```

**Usage:**

```njk
{{ title | uppercase }}
{{ collections.posts | limit(5) }}
{{ content | excerpt(150) }}
```

## Tailwind Configuration

### Theme Extension

Located in: `tailwind.config.js`

#### Colors

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
      },
    },
  },
}
```

**Usage:**

```html
<div class="bg-primary-600 text-primary-50">
  Content
</div>
```

#### Typography

```javascript
typography: ({ theme }) => ({
  DEFAULT: {
    css: {
      '--tw-prose-body': theme('colors.gray[700]'),
      '--tw-prose-headings': theme('colors.gray[900]'),
      '--tw-prose-links': theme('colors.primary[600]'),
      '--tw-prose-bold': theme('colors.gray[900]'),
      '--tw-prose-code': theme('colors.gray[900]'),
      '--tw-prose-pre-bg': theme('colors.gray[100]'),
    },
  },
  invert: {
    css: {
      '--tw-prose-body': theme('colors.gray[300]'),
      '--tw-prose-headings': theme('colors.white'),
      '--tw-prose-links': theme('colors.primary[400]'),
      '--tw-prose-bold': theme('colors.white'),
      '--tw-prose-code': theme('colors.white'),
      '--tw-prose-pre-bg': theme('colors.gray[800]'),
    },
  },
}),
```

**Usage:**

```html
<article class="prose dark:prose-invert">
  <!-- Markdown content -->
</article>
```

## JavaScript APIs

### Theme API

Located in: `src/js/theme.js`

#### Functions

**getColorPreference()**

Gets user's theme preference.

```javascript
const getColorPreference = () => {
  if (localStorage.getItem(storageKey)) {
    return localStorage.getItem(storageKey);
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
};
```

**setPreference(theme)**

Sets theme preference.

```javascript
const setPreference = (theme) => {
  localStorage.setItem(storageKey, theme);
  reflectPreference(theme);
};
```

**Parameters:**
- `theme: 'light' | 'dark'`

**reflectPreference(theme)**

Applies theme to DOM.

```javascript
const reflectPreference = (theme) => {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
};
```

#### Storage Key

```javascript
const storageKey = 'theme-preference';
```

### Tag Filter API

Located in: `src/js/tag-filter-checkboxes.js`

#### Functions

**updatePosts()**

Filters posts based on selected tags.

```javascript
function updatePosts() {
  const selectedTags = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.dataset.tag);
  
  // Filter logic
}
```

#### DOM Elements

```javascript
const checkboxes = document.querySelectorAll('.tag-checkbox');
const clearButton = document.getElementById('clear-filters');
const postsGrid = document.getElementById('posts-grid');
const filterStatus = document.getElementById('filter-status');
```

#### Data Attributes

**Post Card:**
```html
<div class="post-card" data-tags="javascript,tutorial,web-development">
```

**Checkbox:**
```html
<input class="tag-checkbox" data-tag="javascript">
```

## File Structure

### Source Structure

```
src/
├── _layouts/
│   ├── base.njk              # Base layout
│   └── post.njk              # Post layout
├── _includes/                # Reusable components
├── posts/                    # Blog posts
│   └── YYYY-MM-DD-title.md
├── images/                   # Images
│   ├── posts/               # Post images
│   ├── favicon.svg          # Favicon
│   └── apple-touch-icon.svg # Apple icon
├── js/                       # JavaScript
│   ├── theme.js             # Theme toggle
│   ├── tag-filter-checkboxes.js
│   ├── tag-cloud.js
│   ├── tag-filter.js
│   └── code-copy.js
├── styles/                   # CSS
│   └── input.css            # Tailwind input
├── index.njk                 # Homepage
├── about.njk                 # About page
├── privacy.njk               # Privacy page
└── terms.njk                 # Terms page
```

### Output Structure

```
_site/
├── posts/
│   └── YYYY-MM-DD-title/
│       └── index.html
├── images/                   # Copied from src
├── js/                       # Copied from src
├── styles/
│   └── output.css           # Generated CSS
├── index.html               # Generated homepage
├── about/
│   └── index.html
├── privacy/
│   └── index.html
└── terms/
    └── index.html
```

## Environment Variables

### NODE_ENV

Controls build environment.

```bash
NODE_ENV=production npm run build
```

### ELEVENTY_ENV

Custom environment variable.

```bash
ELEVENTY_ENV=staging npm run build
```

**Usage in config:**

```javascript
if (process.env.ELEVENTY_ENV === "production") {
  // Production-only configuration
}
```

## CLI Commands

### Eleventy CLI

```bash
# Basic build
npx @11ty/eleventy

# Serve with watch
npx @11ty/eleventy --serve

# Custom port
npx @11ty/eleventy --serve --port=8081

# Quiet mode
npx @11ty/eleventy --quiet

# Debug
DEBUG=* npx @11ty/eleventy

# Incremental build
npx @11ty/eleventy --incremental

# Specific input/output
npx @11ty/eleventy --input=src --output=dist
```

### Tailwind CLI

```bash
# Build CSS
npx tailwindcss -i ./src/styles/input.css -o ./_site/styles/output.css

# Minify
npx tailwindcss -i ./src/styles/input.css -o ./_site/styles/output.css --minify

# Watch
npx tailwindcss -i ./src/styles/input.css -o ./_site/styles/output.css --watch

# Config
npx tailwindcss -i ./src/styles/input.css -o ./_site/styles/output.css -c ./tailwind.config.js
```

---

**Related:** [Architecture](ARCHITECTURE.md) | [Development Guide](DEVELOPMENT.md)
