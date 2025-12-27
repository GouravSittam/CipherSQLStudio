/**
 * GET /api/health - Health check endpoint
 *
 * Author: Gourav Chaudhary
 */

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.json({
    status: "OK",
    message: "CipherSQLStudio API is running on Vercel",
    timestamp: new Date().toISOString(),
  });
};
