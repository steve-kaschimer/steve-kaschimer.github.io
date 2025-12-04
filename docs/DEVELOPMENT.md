# Development Guide

This guide covers the day-to-day development workflow for the Tech Notes blog.

## Development Environment Setup

### Initial Setup

1. **Clone and Install** (if not done already):
   ```bash
   git clone https://github.com/steve-kaschimer/steve-kaschimer.github.io.git
   cd steve-kaschimer.github.io
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

   This runs two processes in parallel:
   - Eleventy development server (port 8080)
   - Tailwind CSS watcher

## Available Commands

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Start Eleventy server only (no CSS watch)
npm start

# Build CSS in watch mode
npm run watch:css
```

### Build Commands

```bash
# Build site only
npm run build

# Build CSS only (minified)
npm run build:css

# Build everything for production
npm run deploy
```

### Manual Commands

```bash
# Run Eleventy manually
npx @11ty/eleventy

# Run Eleventy with specific options
npx @11ty/eleventy --serve --port=8081

# Build Tailwind CSS manually
npx tailwindcss -i ./src/styles/input.css -o ./_site/styles/output.css
```

## Development Workflow

### Making Changes

#### 1. Edit Content
- Edit markdown files in `src/posts/`
- Changes auto-reload in browser
- Check browser console for errors

#### 2. Edit Templates
- Edit `.njk` files in `src/_layouts/` or `src/`
- Changes trigger automatic rebuild
- Refresh browser to see updates

#### 3. Edit Styles
- Edit Tailwind classes in templates
- CSS automatically rebuilds
- Browser auto-reloads

#### 4. Edit JavaScript
- Edit files in `src/js/`
- Refresh browser to see changes
- Check browser console for errors

### Testing Your Changes

#### Local Testing
1. Start development server: `npm run dev`
2. Open http://localhost:8080
3. Test functionality:
   - Navigation works
   - Theme toggle works
   - Tag filtering works
   - Posts load correctly
   - Images display properly

#### Build Testing
```bash
# Test production build
npm run deploy

# Serve the built site locally
cd _site
python -m http.server 8000
# or
npx http-server
```

## Common Development Tasks

### Creating a New Page

1. **Create the page file:**
   ```bash
   touch src/contact.njk
   ```

2. **Add front matter and content:**
   ```njk
   ---
   layout: base.njk
   site_title: Tech Notes
   title: Contact
   description: Get in touch with us
   ---
   
   <div class="max-w-4xl mx-auto px-4 py-12">
     <h1 class="text-4xl font-bold mb-8">Contact Us</h1>
     <!-- Your content here -->
   </div>
   ```

3. **Add navigation link in `src/_layouts/base.njk`:**
   ```html
   <a href="/contact/" class="text-gray-700 dark:text-gray-300">Contact</a>
   ```

### Adding a New JavaScript Feature

1. **Create JavaScript file:**
   ```bash
   touch src/js/my-feature.js
   ```

2. **Write your code:**
   ```javascript
   document.addEventListener('DOMContentLoaded', function() {
     // Your code here
   });
   ```

3. **Include in base layout:**
   ```html
   <script src="/js/my-feature.js"></script>
   ```

### Creating a New Eleventy Collection

In `.eleventy.js`:

```javascript
eleventyConfig.addCollection("featured", function(collectionApi) {
  return collectionApi.getFilteredByGlob("src/posts/*.md")
    .filter(post => post.data.featured === true)
    .sort((a, b) => b.date - a.date);
});
```

Use in templates:
```njk
{% for post in collections.featured %}
  <!-- Post markup -->
{% endfor %}
```

### Adding a Custom Filter

In `.eleventy.js`:

```javascript
eleventyConfig.addFilter("uppercase", function(value) {
  return value.toUpperCase();
});
```

Use in templates:
```njk
{{ post.data.title | uppercase }}
```

### Customizing Tailwind

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#your-color',
        },
      },
      fontFamily: {
        custom: ['Your Font', 'sans-serif'],
      },
    },
  },
}
```

## Working with Git

### Creating a Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/my-new-feature

# Make changes, then stage them
git add .

# Commit with descriptive message
git commit -m "Add new feature: description"

# Push to remote
git push origin feature/my-new-feature
```

### Keeping Your Branch Updated

```bash
# Fetch latest changes
git fetch origin

# Merge main into your branch
git merge origin/main

# Or rebase (alternative)
git rebase origin/main
```

## Debugging

### Eleventy Debugging

```bash
# Run with debug output
DEBUG=* npx @11ty/eleventy

# Check specific namespace
DEBUG=Eleventy:EleventyFiles npx @11ty/eleventy
```

### Common Issues

#### Hot Reload Not Working
- Check browser console for errors
- Restart development server
- Clear browser cache
- Check that files are being saved

#### CSS Not Updating
- Ensure `watch:css` is running
- Check Tailwind content paths in config
- Verify class names are correct
- Hard refresh browser (Ctrl+Shift+R)

#### Posts Not Appearing
- Check post date (future posts are hidden)
- Verify front matter syntax
- Check glob pattern in collection
- Look for build errors in console

#### Build Fails
- Check syntax in markdown/templates
- Verify front matter is valid YAML
- Look at error message for file/line number
- Check for circular template dependencies

## Performance Optimization

### During Development

```bash
# Serve only (faster for template changes)
npx @11ty/eleventy --serve --quiet

# Skip copying unchanged files
npx @11ty/eleventy --incremental
```

### Production Builds

- CSS is automatically minified
- Remove unused Tailwind classes
- Optimize images before adding
- Keep JavaScript minimal

## Code Quality

### Linting

Currently no linter configured. Consider adding:

```bash
# ESLint for JavaScript
npm install --save-dev eslint

# Prettier for formatting
npm install --save-dev prettier
```

### Best Practices

#### Templates
- Use template inheritance
- Keep logic in `.eleventy.js`
- Use filters for formatting
- Avoid deep nesting

#### JavaScript
- Use modern ES6+ syntax
- Add comments for complex logic
- Handle errors gracefully
- Use event delegation

#### CSS
- Prefer Tailwind utilities
- Use dark mode variants
- Follow mobile-first approach
- Minimize custom CSS

#### Content
- Use semantic markdown
- Keep front matter consistent
- Optimize images
- Add alt text to images

## Testing Checklist

Before committing changes:

- [ ] Development server runs without errors
- [ ] Production build completes successfully
- [ ] All pages load correctly
- [ ] Theme toggle works
- [ ] Tag filtering works
- [ ] Navigation works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Images load properly
- [ ] Links work correctly

## IDE Setup

### VS Code Extensions

Recommended extensions:

- **Nunjucks** - Template syntax highlighting
- **Tailwind CSS IntelliSense** - Class autocomplete
- **Prettier** - Code formatting
- **ESLint** - JavaScript linting
- **Markdown All in One** - Markdown support

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "files.associations": {
    "*.njk": "nunjucks"
  },
  "tailwindCSS.includeLanguages": {
    "nunjucks": "html"
  },
  "editor.quickSuggestions": {
    "strings": true
  }
}
```

## Useful Resources

- [Eleventy Documentation](https://www.11ty.dev/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Nunjucks Documentation](https://mozilla.github.io/nunjucks/)
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

## Getting Help

If you're stuck:

1. Check error messages carefully
2. Review relevant documentation
3. Search existing issues on GitHub
4. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
5. Create a detailed issue with steps to reproduce

---

**Next:** [Content Guide](CONTENT_GUIDE.md) | [Customization Guide](CUSTOMIZATION.md)
