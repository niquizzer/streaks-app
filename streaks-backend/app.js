import express from "express";
import cors from "cors";
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

// Get all goals
app.get("/api/goals", (req, res) => {
  db.all("SELECT * FROM streaks", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new goal
app.post("/api/goals", (req, res) => {
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
app.put("/api/goals/:id", (req, res) => {
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
app.delete("/api/goals/:id", (req, res) => {
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
