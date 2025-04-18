const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// CHANGE THIS to your own secret key
const SECRET_KEY = "bananas123";

// Initial redirect (will default to live link from first request if not set)
let currentRedirectUrl = "";
let redirectHistory = [];

// 🧭 Route to redirect user
app.get("/magiclink", (req, res) => {
  if (!currentRedirectUrl) {
    const host = req.get("host");
    currentRedirectUrl = `https://${host}`;
    redirectHistory.unshift(currentRedirectUrl);
  }
  res.redirect(currentRedirectUrl);
});

// 🔒 Route to update redirect
app.get("/change", (req, res) => {
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
app.get("/", (req, res) => {
  const host = req.get("host");
  const magicLink = `https://${host}/magiclink`;

  const historyHtml = redirectHistory
    .slice(0, 5)
    .map((url) => `<li><a href="${url}" target="_blank">${url}</a></li>`)
    .join("");

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Magic Redirect Manager</title>
        <style>
          body {
            font-family: sans-serif;
            background: #f8f9fa;
            color: #333;
            max-width: 600px;
            margin: auto;
            padding: 2em;
          }
          input, button {
            padding: 0.6em;
            margin-top: 1em;
            width: 100%;
            font-size: 1em;
            border: 1px solid #ccc;
            border-radius: 8px;
          }
          button {
            background-color: #007bff;
            color: white;
            border: none;
          }
          button:hover {
            background-color: #0056b3;
          }
          code {
            background: #eee;
            padding: 0.3em 0.5em;
            border-radius: 4px;
            display: inline-block;
            margin-top: 0.5em;
          }
          ul {
            padding-left: 1.2em;
          }
        </style>
      </head>
      <body>
        <h2>🔗 Magic Redirect Manager</h2>

        <form action="/change" method="get">
          <label for="url">New Redirect URL:</label>
          <input type="url" name="url" id="url" placeholder="https://example.com" required />

          <label for="key">Secret Key:</label>
          <input type="password" name="key" id="key" placeholder="your secret key" required />

          <button type="submit">Update Redirect</button>
        </form>

        <hr />

        <p>🌐 <strong>Current Magic Link:</strong></p>
        <code id="magiclink">${magicLink}</code>
        <button onclick="copyLink()">📋 Copy Link</button>

        <hr />

        <h3>📜 Redirect History (last 5)</h3>
        <ul>${historyHtml}</ul>

        <script>
          function copyLink() {
            const link = document.getElementById("magiclink").innerText;
            navigator.clipboard.writeText(link).then(() => {
              alert("✅ Link copied to clipboard!");
            });
          }
        </script>
      </body>
    </html>
  `);
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
