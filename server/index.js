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
const publicDir = path.join(__dirname, '..', 'public');
const loginPath = path.join(publicDir, 'login.html');
const dashboardPath = path.join(publicDir, 'dashboard.html');

const app = express();

app.use(cookieParser());
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
  if (isAuthenticated(req)) {
    res.sendFile(dashboardPath);
  } else {
    res.sendFile(loginPath);
  }
});

app.use((req, res, next) => requireAuth(req, res, next));

app.get('/api/landing-pages', (req, res) => {
  try {
    const data = discoverLandings(publicDir);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list landing pages' });
  }
});

app.use(express.static(publicDir));

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Campaign portal at http://localhost:${PORT}`);
  });
}
