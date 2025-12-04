# Deployment Guide

This guide explains how to deploy the Tech Notes blog to various platforms.

## Table of Contents

- [GitHub Pages Deployment](#github-pages-deployment)
- [Manual Deployment](#manual-deployment)
- [Continuous Deployment](#continuous-deployment)
- [Alternative Platforms](#alternative-platforms)
- [Domain Configuration](#domain-configuration)
- [Troubleshooting Deployment](#troubleshooting-deployment)

## GitHub Pages Deployment

GitHub Pages is the recommended deployment platform for this blog. It's free, reliable, and integrates seamlessly with the repository.

### Automatic Deployment (Recommended)

The repository includes a GitHub Actions workflow that automatically builds and deploys the site.

#### Setup Steps

1. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - **Note:** GitHub Pages is free for public repositories. Private repositories require GitHub Pro, Team, or Enterprise.

2. **Configure the workflow:**
   The workflow file (`.github/workflows/deploy.yml`) is already configured to:
   - Build on push to `main` branch
   - Run daily at midnight UTC
   - Support manual triggers

3. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Deploy site"
   git push origin main
   ```

4. **Wait for deployment:**
   - Go to **Actions** tab in GitHub
   - Watch the build process
   - Site deploys to `https://username.github.io`

#### Workflow Configuration

The workflow (`.github/workflows/deploy.yml`) does:

```yaml
jobs:
  build:
    - Checkout code
    - Setup Node.js
    - Install dependencies
    - Build CSS
    - Build site
    - Upload artifact
  
  deploy:
    - Deploy to GitHub Pages
```

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch
- Daily cron schedule (00:00 UTC)

### Manual GitHub Pages Deployment

If you prefer manual control:

#### Option 1: Deploy to gh-pages Branch

```bash
# Build the site
npm run deploy

# Navigate to output directory
cd _site

# Initialize git (if needed)
git init
git add .
git commit -m "Deploy to GitHub Pages"

# Push to gh-pages branch
git push -f git@github.com:username/username.github.io.git main:gh-pages

# Return to root
cd ..
```

Then configure GitHub Pages to use the `gh-pages` branch.

#### Option 2: Deploy _site Directory

1. **Build the site:**
   ```bash
   npm run deploy
   ```

2. **Configure GitHub Pages** to use `main` branch with `/_site` folder

3. **Commit and push:**
   ```bash
   git add _site
   git commit -m "Add built site"
   git push origin main
   ```

**Note:** Make sure `_site/` is not in `.gitignore`

## Manual Deployment

For manual deployment to any hosting provider:

### Build Process

```bash
# Install dependencies
npm install

# Build site and CSS
npm run deploy
```

This creates the `_site` directory containing:
- HTML files
- CSS files (minified)
- JavaScript files
- Images and assets

### Deploy _site Directory

Upload the contents of `_site/` to your web server:

```bash
# Example using rsync
rsync -avz _site/ user@server:/var/www/html/

# Example using FTP
# Use any FTP client to upload _site/* to your hosting
```

## Continuous Deployment

### GitHub Actions (Already Configured)

The included workflow provides:
- **Automatic builds** on push
- **Scheduled builds** (daily)
- **Manual triggers** when needed

### Netlify

Deploy to Netlify for preview deployments and more:

#### Using Netlify UI

1. **Connect repository:**
   - Sign in to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Select your repository

2. **Configure build:**
   - Build command: `npm run deploy`
   - Publish directory: `_site`

3. **Deploy:**
   - Click "Deploy site"
   - Netlify builds and deploys automatically

#### Using netlify.toml

Create `netlify.toml` in repository root:

```toml
[build]
  command = "npm run deploy"
  publish = "_site"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404
```

### Vercel

Deploy to Vercel:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Configure:**
   - Build command: `npm run deploy`
   - Output directory: `_site`

### Cloudflare Pages

1. **Connect repository** in Cloudflare Pages dashboard
2. **Configure:**
   - Build command: `npm run deploy`
   - Build output directory: `_site`
3. **Deploy automatically** on push

## Alternative Platforms

### Amazon S3

1. **Build site:**
   ```bash
   npm run deploy
   ```

2. **Upload to S3:**
   ```bash
   aws s3 sync _site/ s3://your-bucket-name --delete
   ```

3. **Configure S3 for static hosting:**
   - Enable static website hosting
   - Set index.html as index document
   - Configure bucket policy for public access

### DigitalOcean App Platform

1. **Create new app** from repository
2. **Configure:**
   - Build command: `npm run deploy`
   - Output directory: `_site`
3. **Deploy**

### Traditional Web Hosting

For traditional shared hosting (cPanel, etc.):

1. **Build site locally:**
   ```bash
   npm run deploy
   ```

2. **Upload _site/* via FTP:**
   - Use FileZilla, WinSCP, or similar
   - Upload contents to public_html or www directory

3. **Ensure correct permissions:**
   - Files: 644
   - Directories: 755

## Domain Configuration

### Using Custom Domain with GitHub Pages

1. **Add CNAME file:**
   ```bash
   echo "yourdomain.com" > src/CNAME
   ```

2. **Configure passthrough in `.eleventy.js`:**
   ```javascript
   eleventyConfig.addPassthroughCopy("src/CNAME");
   ```

3. **Configure DNS:**
   - Add A records pointing to GitHub Pages IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Or CNAME record: `username.github.io`

4. **Enable in GitHub Settings:**
   - Go to Settings → Pages
   - Enter custom domain
   - Enable "Enforce HTTPS"

### DNS Configuration Examples

**For apex domain (example.com):**
```
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
```

**For subdomain (blog.example.com):**
```
CNAME blog  username.github.io
```

**For both:**
```
CNAME www   username.github.io
A     @     185.199.108.153
...
```

## Environment-Specific Configuration

### Base URL Configuration

For different base URLs (e.g., deployed in subdirectory):

Edit `.eleventy.js`:

```javascript
module.exports = function(eleventyConfig) {
  let pathPrefix = "/";
  
  if (process.env.ELEVENTY_ENV === "production") {
    pathPrefix = "/blog/";
  }
  
  return {
    pathPrefix: pathPrefix,
    // ... other config
  };
};
```

Use in templates:
```njk
<a href="{{ '/about/' | url }}">About</a>
```

### Build Environments

Create environment-specific builds:

**package.json:**
```json
{
  "scripts": {
    "build": "npx @11ty/eleventy",
    "build:prod": "ELEVENTY_ENV=production npm run build",
    "build:staging": "ELEVENTY_ENV=staging npm run build"
  }
}
```

**In templates:**
```njk
{% if eleventy.env.environment === "production" %}
  <!-- Production-only code -->
{% endif %}
```

## Deployment Checklist

Before deploying:

- [ ] Test site locally with production build
- [ ] Check all links work
- [ ] Verify images load correctly
- [ ] Test on different browsers
- [ ] Test responsive design
- [ ] Check dark/light theme
- [ ] Verify no console errors
- [ ] Test tag filtering
- [ ] Check post dates are correct
- [ ] Review meta tags and SEO
- [ ] Optimize images
- [ ] Remove debug code
- [ ] Update version/changelog if applicable

## Monitoring Deployment

### GitHub Actions

Monitor builds:
1. Go to **Actions** tab
2. View workflow runs
3. Check logs for errors
4. View deployment status

### Viewing Logs

```bash
# GitHub Actions logs are visible in the Actions tab
# For other platforms:

# Netlify CLI
netlify logs

# Vercel CLI
vercel logs
```

## Rollback Procedure

### GitHub Pages

Revert to previous version:

```bash
# Find the previous commit
git log

# Revert to specific commit
git revert <commit-hash>

# Or reset to previous commit
git reset --hard <commit-hash>
git push -f origin main
```

### Netlify/Vercel

- Use dashboard to rollback to previous deployment
- Previous deployments are automatically preserved

## Performance Optimization

### Pre-deployment Optimizations

1. **Optimize Images:**
   ```bash
   # Use imagemin or similar
   npm install -g imagemin-cli
   imagemin src/images/* -o src/images/
   ```

2. **Minify CSS:**
   Already done by `npm run build:css`

3. **Check Build Size:**
   ```bash
   du -sh _site
   ```

### Post-deployment

1. **Enable CDN** (automatic with GitHub Pages, Netlify, Vercel)
2. **Enable HTTPS** (automatic with most platforms)
3. **Configure caching headers** (if using custom server)

## Troubleshooting Deployment

### Build Fails on GitHub Actions

1. **Check Node version:**
   - Workflow uses Node 18
   - Test locally with same version

2. **Check dependencies:**
   ```bash
   npm ci  # Use exact versions from lock file
   ```

3. **View logs:**
   - Go to Actions tab
   - Click failed run
   - Expand failed step

### Site Not Updating

1. **Clear browser cache** (Ctrl+Shift+R)
2. **Check deployment completed** in Actions
3. **Verify changes pushed** to correct branch
4. **Wait a few minutes** for DNS/CDN propagation

### 404 Errors

1. **Check file paths** (case-sensitive)
2. **Verify base URL** configuration
3. **Check .eleventy.js** passthrough copy
4. **Ensure index.html** exists in directories

### CSS Not Loading

1. **Check build:css** ran successfully
2. **Verify path** in templates: `/styles/output.css`
3. **Check passthrough copy** in .eleventy.js
4. **Clear browser cache**

## Security Best Practices

- ✅ Use HTTPS (automatic with GitHub Pages)
- ✅ Keep dependencies updated: `npm audit`
- ✅ Don't commit secrets to repository
- ✅ Use GitHub Actions secrets for sensitive data
- ✅ Enable branch protection on main branch
- ✅ Review workflow permissions

---

**Next:** [Troubleshooting Guide](TROUBLESHOOTING.md) | [API Reference](API_REFERENCE.md)
