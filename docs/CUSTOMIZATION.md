# Customization Guide

This guide explains how to customize the appearance, branding, and behavior of the Tech Notes blog.

## Table of Contents

- [Theme Colors](#theme-colors)
- [Typography](#typography)
- [Logo and Branding](#logo-and-branding)
- [Navigation](#navigation)
- [Layout Changes](#layout-changes)
- [Dark Mode](#dark-mode)
- [Custom Styles](#custom-styles)

## Theme Colors

### Changing the Primary Color

The primary color is used throughout the site (links, buttons, accents). Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',   // Main color
          600: '#0284c7',   // Darker variant
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
}
```

**Tips:**
- Use a color palette generator like [Tailwind Color Generator](https://uicolors.app/)
- Maintain proper contrast ratios for accessibility
- Test in both light and dark modes

### Adding Custom Colors

Add new color schemes:

```javascript
colors: {
  primary: { /* ... */ },
  accent: {
    500: '#ff6b6b',
    600: '#ee5a6f',
  },
  brand: {
    light: '#e3f2fd',
    DEFAULT: '#2196f3',
    dark: '#1976d2',
  },
}
```

Use in templates:
```html
<div class="bg-accent-500 text-brand-dark">
  Custom colored element
</div>
```

## Typography

### Changing Fonts

#### Using Google Fonts

1. **Add font link in `src/_layouts/base.njk`:**
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
   ```

2. **Update Tailwind config:**
   ```javascript
   theme: {
     extend: {
       fontFamily: {
         sans: ['Inter', 'system-ui', 'sans-serif'],
         heading: ['Montserrat', 'sans-serif'],
       },
     },
   }
   ```

3. **Apply in templates:**
   ```html
   <h1 class="font-heading">Heading Text</h1>
   <p class="font-sans">Body text</p>
   ```

#### Using System Fonts

For better performance, use system fonts:

```javascript
fontFamily: {
  sans: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
}
```

### Font Sizes

Customize typography sizes:

```javascript
theme: {
  extend: {
    fontSize: {
      'xxs': '0.625rem',
      'huge': '6rem',
    },
  },
}
```

### Prose Styling

The blog uses Tailwind Typography plugin. Customize prose:

```javascript
typography: ({ theme }) => ({
  DEFAULT: {
    css: {
      '--tw-prose-body': theme('colors.gray[700]'),
      '--tw-prose-headings': theme('colors.gray[900]'),
      '--tw-prose-links': theme('colors.primary[600]'),
      'h1': {
        fontSize: '2.5rem',
      },
      'code': {
        backgroundColor: theme('colors.gray[100]'),
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
      },
    },
  },
}),
```

## Logo and Branding

### Changing the Site Title

Update in multiple files:

**1. Homepage (`src/index.njk`):**
```yaml
---
site_title: Your Blog Name
---
```

**2. About page (`src/about.njk`):**
```yaml
---
site_title: Your Blog Name
---
```

**3. Global site title (in `base.njk`):**
```html
<span class="text-xl font-bold">{{ site_title }}</span>
```

### Replacing the Logo Icon

The default logo is an SVG icon. Replace it:

**1. Find the logo in `src/_layouts/base.njk`:**
```html
<svg class="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
  <!-- Current icon path -->
</svg>
```

**2. Replace with your SVG:**
```html
<svg class="w-8 h-8" viewBox="0 0 100 100">
  <!-- Your SVG paths here -->
</svg>
```

**3. Or use an image:**
```html
<img src="/images/logo.png" alt="Logo" class="w-8 h-8">
```

### Favicon and App Icons

**1. Replace favicon:**
```
src/images/favicon.svg
src/images/apple-touch-icon.svg
```

**2. Update references in `base.njk`:**
```html
<link rel="icon" type="image/svg+xml" href="/images/favicon.svg">
<link rel="apple-touch-icon" href="/images/apple-touch-icon.svg">
```

**3. Generate favicons** (recommended):
- Use [RealFaviconGenerator](https://realfavicongenerator.net/)
- Generates all required sizes and formats

## Navigation

### Adding Navigation Links

Edit `src/_layouts/base.njk`:

**Desktop navigation:**
```html
<div class="hidden md:flex space-x-6">
  <a href="/" class="text-gray-700 dark:text-gray-300 hover:text-primary-600">Home</a>
  <a href="/about/" class="text-gray-700 dark:text-gray-300 hover:text-primary-600">About</a>
  <a href="/blog/" class="text-gray-700 dark:text-gray-300 hover:text-primary-600">Blog</a>
  <a href="/contact/" class="text-gray-700 dark:text-gray-300 hover:text-primary-600">Contact</a>
</div>
```

**Mobile navigation:**
```html
<div class="md:hidden pb-4 space-y-2">
  <a href="/" class="block text-gray-700 dark:text-gray-300">Home</a>
  <a href="/about/" class="block text-gray-700 dark:text-gray-300">About</a>
  <a href="/blog/" class="block text-gray-700 dark:text-gray-300">Blog</a>
  <a href="/contact/" class="block text-gray-700 dark:text-gray-300">Contact</a>
</div>
```

### Footer Links

Edit footer in `src/_layouts/base.njk`:

```html
<div>
  <h3 class="text-sm font-semibold uppercase tracking-wider mb-4">
    Quick Links
  </h3>
  <ul class="space-y-3">
    <li><a href="/">Home</a></li>
    <li><a href="/about/">About</a></li>
    <li><a href="/contact/">Contact</a></li>
  </ul>
</div>
```

## Layout Changes

### Changing Container Width

Edit max-width classes in templates:

```html
<!-- Default -->
<div class="max-w-7xl mx-auto px-4">

<!-- Wider -->
<div class="max-w-full mx-auto px-4">

<!-- Narrower -->
<div class="max-w-4xl mx-auto px-4">
```

### Adjusting Grid Layout

Homepage post grid (`src/index.njk`):

```html
<!-- Current: 3 columns on large screens -->
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

<!-- 2 columns maximum -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-8">

<!-- 4 columns on large screens -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

### Sidebar Width

Adjust tag filter sidebar:

```html
<!-- Current -->
<aside class="w-full lg:w-64">

<!-- Wider -->
<aside class="w-full lg:w-80">

<!-- Narrower -->
<aside class="w-full lg:w-48">
```

## Dark Mode

### Customizing Dark Mode Colors

Edit `tailwind.config.js`:

```javascript
typography: {
  invert: {
    css: {
      '--tw-prose-body': theme('colors.gray[300]'),
      '--tw-prose-headings': theme('colors.white'),
      '--tw-prose-links': theme('colors.primary[400]'),
      // Customize dark mode text colors
    },
  },
}
```

### Dark Mode Variants

Add dark mode variants to any element:

```html
<!-- Background -->
<div class="bg-white dark:bg-gray-800">

<!-- Text -->
<p class="text-gray-900 dark:text-white">

<!-- Borders -->
<div class="border-gray-200 dark:border-gray-700">

<!-- Multiple properties -->
<button class="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600">
```

### Changing Default Theme

Edit `src/js/theme.js` to change default:

```javascript
const getColorPreference = () => {
  if (localStorage.getItem(storageKey)) {
    return localStorage.getItem(storageKey);
  }
  // Change 'dark' to 'light' for light default
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
```

### Removing Dark Mode

If you want light mode only:

1. **Remove theme toggle** from `base.njk`
2. **Remove dark mode classes** from templates
3. **Update Tailwind config:**
   ```javascript
   module.exports = {
     darkMode: false, // Disable dark mode
     // ...
   }
   ```

## Custom Styles

### Adding Global CSS

Create custom styles in `src/styles/input.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom global styles */
@layer base {
  h1 {
    @apply text-4xl font-bold mb-4;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition;
  }
  
  .card-custom {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6;
  }
}

@layer utilities {
  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }
}
```

Use custom classes:
```html
<button class="btn-primary">Click Me</button>
<div class="card-custom">Custom card</div>
```

### Component Classes

Create reusable component classes:

```css
@layer components {
  .post-card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition hover:shadow-xl;
  }
  
  .badge {
    @apply inline-block px-3 py-1 text-sm font-semibold rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200;
  }
}
```

### Animations

Add custom animations:

```javascript
// In tailwind.config.js
theme: {
  extend: {
    animation: {
      'fade-in': 'fadeIn 0.5s ease-in',
      'slide-in': 'slideIn 0.3s ease-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideIn: {
        '0%': { transform: 'translateY(-10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
    },
  },
}
```

Use in templates:
```html
<div class="animate-fade-in">Fades in</div>
<div class="animate-slide-in">Slides in</div>
```

## Advanced Customization

### Custom Post Layouts

Create alternative post layouts in `src/_layouts/`:

```njk
{# src/_layouts/post-minimal.njk #}
{% extends "base.njk" %}

{% block content %}
<article class="max-w-3xl mx-auto px-4 py-8">
  <h1 class="text-5xl font-bold mb-4">{{ title }}</h1>
  <div class="prose dark:prose-invert">
    {{ content | safe }}
  </div>
</article>
{% endblock %}
```

Use in post front matter:
```yaml
layout: post-minimal.njk
```

### Custom Homepage Layout

Modify `src/index.njk` for different layouts:

**List view:**
```html
<div class="space-y-6">
  {% for post in collections.posts %}
    <article class="border-b pb-6">
      <h2 class="text-2xl font-bold mb-2">{{ post.data.title }}</h2>
      <p class="text-gray-600">{{ post.data.summary }}</p>
      <a href="{{ post.url }}" class="text-primary-600">Read more →</a>
    </article>
  {% endfor %}
</div>
```

**Masonry layout** (requires additional JavaScript)
**Featured posts section**
**Category-based grouping**

## Testing Your Changes

After customization:

1. **Check development server:**
   ```bash
   npm run dev
   ```

2. **Test in different browsers:**
   - Chrome/Edge
   - Firefox
   - Safari

3. **Test responsive design:**
   - Mobile (< 640px)
   - Tablet (640px - 1024px)
   - Desktop (> 1024px)

4. **Test dark mode:**
   - Toggle between themes
   - Check all pages
   - Verify contrast

5. **Build for production:**
   ```bash
   npm run deploy
   ```

---

**Next:** [Features Documentation](FEATURES.md) | [Deployment Guide](DEPLOYMENT.md)
