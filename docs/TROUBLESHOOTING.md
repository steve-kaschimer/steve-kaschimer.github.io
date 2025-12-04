# Troubleshooting Guide

This guide helps you diagnose and fix common issues with the Tech Notes blog.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Development Server Issues](#development-server-issues)
- [Build Issues](#build-issues)
- [Content Issues](#content-issues)
- [Styling Issues](#styling-issues)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)

## Installation Issues

### npm install Fails

**Problem:** Dependencies fail to install

**Solutions:**

1. **Check Node.js version:**
   ```bash
   node --version
   # Should be v14 or higher
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

3. **Delete and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Check network connection:**
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

5. **Try with different flags:**
   ```bash
   npm install --legacy-peer-deps
   ```

### Permission Errors (Linux/Mac)

**Problem:** EACCES errors during npm install

**Solution:**

```bash
# Don't use sudo! Fix npm permissions instead
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Windows Path Issues

**Problem:** Path length errors on Windows

**Solution:**

1. **Enable long paths:**
   - Run as Administrator
   ```powershell
   Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name 'LongPathsEnabled' -Value 1
   ```

2. **Clone to shorter path:**
   ```bash
   cd C:\
   git clone <repo-url> blog
   ```

## Development Server Issues

### Port 8080 Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::8080`

**Solutions:**

1. **Find and kill process:**
   ```bash
   # Mac/Linux
   lsof -ti:8080 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :8080
   taskkill /PID <PID> /F
   ```

2. **Use different port:**
   ```bash
   npx @11ty/eleventy --serve --port=8081
   ```

### Hot Reload Not Working

**Problem:** Changes not appearing in browser

**Solutions:**

1. **Hard refresh browser:**
   - Chrome/Firefox: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

2. **Check file is saved:**
   - Verify file saved in editor
   - Check for syntax errors

3. **Restart dev server:**
   ```bash
   # Stop with Ctrl+C
   npm run dev
   ```

4. **Check browser console:**
   - Look for errors
   - Verify WebSocket connection

5. **Disable browser cache:**
   - Open DevTools
   - Network tab → Disable cache checkbox

### CSS Not Updating

**Problem:** Style changes not reflected

**Solutions:**

1. **Check Tailwind is watching:**
   ```bash
   npm run dev  # Runs both Eleventy and Tailwind watch
   ```

2. **Verify CSS path:**
   - Check `tailwind.config.js` content paths
   - Ensure classes are spelled correctly

3. **Rebuild CSS manually:**
   ```bash
   npm run build:css
   ```

4. **Clear Tailwind cache:**
   ```bash
   rm -rf .cache
   ```

## Build Issues

### Build Fails with Template Error

**Problem:** Template syntax error

**Example error:**
```
Error: Template render error: (path/to/file.njk)
```

**Solutions:**

1. **Check error message for line number**
2. **Common Nunjucks mistakes:**
   ```njk
   {# Wrong #}
   {{ post.title }
   
   {# Correct #}
   {{ post.title }}
   ```

3. **Check filter usage:**
   ```njk
   {# Wrong #}
   {{ post.date | missingFilter }}
   
   {# Correct - filter must be defined #}
   {{ post.date | readableDate }}
   ```

4. **Validate YAML front matter:**
   - Use [YAML Validator](https://www.yamllint.com/)
   - Check indentation (spaces, not tabs)

### Build Fails with Front Matter Error

**Problem:** Invalid YAML in post front matter

**Solutions:**

1. **Check YAML syntax:**
   ```yaml
   # Wrong - missing quotes around special characters
   title: My Post: A Guide
   
   # Correct
   title: "My Post: A Guide"
   ```

2. **Verify date format:**
   ```yaml
   # Wrong
   date: 12/04/2025
   
   # Correct
   date: 2025-12-04
   ```

3. **Check array syntax:**
   ```yaml
   # Wrong
   tags: [javascript, web-development
   
   # Correct
   tags: ['javascript', 'web-development']
   ```

### CSS Build Fails

**Problem:** Tailwind CSS build error

**Solutions:**

1. **Check Tailwind config syntax:**
   ```bash
   node -c tailwind.config.js
   ```

2. **Verify input CSS exists:**
   ```bash
   ls -la src/styles/input.css
   ```

3. **Update Tailwind:**
   ```bash
   npm update tailwindcss
   ```

4. **Clear PostCSS cache:**
   ```bash
   rm -rf node_modules/.cache
   ```

### Out of Memory Error

**Problem:** `JavaScript heap out of memory`

**Solution:**

```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

## Content Issues

### Posts Not Appearing

**Problem:** Blog post doesn't show on homepage

**Solutions:**

1. **Check date is not in future:**
   ```yaml
   # If date is future, post won't appear
   date: 2025-12-04
   ```

2. **Verify file location:**
   ```bash
   ls src/posts/
   # File should be in posts directory
   ```

3. **Check file extension:**
   ```bash
   # Should be .md
   mv post.txt post.md
   ```

4. **Validate front matter:**
   - Must have opening and closing `---`
   - Must be valid YAML

5. **Check build output:**
   ```bash
   npm run build
   # Look for file in output
   ```

### Images Not Loading

**Problem:** Images don't display

**Solutions:**

1. **Check image path:**
   ```yaml
   # Wrong - relative path
   image: images/hero.png
   
   # Correct - absolute path from site root
   image: /images/hero.png
   ```

2. **Verify image exists:**
   ```bash
   ls -la src/images/posts/
   ```

3. **Check passthrough copy:**
   In `.eleventy.js`:
   ```javascript
   eleventyConfig.addPassthroughCopy("src/images");
   ```

4. **Rebuild site:**
   ```bash
   npm run build
   ```

5. **Check browser console** for 404 errors

### Syntax Highlighting Not Working

**Problem:** Code blocks not highlighted

**Solutions:**

1. **Specify language:**
   ````markdown
   # Wrong
   ```
   code here
   ```
   
   # Correct
   ```javascript
   code here
   ```
   ````

2. **Check Prism.js loaded:**
   - Open browser DevTools
   - Check Network tab for Prism.js

3. **Verify supported language:**
   - Check base.njk for loaded languages
   - Add language if needed

4. **Clear cache and rebuild:**
   ```bash
   rm -rf _site
   npm run build
   ```

## Styling Issues

### Dark Mode Not Working

**Problem:** Theme toggle doesn't work

**Solutions:**

1. **Check localStorage:**
   ```javascript
   // In browser console
   localStorage.getItem('theme-preference')
   ```

2. **Verify class on html element:**
   ```javascript
   // In browser console
   document.documentElement.className
   // Should include 'dark' or 'light'
   ```

3. **Check dark mode variants in templates:**
   ```html
   <!-- Must have dark: variants -->
   <div class="bg-white dark:bg-gray-800">
   ```

4. **Verify Tailwind config:**
   ```javascript
   darkMode: 'class',
   ```

5. **Check theme.js loaded:**
   - View page source
   - Verify `<script src="/js/theme.js">`

### Styles Not Applied

**Problem:** Elements don't have expected styles

**Solutions:**

1. **Check class names:**
   ```html
   <!-- Wrong -->
   <div class="bg-primary">
   
   <!-- Correct -->
   <div class="bg-primary-600">
   ```

2. **Verify Tailwind content paths:**
   ```javascript
   content: [
     "./src/**/*.{html,md,njk,js}",
   ],
   ```

3. **Rebuild CSS:**
   ```bash
   npm run build:css
   ```

4. **Check browser DevTools:**
   - Inspect element
   - Check computed styles
   - Look for overriding styles

### Layout Broken

**Problem:** Page layout looks wrong

**Solutions:**

1. **Check responsive breakpoints:**
   ```html
   <!-- Classes should progress: base, sm:, md:, lg:, xl: -->
   <div class="w-full md:w-1/2 lg:w-1/3">
   ```

2. **Verify container classes:**
   ```html
   <div class="max-w-7xl mx-auto px-4">
   ```

3. **Check for missing closing tags:**
   - Use browser DevTools
   - Inspect DOM structure

4. **Test in different browsers:**
   - Chrome, Firefox, Safari
   - Check for browser-specific issues

## Deployment Issues

### GitHub Pages Not Updating

**Problem:** Changes not visible on live site

**Solutions:**

1. **Check Actions status:**
   - Go to Actions tab
   - Verify build succeeded
   - Check deployment completed

2. **Clear CDN cache:**
   - Wait 5-10 minutes
   - Hard refresh: `Ctrl+Shift+R`

3. **Verify correct branch:**
   - Check GitHub Pages settings
   - Ensure using correct source

4. **Check workflow file:**
   ```bash
   cat .github/workflows/deploy.yml
   ```

### Build Fails in GitHub Actions

**Problem:** Build succeeds locally but fails in Actions

**Solutions:**

1. **Check Node version:**
   - Workflow uses Node 18
   - Test locally: `nvm use 18`

2. **Use exact dependencies:**
   ```bash
   npm ci  # Instead of npm install
   ```

3. **Check environment:**
   - Paths might differ
   - Environment variables

4. **View full logs:**
   - Click on failed job
   - Expand all steps
   - Read error messages

### 404 Errors After Deployment

**Problem:** Pages return 404

**Solutions:**

1. **Check case sensitivity:**
   - GitHub Pages is case-sensitive
   - Ensure correct capitalization

2. **Verify file was generated:**
   ```bash
   ls -R _site/
   ```

3. **Check base URL:**
   - Verify pathPrefix in config
   - Check absolute vs relative paths

4. **Look at deployment logs:**
   - Ensure all files uploaded

## Performance Issues

### Slow Build Times

**Problem:** Build takes too long

**Solutions:**

1. **Use incremental builds:**
   ```bash
   npx @11ty/eleventy --incremental
   ```

2. **Optimize images:**
   - Compress before adding
   - Use appropriate formats

3. **Check collection filters:**
   - Ensure efficient filtering
   - Avoid complex calculations

4. **Profile build:**
   ```bash
   DEBUG=Eleventy:Benchmark npx @11ty/eleventy
   ```

### Slow Page Load

**Problem:** Site loads slowly

**Solutions:**

1. **Optimize images:**
   ```bash
   # Use imagemin or similar
   npm install -g imagemin-cli
   imagemin src/images/* -o src/images/
   ```

2. **Check CSS size:**
   ```bash
   ls -lh _site/styles/output.css
   ```

3. **Minimize JavaScript:**
   - Remove unused scripts
   - Defer non-critical JS

4. **Enable caching:**
   - Use CDN (automatic with GitHub Pages)
   - Set cache headers

## Getting More Help

If you're still stuck:

1. **Check error messages carefully:**
   - Read the full error
   - Note file names and line numbers

2. **Search existing issues:**
   - GitHub Issues
   - Eleventy documentation
   - Stack Overflow

3. **Create detailed issue:**
   - Describe problem
   - Include error messages
   - Show relevant code
   - List steps to reproduce

4. **Useful resources:**
   - [Eleventy Docs](https://www.11ty.dev/docs/)
   - [Tailwind Docs](https://tailwindcss.com/docs)
   - [Nunjucks Docs](https://mozilla.github.io/nunjucks/)
   - [GitHub Pages Docs](https://docs.github.com/en/pages)

---

**Next:** [API Reference](API_REFERENCE.md) | [Back to Index](README.md)
