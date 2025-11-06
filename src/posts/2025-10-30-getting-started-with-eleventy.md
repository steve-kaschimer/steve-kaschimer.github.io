---
layout: post.njk
site_title: Tech Notes
title: Getting Started with Eleventy
author: Steve Kaschimer
date: 2025-10-30
image: /images/posts/2025-10-30-hero.svg
summary: Eleventy is a simpler static site generator. Learn why it's great for building fast, modern websites and how to get started with your first project.
tags: ['eleventy', 'web-development', 'tutorial']
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
