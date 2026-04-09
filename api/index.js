/**
 * Vercel serverless entry: rewrites send all routes here.
 * server/index.js does not call app.listen() when required (only when run as main).
 */
module.exports = require('../server/index.js');
