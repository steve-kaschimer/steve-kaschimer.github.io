# Features Documentation

This document provides detailed information about all features available in the Tech Notes blog.

## Core Features

### 1. Static Site Generation

**Technology:** Eleventy (11ty)

**Benefits:**
- ⚡ Fast load times (pre-rendered HTML)
- 🔒 Secure (no server-side code execution)
- 💰 Free hosting (GitHub Pages, Netlify, etc.)
- 📈 Excellent SEO (search engines love static HTML)
- 🚀 Easy to scale (just serve static files)

**How it works:**
- Markdown posts are converted to HTML at build time
- Templates are pre-rendered with data
- Output is a folder of static HTML/CSS/JS files
- No database or server-side processing required

### 2. Markdown-Based Content

**Features:**
- Write posts in simple Markdown format
- Front matter for metadata (YAML)
- Automatic HTML generation
- Support for all standard Markdown features

**Supported Markdown:**
- Headings (H1-H6)
- Emphasis (bold, italic)
- Lists (ordered, unordered)
- Links and images
- Code blocks with syntax highlighting
- Blockquotes
- Tables
- Horizontal rules

**Example:**
```markdown
---
title: My Post
date: 2025-12-04
---

## Introduction

This is **bold** and this is *italic*.

```javascript
console.log("Hello, world!");
```
```

### 3. Dark/Light Theme Toggle

**Features:**
- 🌓 Smooth theme switching
- 💾 Preference saved in localStorage
- 🔄 Syncs across browser tabs
- 📱 Respects system preference by default
- 🎨 Consistent styling in both modes

**Implementation:**
- Uses Tailwind CSS dark mode (class strategy)
- JavaScript toggles `dark` class on `<html>` element
- All components have dark mode variants
- Theme state persists between sessions

**User Experience:**
- Click theme toggle button in navbar
- Instant visual feedback
- No page reload required
- Works on all pages

**Technical Details:**
```javascript
// Stored in localStorage
theme-preference: "light" | "dark"

// Applied to HTML
<html class="dark">
```

### 4. Tag-Based Filtering

**Features:**
- 📌 Multi-tag selection with checkboxes
- 🔍 Real-time filtering (no page reload)
- 📊 Post count for each tag
- 🔗 URL hash for shareable filtered views
- ✨ Smooth animations

**How it works:**
1. Select tags from sidebar checkboxes
2. Posts are filtered to show those with ANY selected tag (OR logic)
3. URL updates with selected tags: `#tags=javascript,tutorial`
4. Post count updates dynamically
5. Clear button to reset filters

**Features for Users:**
- See all available tags with post counts
- Select multiple tags simultaneously
- Filter persists in URL (shareable)
- Visual feedback on filtered state
- Easy to clear all filters

**Technical Implementation:**
- JavaScript listens for checkbox changes
- Filters posts by `data-tags` attribute
- Updates DOM visibility
- Modifies URL hash for persistence
- Restores state from URL on page load

### 5. Responsive Design

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Responsive Features:**
- 📱 Mobile-first approach
- 🖥️ Optimized for all screen sizes
- 🎯 Touch-friendly on mobile
- 📐 Flexible grid layouts
- 🍔 Collapsible mobile menu

**Layout Adaptations:**
- **Homepage:**
  - Mobile: 1 column grid
  - Tablet: 2 column grid
  - Desktop: 3 column grid
- **Sidebar:**
  - Mobile: Below content
  - Desktop: Sticky sidebar
- **Navigation:**
  - Mobile: Expanded menu
  - Desktop: Horizontal menu

### 6. Syntax Highlighting

**Technology:** Prism.js

**Supported Languages:**
- JavaScript
- Python
- Bash/Shell
- YAML
- JSON
- HTML
- CSS
- Markdown
- And more...

**Features:**
- 🎨 Color-coded syntax
- 📋 Copy code button
- 🌓 Dark mode compatible
- 📏 Line numbers available
- 🎯 Language auto-detection

**Usage:**
````markdown
```javascript
function example() {
  return "highlighted code";
}
```
````

**Copy Code Feature:**
- Button appears on hover
- One-click copy to clipboard
- Visual feedback (checkmark animation)
- Works on all code blocks

### 7. Blog Post Collections

**Automatic Collections:**

#### posts Collection
- All blog posts from `src/posts/*.md`
- Sorted by date (newest first)
- Excludes future-dated posts
- Used on homepage

#### tagList Collection
- Unique tags from all posts
- Alphabetically sorted
- Used for tag display

#### tagListWithCounts Collection
- Tags with post counts
- Shows popularity
- Used in sidebar filter

**Custom Filtering:**
```javascript
// In .eleventy.js
eleventyConfig.addCollection("featured", function(collectionApi) {
  return collectionApi.getFilteredByGlob("src/posts/*.md")
    .filter(post => post.data.featured === true);
});
```

### 8. SEO Optimization

**Built-in SEO Features:**
- 📝 Semantic HTML structure
- 🏷️ Meta description tags
- 🖼️ Open Graph tags (Facebook)
- 🐦 Twitter Card tags
- 🔗 Canonical URLs
- 📱 Mobile-friendly
- ⚡ Fast load times
- 🎨 Proper heading hierarchy

**Meta Tags:**
```html
<title>{{ site_title }} - {{ title }}</title>
<meta name="description" content="{{ description }}">
<meta property="og:title" content="{{ site_title }}">
<meta property="og:description" content="{{ description }}">
<meta property="og:image" content="{{ image }}">
```

**Best Practices:**
- Descriptive page titles
- Unique meta descriptions
- Alt text on all images
- Readable URLs
- Fast performance

### 9. Scheduled Publishing

**Feature:**
Posts with future dates are automatically hidden until their publish date.

**How it works:**
```markdown
---
date: 2025-12-25  # Future date
---
```

**Behavior:**
- Post exists in repository
- Not visible in development/production
- Automatically appears when date arrives
- Works with daily automated builds

**Automation:**
- GitHub Actions runs daily (cron: `0 0 * * *`)
- Rebuilds site every day
- Publishes scheduled posts automatically

### 10. Image Handling

**Features:**
- 🖼️ Hero images for posts
- 📁 Organized image directory
- 🎨 Gradient placeholders (no image required)
- 📱 Responsive images
- ⚡ Automatic copying to output

**Image Paths:**
```
/images/posts/2025-12-04-hero.svg
```

**Placeholder:**
If no image specified, displays gradient placeholder with icon.

**Best Practices:**
- Optimize images before adding
- Use appropriate formats (SVG, PNG, JPG)
- Recommended size: 1200x630px
- Keep file sizes reasonable

### 11. Date Formatting

**Feature:**
Custom date filter for human-readable dates.

**Implementation:**
```javascript
eleventyConfig.addFilter("readableDate", (dateObj) => {
  return new Date(dateObj).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});
```

**Output:**
- Input: `2025-12-04`
- Output: `December 4, 2025`

**Usage:**
```njk
{{ post.date | readableDate }}
```

### 12. Post Card Layout

**Features:**
- 🎴 Visual post cards
- 🖼️ Image or gradient header
- 👤 Author information
- 📅 Publication date
- 📝 Summary text
- 🏷️ Tag display
- 🔗 Hover effects

**Components:**
1. **Image/Gradient** - Visual header
2. **Meta** - Author and date
3. **Title** - Post headline
4. **Summary** - Brief description
5. **Read More** - Call to action

**Styling:**
- Card shadow and hover effects
- Smooth transitions
- Dark mode support
- Responsive sizing

### 13. Navigation System

**Features:**
- 🧭 Sticky navigation bar
- 🏠 Logo/home link
- 📱 Mobile-responsive
- 🌓 Theme toggle
- 🔗 Page links

**Components:**
- **Logo** - Clickable, returns to home
- **Nav Links** - Home, About, etc.
- **Theme Toggle** - Dark/light switch
- **Mobile Menu** - Expanded on small screens

**Behavior:**
- Sticky at top of page
- Shadow on scroll
- Smooth transitions
- Touch-friendly on mobile

### 14. Footer

**Features:**
- 📋 Quick links
- ⚖️ Legal links (Privacy, Terms)
- ©️ Copyright notice
- 🎨 Branded design
- 🌓 Dark mode support

**Sections:**
1. **Branding** - Logo and description
2. **Quick Links** - Navigation
3. **Legal** - Privacy, Terms

### 15. Hot Reload Development

**Features:**
- 🔄 Automatic page reload on changes
- 👁️ Live CSS updates
- ⚡ Fast rebuild times
- 🖥️ Built-in dev server

**What Triggers Reload:**
- Markdown file changes
- Template changes
- Configuration changes
- CSS changes (via watch mode)

**Development Experience:**
```bash
npm run dev
# Edit files
# See changes instantly in browser
```

## Feature Comparison

| Feature | Traditional Blog | Tech Notes Blog |
|---------|------------------|-----------------|
| Hosting Cost | $$$ (server) | Free (static) |
| Speed | Moderate | Very Fast |
| Security | Vulnerable | Highly Secure |
| Maintenance | High | Low |
| Scalability | Limited | Unlimited |
| Setup Complexity | High | Low |
| Content Format | Database | Markdown |
| Version Control | Difficult | Easy (Git) |

## Upcoming Features

Potential features for future releases:

- 🔍 Search functionality
- 📧 Newsletter subscription
- 💬 Comments system (via external service)
- 📊 Analytics integration
- 🗂️ Category organization
- 📖 Reading time estimate
- 🔗 Related posts
- 📱 PWA support
- 🌐 Multi-language support

## Feature Usage Examples

### Filtering by Tags
1. Visit homepage
2. Check tags in sidebar (e.g., "javascript", "tutorial")
3. Posts filter automatically
4. Share filtered URL with others

### Creating Scheduled Post
```markdown
---
title: Christmas Special
date: 2025-12-25
---
Write post now, publishes automatically on Christmas!
```

### Customizing Theme
```javascript
// tailwind.config.js
colors: {
  primary: {
    500: '#your-color',
  }
}
```

---

**Next:** [Deployment Guide](DEPLOYMENT.md) | [API Reference](API_REFERENCE.md)
