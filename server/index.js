const fs = require('fs');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const { discoverLandings } = require('./discover-landings');
const {
  requireAuth,
  postLogin,
  getLogout,
  isAuthenticated,
} = require('./auth');

const PORT = parseInt(process.env.PORT || '3788', 10);

/**
 * Vercel bundles the function under `.vercel/output`; `__dirname` may not sit next to `site/`.
 * `process.cwd()` is usually the repo root — and `includeFiles` in vercel.json copies `site/` there.
 */
function resolveSiteDir() {
  const candidates = [
    path.join(process.cwd(), 'site'),
    path.join(__dirname, '..', 'site'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'login.html'))) return dir;
  }
  return candidates[0];
}

const siteDir = resolveSiteDir();
const loginPath = path.join(siteDir, 'login.html');
const dashboardPath = path.join(siteDir, 'dashboard.html');

const app = express();
app.set('trust proxy', 1);

app.use(cookieParser());
app.get('/session', (req, res) => {
  const qs = req.url.indexOf('?') >= 0 ? req.url.slice(req.url.indexOf('?')) : '';
  res.redirect(302, '/' + qs);
});
app.post('/session', express.urlencoded({ extended: false }), postLogin);
app.get('/logout', getLogout);

app.get('/login', (req, res) => {
  const q = req.url.indexOf('?') >= 0 ? req.url.slice(req.url.indexOf('?')) : '';
  res.redirect(302, '/' + q);
});
app.get('/login.html', (req, res) => {
  res.redirect(302, '/');
});
app.get('/dashboard', (req, res) => {
  res.redirect(302, '/');
});

app.get('/', (req, res) => {
  const file = isAuthenticated(req) ? dashboardPath : loginPath;
  res.sendFile(file, (err) => {
    if (err) {
      console.error('[portal] sendFile failed', file, err.message);
      res.status(500).type('text').send('Gagal memuat halaman; pastikan folder site/ ikut deploy (lihat vercel.json includeFiles).');
    }
  });
});

app.use((req, res, next) => requireAuth(req, res, next));

app.get('/api/landing-pages', (req, res) => {
  try {
    const data = discoverLandings(siteDir);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list landing pages' });
  }
});

app.use(express.static(siteDir));

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Campaign portal at http://localhost:${PORT}`);
  });
}
