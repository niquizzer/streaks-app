import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../streaks-database/connect.js";

const app = express();
const port = process.env.PORT || 8080;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// JWT secret key (use environment variable in production)
const JWT_SECRET = "your-secret-key";

// Create users table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Register endpoint
app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const sql = `INSERT INTO users (email, password) VALUES (?, ?)`;
    db.run(sql, [email, hashedPassword], function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: err.message });
      }

      // Generate JWT
      const token = jwt.sign({ userId: this.lastID, email }, JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({
        message: "Registration successful",
        token,
        userId: this.lastID,
        email,
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // Compare passwords
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: "24h" }
        );

        res.json({
          message: "Login successful",
          token,
          userId: user.id,
          email: user.email,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Get all goals
app.get("/goals", authenticateToken, (req, res) => {
  db.all("SELECT * FROM streaks", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new goal
app.post("/goals", authenticateToken, (req, res) => {
  const { name, start_date } = req.body;
  const sql = `INSERT INTO streaks (name, start_date) VALUES (?, ?)`;

  db.run(sql, [name, start_date], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      id: this.lastID,
      name,
      start_date,
      current_count: 0,
    });
  });
});

// Update a goal
app.put("/goals/:id", authenticateToken, (req, res) => {
  const { name, current_count } = req.body;
  const sql = `UPDATE streaks SET name = ?, current_count = ? WHERE id = ?`;

  db.run(sql, [name, current_count, req.params.id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      id: req.params.id,
      name,
      current_count,
      changes: this.changes,
    });
  });
});

// Delete a goal
app.delete("/goals/:id", authenticateToken, (req, res) => {
  db.run("DELETE FROM streaks WHERE id = ?", req.params.id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "deleted",
      id: req.params.id,
      changes: this.changes,
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
