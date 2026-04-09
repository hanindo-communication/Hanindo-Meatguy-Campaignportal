const fs = require('fs');
const path = require('path');

/**
 * Vercel serverless often does not resolve express.static reliably; read from disk.
 * @param {string} root absolute path to site root
 */
function siteStatic(root) {
  const rootR = path.resolve(root);
  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const suffix = req.path.replace(/^\/+/, '');
    if (!suffix) return next();
    const target = path.resolve(path.join(rootR, suffix));
    if (target !== rootR && !target.startsWith(rootR + path.sep)) return next();
    fs.stat(target, (err, st) => {
      if (err) return next();
      if (st.isDirectory()) {
        const idx = path.join(target, 'index.html');
        return fs.stat(idx, (e2, st2) => {
          if (!e2 && st2.isFile()) return res.sendFile(idx);
          return next();
        });
      }
      if (st.isFile()) return res.sendFile(target);
      return next();
    });
  };
}

module.exports = { siteStatic };
