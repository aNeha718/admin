const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root", // change if needed
  database: "event_system"
});
db.connect((err) => {
  if (err) console.error("❌ DB Error:", err);
  else console.log("✅ MySQL Connected!");
});

// ✅ Register User (with dropdown role)
app.post("/register", (req, res) => {
  const { username, password, role } = req.body;

  db.query("SELECT * FROM users WHERE username=?", [username], (err, result) => {
    if (err) return res.json({ message: "Database error" });
    if (result.length > 0) return res.json({ message: "Username already exists!" });

    db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, password, role],
      (err2) => {
        if (err2) res.json({ message: "Error saving user" });
        else res.json({ message: `Registered successfully as ${role}` });
      }
    );
  });
});

// ✅ Login User
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query("SELECT * FROM users WHERE username=? AND password=?", [username, password], (err, result) => {
    if (err) return res.json({ ok: false, message: "DB error" });
    if (result.length > 0) res.json({ ok: true, role: result[0].role });
    else res.json({ ok: false, message: "Invalid credentials" });
  });
});

// ✅ Get all events
app.get("/events", (req, res) => {
  db.query("SELECT * FROM events", (err, result) => {
    if (err) res.json([]);
    else res.json(result);
  });
});

// ✅ Add new event
app.post("/events", (req, res) => {
  const { title, date } = req.body;
  db.query("INSERT INTO events (title, date) VALUES (?, ?)", [title, date], (err) => {
    if (err) res.json({ ok: false });
    else res.json({ ok: true });
  });
});

// ✅ Delete event
app.delete("/events/:id", (req, res) => {
  db.query("DELETE FROM events WHERE id=?", [req.params.id], (err) => {
    if (err) res.json({ ok: false });
    else res.json({ ok: true });
  });
});

// ✅ Register user for event
app.post("/registerEvent", (req, res) => {
  const { username, eventId } = req.body;
  db.query("SELECT id FROM users WHERE username=?", [username], (err, userRes) => {
    if (err || userRes.length === 0) return res.json({ ok: false });

    db.query(
      "INSERT INTO participants (user_id, event_id) VALUES (?, ?)",
      [userRes[0].id, eventId],
      (err2) => {
        if (err2) res.json({ ok: false });
        else res.json({ ok: true });
      }
    );
  });
});

// ✅ View participants
app.get("/participants/:eventId", (req, res) => {
  db.query(
    "SELECT username FROM users JOIN participants ON users.id=participants.user_id WHERE event_id=?",
    [req.params.eventId],
    (err, result) => {
      if (err) res.json([]);
      else res.json(result);
    }
  );
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
