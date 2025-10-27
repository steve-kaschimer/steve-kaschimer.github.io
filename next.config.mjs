/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'export',
	trailingSlash: true,
	images: {
		unoptimized: true,
	},
	// If you host under a repo name on GitHub Pages, set ASSET_PREFIX or modify here
	// assetPrefix: process.env.GH_PAGES ? '/steve-kaschimer.github.io/' : '',
}

export default nextConfig;
