const express = require("express");
const serverless = require("serverless-http"); // Important for Vercel
const app = express();
const router = express.Router();

const SECRET_KEY = "bananas123";
let currentRedirectUrl = "";
let redirectHistory = [];

// 🧭 Route to redirect user
router.get("/magiclink", (req, res) => {
  if (!currentRedirectUrl) {
    const host = req.headers.host;
    currentRedirectUrl = `https://${host}`;
    redirectHistory.unshift(currentRedirectUrl);
  }
  res.redirect(currentRedirectUrl);
});

// 🔒 Route to update redirect
router.get("/change", (req, res) => {
  const newUrl = req.query.url;
  const key = req.query.key;

  if (key !== SECRET_KEY) {
    return res.status(403).send("🚫 Unauthorized. Invalid secret key.");
  }

  if (newUrl && newUrl.startsWith("http")) {
    currentRedirectUrl = newUrl;
    redirectHistory.unshift(newUrl);
    res.send(`✅ Redirect URL updated to: <a href="${newUrl}">${newUrl}</a>`);
  } else {
    res.send("❌ Please provide a valid ?url=https://...");
  }
});

// 🌐 Admin UI
router.get("/", (req, res) => {
  const host = req.headers.host;
  const magicLink = `https://${host}/api/magiclink`;

  const historyHtml = redirectHistory
    .slice(0, 5)
    .map((url) => `<li><a href="${url}" target="_blank">${url}</a></li>`)
    .join("");

  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Magic Redirect Manager</title></head>
      <body>
        <h2>🔗 Magic Redirect Manager</h2>
        <form action="/api/change" method="get">
          <label for="url">New Redirect URL:</label><input type="url" name="url" required />
          <label for="key">Secret Key:</label><input type="password" name="key" required />
          <button type="submit">Update</button>
        </form>
        <p>🌐 <strong>Magic Link:</strong></p>
        <code>${magicLink}</code>
        <ul>${historyHtml}</ul>
      </body>
    </html>
  `);
});

app.use("/api", router);
module.exports = app;
module.exports.handler = serverless(app);
