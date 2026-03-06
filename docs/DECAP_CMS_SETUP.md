# Decap CMS OAuth Setup for GitHub Pages

## The Problem
GitHub Pages serves only static files and cannot handle OAuth callbacks. Decap CMS needs a backend to complete GitHub authentication.

## Solution: Cloudflare Workers OAuth Backend

### Step 1: Create GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: `steve-kaschimer.github.io CMS`
   - **Homepage URL**: `https://steve-kaschimer.github.io`
   - **Authorization callback URL**: `https://YOUR-WORKER-NAME.workers.dev/callback`
   - (We'll update this URL after creating the Worker)
4. Click **"Register application"**
5. Generate a **Client Secret** and save both Client ID and Secret

### Step 2: Deploy Cloudflare Worker
1. Sign up at https://workers.cloudflare.com (free tier is fine)
2. Create a new Worker
3. Copy the Worker code from: https://github.com/i40west/netlify-cms-cloudflare-pages
4. Set environment variables:
   - `OAUTH_CLIENT_ID`: Your GitHub Client ID
   - `OAUTH_CLIENT_SECRET`: Your GitHub Client Secret
5. Deploy the Worker and note the URL: `https://your-worker.workers.dev`

### Step 3: Update GitHub OAuth App
1. Go back to your GitHub OAuth App settings
2. Update **Authorization callback URL**: `https://your-worker.workers.dev/callback`

### Step 4: Update Decap CMS Config
Update `src/admin/config.yml`:
```yaml
backend:
  name: github
  repo: "steve-kaschimer/steve-kaschimer.github.io"
  branch: main
  base_url: https://your-worker.workers.dev
  auth_endpoint: auth

local_backend: true

media_folder: "src/images/posts"
```

## Alternative: Edit Locally Only
If you don't want to set up OAuth:
1. Keep `local_backend: true`
2. Use CMS only on localhost
3. Commit and push changes via Git
4. Remove the `/admin` page from production

## Alternative: Deploy to Netlify for OAuth
Deploy your site to Netlify (free) which provides built-in OAuth, then use that URL for CMS access while keeping GitHub Pages for the public site.
