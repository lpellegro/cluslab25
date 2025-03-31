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

  const token = "patEYNvu8eVsoUFvd.d681043e170e04cc2b0971d87190566aec2945dd2ad95fb81398a50024c4cff4";
  const apiUrl = `https://api.airtable.com/v0/appPgG6qF4W2FvbHS/Users?filterByFormula=user_id=\"${userId}\"`;

  try {
    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (!data.records.length) return res.redirect("/index.html?error=notfound");

    const phone = data.records[0].fields.phone || "";
    const normalizedPhone = phone.replace(/[\s\-\.+]/g, "").replace(/^\+/, "");

    req.session.phone = normalizedPhone;
    res.redirect("/support.html");
  } catch (err) {
    console.error("Error fetching user:", err);
    res.redirect("/index_final_with_error.html?error=server");
  }
});

app.post("/call", async (req, res) => {
  const phone = req.session.phone;
  if (!phone) return res.status(403).send("Unauthorized");

  try {
    const response = await fetch("https://hooks.us.webexconnect.io/events/CAF0PJS5LU", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "key": "035a02f1-0aec-11f0-910b-02e3b0a35a3b"
      },
      body: JSON.stringify({ phone })
    });

    if (response.ok) {
      res.send("Support is on the way!");
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