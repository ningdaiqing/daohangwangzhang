// SQLite 单例 + 表结构 + 基础查询封装
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DB_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DB_DIR, "navhub.db");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Next dev 模式下 HMR 会重新加载模块，globalThis 缓存 db 实例避免重连
const g = globalThis as unknown as { __navhub_db?: Database.Database };

function createDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name  TEXT NOT NULL,
      product_url   TEXT NOT NULL,
      category_id   TEXT NOT NULL,
      tag_ids       TEXT NOT NULL DEFAULT '',          -- 逗号分隔
      description   TEXT NOT NULL,
      submitter_name  TEXT NOT NULL,
      submitter_email TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending',    -- pending|approved|rejected
      submitted_at  TEXT NOT NULL,
      reviewed_at   TEXT,
      review_note   TEXT
    );

    CREATE TABLE IF NOT EXISTS upvotes (
      product_id    TEXT NOT NULL,
      voter_key     TEXT NOT NULL,                       -- 简化为 IP
      created_at    TEXT NOT NULL,
      PRIMARY KEY (product_id, voter_key)
    );

    CREATE TABLE IF NOT EXISTS products_extra (
      id            TEXT PRIMARY KEY,                    -- 直接复用 mock 的 id
      product_name  TEXT NOT NULL,
      product_url   TEXT NOT NULL,
      category_id   TEXT NOT NULL,
      tag_ids       TEXT NOT NULL DEFAULT '',
      description   TEXT NOT NULL,
      submitter_name TEXT NOT NULL,
      created_at    TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
    CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);
  `);

  return db;
}

export function getDb(): Database.Database {
  if (!g.__navhub_db) {
    g.__navhub_db = createDb();
  }
  return g.__navhub_db;
}
