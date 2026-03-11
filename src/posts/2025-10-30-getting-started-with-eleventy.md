---
author: Steve Kaschimer
date: 2025-10-30
image: /images/posts/2025-10-30-hero.png
image_prompt: "A wide-format dark editorial illustration on a near-black background with warm amber, off-white, and cool teal accents. The central visual is a stylized build pipeline flowing left to right: a stack of Markdown files with faint .md labels on the far left, arrows feeding into a central transformation node — a small mechanical gear rendered in teal labeled '11ty' — and emerging on the right as clean, structured HTML pages in a file tree. Three labeled panels float above the pipeline: 'Layouts,' 'Collections,' and 'Filters,' each connected to the transformation node by thin directional lines. At the bottom, a terminal prompt glows softly: 'npx @11ty/eleventy --serve,' with a miniature browser window suggesting a live local site. Mood: minimal and methodical — the quiet satisfaction of a static site snapping into existence from plain text, no runtime overhead, no complexity in the way. Avoid: generic web browser mockups, cloud provider logos, server rack imagery, WordPress or CMS screenshots, JavaScript framework logos."
layout: post.njk
site_title: Tech Notes
summary: Eleventy is a simpler static site generator. Learn why it's great for building fast, modern websites and how to get started with your first project.
tags: ["eleventy", "developer-productivity"]
title: Getting Started with Eleventy
---

Eleventy (or 11ty) is a fantastic static site generator that's simple, flexible, and incredibly fast. If you're looking to build a blog, documentation site, or any static website, Eleventy is an excellent choice.

## Why Eleventy?

Here are some reasons why I love working with Eleventy:

- **Simple & Flexible**: Works with multiple template languages
- **Fast Build Times**: Incredibly quick, even for large sites
- **No Client-Side JavaScript Required**: Pure static HTML by default
- **Great Documentation**: Easy to learn and well-documented
- **Active Community**: Lots of plugins and starter templates available

## Basic Setup

Getting started with Eleventy is straightforward. Here's a quick overview:

```bash
# Install Eleventy
npm install @11ty/eleventy

# Create a simple template
echo '# Hello World' > index.md

# Run Eleventy
npx @11ty/eleventy --serve
```

That's it! You now have a working Eleventy site.

## Key Concepts

### Layouts

Layouts are templates that wrap your content. They're perfect for creating consistent page structures.

### Collections

Collections let you group related content together. For a blog, you'd typically have a "posts" collection.

### Filters

Filters transform data in your templates. For example, formatting dates or truncating text.

## Next Steps

Now that you know the basics, here are some things to explore:

1. **Add styling** with your favorite CSS framework
2. **Create custom filters** for your specific needs
3. **Explore plugins** to extend functionality
4. **Deploy** to GitHub Pages, Netlify, or Vercel

## Conclusion

Eleventy strikes a perfect balance between simplicity and power. It gets out of your way and lets you focus on creating content.

Happy building!

---

Need help? Ask me!

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
