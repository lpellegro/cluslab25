const express = require("express");
const fetch = require("node-fetch");
const session = require("express-session");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: "your-very-secure-secret",
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname)));

app.post("/get-support", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.redirect("/index.html?error=notfound");
  req.session.userId = userId;

  const token = process.env.AIRTABLE_TOKEN //"patEYNvu8eVsoUFvd.d681043e170e04cc2b0971d87190566aec2945dd2ad95fb81398a50024c4cff4";
  const readEndpoint = process.env.AIRTABLE_READ_API;
  //const apiUrl = `https://api.airtable.com/v0/appPgG6qF4W2FvbHS/Users?filterByFormula=user_id=\"${userId}\"`;
  const apiUrl = `${readEndpoint}"${userId}"`;

  try {
    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (!data.records.length) return res.redirect("/index.html?error=notfound");

    const phone = data.records[0].fields.phone || "";
    const firstName = data.records[0].fields.first_name || "";
    const lastName = data.records[0].fields.last_name || "";
    const lastOrder = data.records[0].fields.last_order || "";
    const normalizedPhone = phone.replace(/[\s\-\.+]/g, "").replace(/^\+/, "");

    req.session.phone = normalizedPhone;
    req.session.name = firstName;
    req.session.order = lastOrder;
    
    res.redirect("/support.html");
  } catch (err) {
    console.error("Error fetching user:", err);
    res.redirect("/index.html?error=server");
  }
});

app.post("/call", async (req, res) => {
  const phone = req.session.phone;
  const name = req.session.name;
  const order = req.session.order;
  const userId = req.session.userId;
  const webhookKey = process.env.WEBEX_HOOK_KEY
  if (!phone) return res.status(403).send("Unauthorized");

  try {
    const webexUrl = process.env.WEBEX_HOOK;
    const response = await fetch(webexUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "key": webhookKey
      },
      body: JSON.stringify({ 
        "user_id": userId,
        "phone": phone,
        "name": name,
        "order": order})
    });

    if (response.ok) {
      //res.send("Support is on the way!");
      res.send(`
        <html>
          <head>
            <meta http-equiv="refresh" content="3; url=/index.html" />
          </head>
          <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1>Support is on the way!</h1>
            <p>Redirecting you back to the home page...</p>
          </body>
        </html>
        `);
    } else {
      res.status(500).send("Failed to send support request");
    }
  } catch (err) {
    console.error("Error calling support:", err);
    res.status(500).send("Error in support request");
  }
});

//const path = require("path");
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});