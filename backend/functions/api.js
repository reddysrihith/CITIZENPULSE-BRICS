/**
 * Netlify Serverless Function – Express API handler
 *
 * Netlify passes the original request path (e.g. /api/auth/status) to the
 * function so Express routes mounted at /api/* match as-is.
 *
 * Socket.IO is skipped in serverless mode (stateless environment).
 */
const serverless = require('serverless-http');

// server.js exports the Express `app` and conditionally starts the HTTP
// server only when NOT in production/netlify mode.
const app = require('../server');

module.exports.handler = serverless(app);
