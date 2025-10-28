// api/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' })); // allow big bodies for base64/files
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// simple health route
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// example: create user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    const [result] = await pool.query(
      'INSERT INTO users (name,email,phone,role,password,created_at) VALUES (?,?,?,?,?,NOW())',
      [name, email, phone, role, password]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error', details: err.message });
  }
});

// example: list users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id,name,email,phone,role,created_at FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.post("/api/users", (req, res) => {
  const { name, email, phone, role, password } = req.body;

  if (!name || !email)
    return res.status(400).json({ error: "Name and email are required" });

  const query =
    "INSERT INTO users (name, email, phone, role, password, created_at) VALUES (?, ?, ?, ?, ?, NOW())";

  db.query(query, [name, email, phone, role, password], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      message: "User added successfully",
      id: result.insertId,
    });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
