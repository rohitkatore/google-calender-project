const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 8000;
const AUTH_FILE = path.join(__dirname, "auth.json");
const EMPTY_AUTH = {
  access_token: null,
  token_expiry: null,
  user_data: null,
  is_connected: false,
};

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/auth", async (req, res) => {
  try {
    const data = await fs.readFile(AUTH_FILE, "utf8");
    res.json(JSON.parse(data));
  } catch {
    res.json(EMPTY_AUTH);
  }
});

app.post("/api/auth", async (req, res) => {
  try {
    await fs.writeFile(AUTH_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/auth", async (req, res) => {
  try {
    await fs.writeFile(AUTH_FILE, JSON.stringify(EMPTY_AUTH, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
