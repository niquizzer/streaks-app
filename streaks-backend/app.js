import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../streaks-database/connect.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
const port = process.env.PORT || 8080;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (email, password) VALUES (?, ?)`;
    db.run(sql, [email, hashedPassword], function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: err.message });
      }

      const token = jwt.sign({ userId: this.lastID, email }, JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({
        message: "Registration successful",
        token,
        userId: this.lastID,
        email
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

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

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: "Invalid credentials" });
        } 

        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: "24h" }
        );
    res.json({
      message: "Login successful",
      token,
      userId: user.id,
      email,
    })
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
  const userId = req.user.userId;
  db.all("SELECT * FROM streaks WHERE user_id = ?", [userId], (err, rows) => {
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
  const userId = req.user.userId;
  const sql = `INSERT INTO streaks (name, start_date, user_id) VALUES (?, ?, ?)`;

  db.run(sql, [name, start_date, userId], function (err) {
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
