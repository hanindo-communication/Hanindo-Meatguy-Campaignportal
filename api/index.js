/**
 * Vercel serverless entry — must live under `api/` for `vercel.json` `functions` patterns.
 * Local dev: `npm start` → `node server/index.js`.
 */
module.exports = require('../server/index.js');
