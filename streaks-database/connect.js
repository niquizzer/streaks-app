import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

//Finds the path to the current file
const __filename = fileURLToPath(import.meta.url);
//Grabs the directory of current file
const __dirname = dirname(__filename);
//Creates an absolute path with the current directory and the streaks db
const dbPath = path.join(__dirname, "streaks.db");

const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Error connecting to database:", err.message);
      return;
    }
    console.log("Connected to SQLite database");

    db.run(
      `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
      (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
        } else {
          console.log("Successfully created users db");
        }
      }
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS streaks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        start_date TEXT NOT NULL,
        current_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER
        ,FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
      (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
        } else {
          console.log("Streaks table ready");
        }
      }
    );
  }
);

db.run("PRAGMA foreign_keys = ON");

export default db;
