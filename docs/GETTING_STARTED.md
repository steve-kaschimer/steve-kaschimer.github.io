# Getting Started

This guide will help you set up the Tech Notes blog on your local machine and get it running in minutes.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- **Node.js** (version 18 or higher recommended)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
- **npm** (comes with Node.js)
  - Verify installation: `npm --version`
- **Git** (for version control)
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/steve-kaschimer/steve-kaschimer.github.io.git
cd steve-kaschimer.github.io
```

If you're creating a new blog from this template:

```bash
git clone https://github.com/steve-kaschimer/steve-kaschimer.github.io.git my-blog
cd my-blog
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Eleventy (static site generator)
- Tailwind CSS (styling framework)
- D3 libraries (for tag cloud visualization)
- Other development dependencies

### 3. Start the Development Server

Run the development server with hot reloading:

```bash
npm run dev
```

This command does two things:
1. Starts the Eleventy development server on port 8080
2. Watches for CSS changes and rebuilds Tailwind CSS automatically

Your blog will be available at: **http://localhost:8080**

The development server will automatically reload when you make changes to:
- Markdown files (`.md`)
- Template files (`.njk`)
- Configuration files
- CSS files

## Verify Installation

After starting the development server, open your browser to http://localhost:8080 and verify:

1. ✅ The homepage loads with blog posts
2. ✅ Dark/light theme toggle works
3. ✅ Tag filtering works in the sidebar
4. ✅ Individual blog posts open correctly
5. ✅ Navigation links work (Home, About)

## Project Structure Overview

Here's a quick overview of the important directories and files:

```
steve-kaschimer.github.io/
├── src/                    # Source files
│   ├── _layouts/          # Page layouts (base.njk, post.njk)
│   ├── posts/             # Blog posts (markdown files)
│   ├── images/            # Images and assets
│   ├── js/                # JavaScript files
│   ├── styles/            # CSS/Tailwind styles
│   ├── index.njk          # Homepage
│   └── about.njk          # About page
├── .eleventy.js           # Eleventy configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── package.json           # Node.js dependencies and scripts
└── _site/                 # Generated static site (after build)
```

## Next Steps

Now that you have the blog running locally, you can:

1. **Create your first blog post** - See the [Content Guide](CONTENT_GUIDE.md)
2. **Customize the theme** - See the [Customization Guide](CUSTOMIZATION.md)
3. **Understand the architecture** - See the [Architecture Overview](ARCHITECTURE.md)
4. **Learn about deployment** - See the [Deployment Guide](DEPLOYMENT.md)

## Common Commands

Here are the most common commands you'll use:

```bash
# Start development server with hot reloading
npm run dev

# Build the site for production
npm run build

# Build only CSS
npm run build:css

# Build everything (site + CSS) for deployment
npm run deploy

# Start Eleventy server only (without CSS watch)
npm start
```

## Troubleshooting

If you encounter issues during setup:

### Port 8080 is Already in Use

If port 8080 is already being used:

```bash
# Kill the process on port 8080 (Linux/Mac)
lsof -ti:8080 | xargs kill -9

# Or use a different port
npx @11ty/eleventy --serve --port=8081
```

### Dependencies Installation Fails

1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Build Errors

If you get build errors:

1. Make sure you're using Node.js 14 or higher
2. Check that all files are properly saved
3. Look at the error message - it usually indicates which file has the issue
4. See the [Troubleshooting Guide](TROUBLESHOOTING.md) for more solutions

## Getting Help

If you need additional help:

1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Review the [Architecture documentation](ARCHITECTURE.md)
3. Look at existing blog posts in `src/posts/` for examples
4. Check the [Eleventy documentation](https://www.11ty.dev/docs/)

---

**Next:** [Architecture Overview](ARCHITECTURE.md) | [Content Guide](CONTENT_GUIDE.md)
