const crypto = require('crypto');

const COOKIE_NAME = 'portal_auth';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const DEV_FALLBACK_SECRET = 'dev-only-insecure-secret-min-16-chars';

/** Vercel sets VERCEL=1; treat like production for secrets and cookies. */
function isProdLike() {
  return (
    process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  );
}

/** Secret for signing new sessions — required in production / on Vercel. */
function resolveSigningSecret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (isProdLike()) {
    throw new Error(
      'SESSION_SECRET must be set to a random string of at least 16 characters'
    );
  }
  return DEV_FALLBACK_SECRET;
}

/**
 * Secret for verifying existing cookies. If missing in production, return null
 * (treat as logged out) so routes like GET / do not throw Internal Server Error.
 */
function resolveVerifySecret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (isProdLike()) return null;
  return DEV_FALLBACK_SECRET;
}

function getPassword() {
  return process.env.PORTAL_PASSWORD || 'admin123';
}

function signPayload(payloadB64, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');
}

function createSessionToken() {
  const secret = resolveSigningSecret();
  const payload = {
    exp: Date.now() + COOKIE_MAX_AGE_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString(
    'base64url'
  );
  const sig = signPayload(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return false;
  const secret = resolveVerifySecret();
  if (!secret) return false;

  const dot = token.indexOf('.');
  if (dot === -1) return false;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!payloadB64 || !sig) return false;
  const expected = signPayload(payloadB64, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    );
    if (typeof payload.exp !== 'number' || payload.exp < Date.now())
      return false;
    return true;
  } catch {
    return false;
  }
}

function isAuthenticated(req) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  return verifySessionToken(token);
}

function timingSafeEqualString(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
}

function requireAuth(req, res, next) {
  if (!isAuthenticated(req)) {
    const nextParam = encodeURIComponent(req.originalUrl || '/');
    res.redirect(302, `/?next=${nextParam}`);
    return;
  }
  next();
}

function postLogin(req, res) {
  const password =
    req.body && req.body.password != null ? String(req.body.password) : '';
  const expected = getPassword();
  if (!timingSafeEqualString(password, expected)) {
    let dest = '/?error=1';
    const n = req.body && req.body.next ? String(req.body.next) : '';
    if (n.startsWith('/') && !n.startsWith('//')) {
      dest = `/?error=1&next=${encodeURIComponent(n)}`;
    }
    res.redirect(302, dest);
    return;
  }
  let token;
  try {
    token = createSessionToken();
  } catch (e) {
    console.error('[auth] Cannot create session (check SESSION_SECRET on Vercel):', e.message);
    res
      .status(503)
      .type('html')
      .send(
        '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Konfigurasi server</title></head><body style="font-family:sans-serif;padding:2rem;max-width:40rem">' +
          '<h1>Konfigurasi belum lengkap</h1>' +
          '<p>Di Vercel: <strong>Project → Settings → Environment Variables</strong>, tambahkan ' +
          '<code>SESSION_SECRET</code> (string acak minimal <strong>16 karakter</strong>), lalu redeploy.</p>' +
          '<p>Opsional: set juga <code>PORTAL_PASSWORD</code> untuk password portal.</p>' +
          '</body></html>'
      );
    return;
  }
  const secure = isProdLike();
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE_MS,
    sameSite: 'lax',
    secure,
    path: '/',
  });
  res.redirect(302, '/');
}

function getLogout(req, res) {
  const secure = isProdLike();
  res.clearCookie(COOKIE_NAME, { path: '/', secure, sameSite: 'lax' });
  res.redirect('/');
}

module.exports = {
  requireAuth,
  postLogin,
  getLogout,
  isAuthenticated,
  COOKIE_NAME,
};
