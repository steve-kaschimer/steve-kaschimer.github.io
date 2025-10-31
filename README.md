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

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

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
image: /images/your-image.jpg
summary: A brief summary of your post
tags: ['tag1', 'tag2']
---

Your content here...
```

## Deployment to GitHub Pages

1. Make sure your repository is named `<username>.github.io`
2. Run the build command: `npm run deploy`
3. Push the `_site` directory contents to the `gh-pages` branch, or configure GitHub Pages to use the `main` branch with the `_site` folder

### Option 1: Manual Deployment

```bash
npm run deploy
cd _site
git init
git add .
git commit -m "Deploy to GitHub Pages"
git push -f git@github.com:<username>/<username>.github.io.git main:gh-pages
```

### Option 2: GitHub Actions (Recommended)

Create a `.github/workflows/deploy.yml` file for automatic deployment on push.

## Project Structure

```
├── src/
│   ├── _includes/         # Reusable components
│   ├── _layouts/          # Page layouts
│   │   ├── base.njk      # Base layout with navbar and footer
│   │   └── post.njk      # Blog post layout
│   ├── posts/            # Blog posts (markdown)
│   ├── styles/           # CSS files
│   ├── js/               # JavaScript files
│   ├── images/           # Images
│   ├── index.njk         # Homepage
│   └── about.njk         # About page
├── .eleventy.js          # Eleventy configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json
```

## Customization

### Theme Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### Site Information

Update the following files:
- `src/_layouts/base.njk` - Site name and logo
- `src/about.njk` - About page content
- Contact information

## License

MIT
