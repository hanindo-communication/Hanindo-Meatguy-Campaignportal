/**
 * Vercel serverless entry — keep Express only here (no root index.js:
 * Vercel may serve root .js files as static text).
 */
module.exports = require('../server/index.js');
