// Accessibility regression check: runs axe-core (WCAG 2.1 A/AA + best
// practices) against a representative set of pages, in both light and dark
// mode, using a real browser (color-contrast checks need real layout/CSS,
// which a DOM-only tool like jsdom can't give you).
//
// Usage: npm run deploy && node scripts/a11y-check.js
// Exits non-zero if any violations are found.

const fs = require("fs");
const path = require("path");
const http = require("http");
const { chromium } = require("playwright");

const SITE_DIR = path.join(__dirname, "..", "_site");
const PORT = 4173;

const MIME = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml",
  ".xml": "application/xml", ".txt": "text/plain",
};

function startServer() {
  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split("?")[0]);
    if (reqPath.endsWith("/")) reqPath += "index.html";
    let filePath = path.join(SITE_DIR, reqPath);
    if (!filePath.startsWith(SITE_DIR)) {
      res.writeHead(403);
      return res.end();
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end("Not found");
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

function firstPostPath() {
  const postsDir = path.join(SITE_DIR, "posts");
  const slug = fs.readdirSync(postsDir).find((f) => fs.statSync(path.join(postsDir, f)).isDirectory());
  if (!slug) throw new Error("No posts found in _site/posts - run `npm run deploy` first");
  return `/posts/${slug}/`;
}

async function scanPage(browser, name, url, colorScheme, axeSource) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme });
  // Block external hosts (fonts, CDN scripts, analytics) - they're slow or
  // unreachable in sandboxed/offline environments and irrelevant to a11y.
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
  if (colorScheme === "dark") {
    await page.evaluate(() => document.documentElement.classList.add("dark"));
  }
  await page.addScriptTag({ content: axeSource });
  const results = await page.evaluate(async () => {
    return await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
    });
  });
  await page.close();
  return { name, colorScheme, violations: results.violations };
}

async function main() {
  if (!fs.existsSync(SITE_DIR)) {
    console.error("_site not found - run `npm run deploy` first.");
    process.exit(1);
  }

  const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
  const pages = [
    ["home", "/"],
    ["post", firstPostPath()],
    ["about", "/about/"],
    ["privacy", "/privacy/"],
    ["terms", "/terms/"],
    ["404", "/404.html"],
  ];

  // Claude Code's sandboxed environment pre-installs Chromium outside
  // Playwright's default browser cache; use it when present instead of
  // requiring `npx playwright install` (which needs a real browser download).
  const sandboxChromium = "/opt/pw-browsers/chromium";
  const launchOpts = fs.existsSync(sandboxChromium) ? { executablePath: sandboxChromium } : {};

  const server = await startServer();
  const browser = await chromium.launch(launchOpts);

  let totalViolations = 0;
  try {
    for (const [name, urlPath] of pages) {
      for (const colorScheme of ["light", "dark"]) {
        const url = `http://localhost:${PORT}${urlPath}`;
        const { violations } = await scanPage(browser, name, url, colorScheme, axeSource);
        const label = `${name} (${colorScheme})`;
        if (violations.length === 0) {
          console.log(`OK    ${label}`);
          continue;
        }
        totalViolations += violations.length;
        console.log(`FAIL  ${label}: ${violations.length} violation(s)`);
        for (const v of violations) {
          console.log(`  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} element(s))`);
          for (const node of v.nodes.slice(0, 3)) {
            console.log(`      ${node.target.join(" ")}`);
            console.log(`      ${node.failureSummary.replace(/\n/g, " ")}`);
          }
        }
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (totalViolations > 0) {
    console.log(`\n${totalViolations} accessibility violation(s) found - fix before shipping.`);
    process.exit(1);
  }
  console.log("\nNo accessibility violations found.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
