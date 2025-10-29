/** @type {import('next').NextConfig} */
const nextConfig = {
	// Enable static export output for GitHub Pages deployments.
	// When `output: 'export'` is set, `next build` will emit a static `out/` directory.
	// See: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
	output: 'export',
	trailingSlash: true,
	images: {
		unoptimized: true,
	},
	// If you host under a repo name on GitHub Pages, set ASSET_PREFIX or modify here
	// assetPrefix: process.env.GH_PAGES ? '/steve-kaschimer.github.io/' : '',
}

export default nextConfig;
