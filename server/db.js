import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "leads.sqlite");

export function openDb() {
  const db = new sqlite3.Database(dbPath);
  db.exec(`
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      createdAt TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      service TEXT NOT NULL,
      message TEXT NOT NULL,
      source TEXT,
      status TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      lastError TEXT
    );
  `);
  return db;
}

export function insertLead(db, lead) {
  const stmt = `
    INSERT INTO leads (createdAt, name, email, phone, service, message, source, status, attempts, lastError)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  return new Promise((resolve, reject) => {
    db.run(
      stmt,
      [
        lead.createdAt,
        lead.name,
        lead.email,
        lead.phone || null,
        lead.service,
        lead.message,
        lead.source || null,
        lead.status,
        lead.attempts ?? 0,
        lead.lastError || null
      ],
      function onRun(err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}

export function updateLeadStatus(db, id, status, attempts, lastError) {
  const stmt = `
    UPDATE leads
    SET status = ?, attempts = ?, lastError = ?
    WHERE id = ?
  `;
  return new Promise((resolve, reject) => {
    db.run(stmt, [status, attempts, lastError || null, id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

