/**
 * Web portal deploy (mirrors eData's scripts/deploy-web.cjs).
 *
 * `npm run build:web` builds the SAME React code used by the Capacitor app in
 * "portal" mode (URL routing, same-origin API, no mobile landing page) into
 * `dist-web/`, then this script syncs it into the SaukiGlobal web root at
 * `<web root>/webapp`. The web root `.htaccess` forwards /auth, /register and the
 * /app dashboard URLs to `webapp/index.html`; the PHP landing page is untouched.
 *
 * Override the destination with SAUKIGLOBAL_WEB_DIR if the web repo lives elsewhere.
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'dist-web');
const webRoot = process.env.SAUKIGLOBAL_WEB_DIR || 'C:/xampp/htdocs/saukiglobal';
const destDir = path.join(webRoot, 'webapp');

if (!fs.existsSync(path.join(srcDir, 'index.html'))) {
  console.error('[Web Deploy] dist-web/index.html missing. Run "vite build --mode portal" first.');
  process.exit(1);
}
if (!fs.existsSync(webRoot)) {
  console.error(`[Web Deploy] Web root not found: ${webRoot} (set SAUKIGLOBAL_WEB_DIR).`);
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });

// Copy over the existing build without wiping old hashed chunks, so users with an
// open session don't hit 404s on lazily-loaded chunks during a deployment.
// webapp/.htaccess lives in the web repo and is never overwritten.
fs.cpSync(srcDir, destDir, {
  recursive: true,
  filter: (src) => !src.endsWith('.map') && path.basename(src) !== '.htaccess',
});

console.log(`[Web Deploy] Synced portal build to ${destDir}`);
