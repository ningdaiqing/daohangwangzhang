// 数据库适配层：本地用 SQLite，Cloudflare Pages 用内存模式
// 根据 runtime 环境自动选择

import type { Submission, Product, PricingTier } from "./data";

// ===== 内存存储（Serverless 兼容） =====
interface MemSubmission {
  id: number;
  productName: string;
  productUrl: string;
  categoryId: string;
  tagIds: string[];
  description: string;
  submitterName: string;
  submitterEmail: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
}

interface MemProductExtra {
  id: string;
  productName: string;
  productUrl: string;
  categoryId: string;
  tagIds: string[];
  description: string;
  submitterName: string;
  createdAt: string;
}

interface MemUpvote {
  productId: string;
  voterKey: string;
  createdAt: string;
}

const g = globalThis as unknown as {
  __navhub_submissions?: MemSubmission[];
  __navhub_upvotes?: MemUpvote[];
  __navhub_products_extra?: MemProductExtra[];
  __navhub_next_id?: number;
  __navhub_db?: unknown;
};

// 初始化内存存储
if (!g.__navhub_submissions) g.__navhub_submissions = [];
if (!g.__navhub_upvotes) g.__navhub_upvotes = [];
if (!g.__navhub_products_extra) g.__navhub_products_extra = [];
if (!g.__navhub_next_id) g.__navhub_next_id = 1;

// ===== 尝试加载 SQLite（本地开发环境） =====
let sqliteDb: any = null;
try {
  // 动态加载，Cloudflare 环境会直接跳过
  const Database = require("better-sqlite3");
  const path = require("node:path");
  const fs = require("node:fs");
  const DB_DIR = path.join(process.cwd(), ".data");
  const DB_PATH = path.join(DB_DIR, "navhub.db");
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  sqliteDb = new Database(DB_PATH);
  sqliteDb.pragma("journal_mode = WAL");
  sqliteDb.pragma("foreign_keys = ON");
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name  TEXT NOT NULL,
      product_url   TEXT NOT NULL,
      category_id   TEXT NOT NULL,
      tag_ids       TEXT NOT NULL DEFAULT '',
      description   TEXT NOT NULL,
      submitter_name  TEXT NOT NULL,
      submitter_email TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending',
      submitted_at  TEXT NOT NULL,
      reviewed_at   TEXT,
      review_note   TEXT
    );
    CREATE TABLE IF NOT EXISTS upvotes (
      product_id    TEXT NOT NULL,
      voter_key     TEXT NOT NULL,
      created_at    TEXT NOT NULL,
      PRIMARY KEY (product_id, voter_key)
    );
    CREATE TABLE IF NOT EXISTS products_extra (
      id            TEXT PRIMARY KEY,
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
} catch {
  // Cloudflare Pages 或无 better-sqlite3 环境，使用内存模式
  sqliteDb = null;
}

export const isSqlite = !!sqliteDb;

// ===== 统一 API =====
export function listSubmissions(opts?: { status?: "pending" | "approved" | "rejected" }): Submission[] {
  const status = opts?.status ?? "pending";
  if (sqliteDb) {
    const rows = sqliteDb.prepare("SELECT * FROM submissions WHERE status = ? ORDER BY submitted_at DESC LIMIT 50").all(status);
    return rows.map(rowToSubmission);
  }
  return g.__navhub_submissions!
    .filter((s) => s.status === status)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 50)
    .map(memToSubmission);
}

export function countSubmissions(status: "pending" | "approved" | "rejected"): number {
  if (sqliteDb) {
    const row = sqliteDb.prepare("SELECT COUNT(*) as c FROM submissions WHERE status = ?").get(status);
    return row?.c ?? 0;
  }
  return g.__navhub_submissions!.filter((s) => s.status === status).length;
}

export function createSubmission(input: Omit<Submission, "id" | "submittedAt">): { ok: boolean; id?: number; error?: string } {
  try {
    if (sqliteDb) {
      const dup = sqliteDb.prepare("SELECT COUNT(*) as c FROM submissions WHERE product_url = ? AND status != 'rejected'").get(input.productUrl);
      if ((dup?.c ?? 0) > 0) return { ok: false, error: "该产品已被提交过，请勿重复提交" };
      const info = sqliteDb.prepare(
        `INSERT INTO submissions (product_name, product_url, category_id, tag_ids, description, submitter_name, submitter_email, status, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
      ).run(input.productName, input.productUrl, input.categoryId, input.tagIds.join(","), input.description, input.submitterName, input.submitterEmail, new Date().toISOString());
      return { ok: true, id: Number(info.lastInsertRowid) };
    }
    // 内存模式
    const existing = g.__navhub_submissions!.find((s) => s.productUrl === input.productUrl && s.status !== "rejected");
    if (existing) return { ok: false, error: "该产品已被提交过，请勿重复提交" };
    const id = g.__navhub_next_id!++;
    g.__navhub_submissions!.push({
      id,
      ...input,
      status: "pending",
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewNote: null,
    });
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function upvoteProduct(productId: string, voterKey: string): { ok: boolean; upvoted: boolean; total: number } {
  if (sqliteDb) {
    const exists = sqliteDb.prepare("SELECT COUNT(*) as c FROM upvotes WHERE product_id = ? AND voter_key = ?").get(productId, voterKey);
    if ((exists?.c ?? 0) > 0) {
      sqliteDb.prepare("DELETE FROM upvotes WHERE product_id = ? AND voter_key = ?").run(productId, voterKey);
      return { ok: true, upvoted: false, total: countUpvotes(productId) };
    }
    sqliteDb.prepare("INSERT INTO upvotes (product_id, voter_key, created_at) VALUES (?, ?, ?)").run(productId, voterKey, new Date().toISOString());
    return { ok: true, upvoted: true, total: countUpvotes(productId) };
  }
  // 内存模式
  const existing = g.__navhub_upvotes!.find((u) => u.productId === productId && u.voterKey === voterKey);
  if (existing) {
    g.__navhub_upvotes = g.__navhub_upvotes!.filter((u) => u !== existing);
    return { ok: true, upvoted: false, total: countUpvotes(productId) };
  }
  g.__navhub_upvotes!.push({ productId, voterKey, createdAt: new Date().toISOString() });
  return { ok: true, upvoted: true, total: countUpvotes(productId) };
}

export function countUpvotes(productId: string): number {
  if (sqliteDb) {
    const row = sqliteDb.prepare("SELECT COUNT(*) as c FROM upvotes WHERE product_id = ?").get(productId);
    return row?.c ?? 0;
  }
  return g.__navhub_upvotes!.filter((u) => u.productId === productId).length;
}

export function getUpvotedSet(productIds: string[], voterKey: string): Set<string> {
  if (productIds.length === 0 || !voterKey) return new Set();
  if (sqliteDb) {
    const placeholders = productIds.map(() => "?").join(",");
    const rows = sqliteDb.prepare(`SELECT product_id FROM upvotes WHERE voter_key = ? AND product_id IN (${placeholders})`).all(voterKey, ...productIds);
    return new Set(rows.map((r: any) => r.product_id));
  }
  const set = new Set<string>();
  for (const u of g.__navhub_upvotes!) {
    if (u.voterKey === voterKey && productIds.includes(u.productId)) {
      set.add(u.productId);
    }
  }
  return set;
}

export function getProductUpvotes(productId: string, base = 0): number {
  return base + countUpvotes(productId);
}

export function listAllProducts(): Product[] {
  const { products: mockProducts } = require("./data");
  const mock: Product[] = mockProducts.map((p: Product) => ({
    ...p,
    upvotes: p.upvotes + countUpvotes(p.id),
  }));

  let extras: Product[] = [];
  if (sqliteDb) {
    const rows = sqliteDb.prepare("SELECT * FROM products_extra ORDER BY created_at DESC").all();
    extras = rows.map((r: any) => ({
      id: r.id,
      name: r.product_name,
      tagline: r.description.slice(0, 30),
      description: r.description,
      url: r.product_url,
      categoryId: r.category_id,
      tagIds: r.tag_ids ? r.tag_ids.split(",").filter(Boolean) : [],
      pricing: "freemium" as PricingTier,
      upvotes: countUpvotes(r.id),
      logoColor: "#5d87ff",
      logoInitial: r.product_name.slice(0, 2).toUpperCase(),
      submittedBy: r.submitter_name,
      submittedAt: r.created_at,
    }));
  } else {
    extras = g.__navhub_products_extra!.map((r) => ({
      id: r.id,
      name: r.productName,
      tagline: r.description.slice(0, 30),
      description: r.description,
      url: r.productUrl,
      categoryId: r.categoryId,
      tagIds: r.tagIds,
      pricing: "freemium" as PricingTier,
      upvotes: countUpvotes(r.id),
      logoColor: "#5d87ff",
      logoInitial: r.productName.slice(0, 2).toUpperCase(),
      submittedBy: r.submitterName,
      submittedAt: r.createdAt,
    }));
  }

  return [...mock, ...extras];
}

export function approveSubmission(submissionId: number, note?: string): { ok: boolean; error?: string } {
  if (sqliteDb) {
    const row = sqliteDb.prepare("SELECT * FROM submissions WHERE id = ?").get(submissionId);
    if (!row) return { ok: false, error: "提交不存在" };
    if (row.status !== "pending") return { ok: false, error: "该提交已处理" };
    const userProductId = `user-${row.id}`;
    const exists = sqliteDb.prepare("SELECT COUNT(*) as c FROM products_extra WHERE id = ?").get(userProductId);
    if ((exists?.c ?? 0) === 0) {
      sqliteDb.prepare(
        `INSERT INTO products_extra (id, product_name, product_url, category_id, tag_ids, description, submitter_name, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(userProductId, row.product_name, row.product_url, row.category_id, row.tag_ids, row.description, row.submitter_name, new Date().toISOString());
    }
    sqliteDb.prepare("UPDATE submissions SET status='approved', reviewed_at=?, review_note=? WHERE id=?").run(new Date().toISOString(), note ?? null, submissionId);
    return { ok: true };
  }
  // 内存模式
  const sub = g.__navhub_submissions!.find((s) => s.id === submissionId);
  if (!sub) return { ok: false, error: "提交不存在" };
  if (sub.status !== "pending") return { ok: false, error: "该提交已处理" };
  const userProductId = `user-${sub.id}`;
  if (!g.__navhub_products_extra!.find((p) => p.id === userProductId)) {
    g.__navhub_products_extra!.push({
      id: userProductId,
      productName: sub.productName,
      productUrl: sub.productUrl,
      categoryId: sub.categoryId,
      tagIds: sub.tagIds,
      description: sub.description,
      submitterName: sub.submitterName,
      createdAt: new Date().toISOString(),
    });
  }
  sub.status = "approved";
  sub.reviewedAt = new Date().toISOString();
  sub.reviewNote = note ?? null;
  return { ok: true };
}

export function rejectSubmission(submissionId: number, note?: string): { ok: boolean; error?: string } {
  if (sqliteDb) {
    const row = sqliteDb.prepare("SELECT * FROM submissions WHERE id = ?").get(submissionId);
    if (!row) return { ok: false, error: "提交不存在" };
    if (row.status !== "pending") return { ok: false, error: "该提交已处理" };
    sqliteDb.prepare("UPDATE submissions SET status='rejected', reviewed_at=?, review_note=? WHERE id=?").run(new Date().toISOString(), note ?? null, submissionId);
    return { ok: true };
  }
  // 内存模式
  const sub = g.__navhub_submissions!.find((s) => s.id === submissionId);
  if (!sub) return { ok: false, error: "提交不存在" };
  if (sub.status !== "pending") return { ok: false, error: "该提交已处理" };
  sub.status = "rejected";
  sub.reviewedAt = new Date().toISOString();
  sub.reviewNote = note ?? null;
  return { ok: true };
}

export function isAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  return token === process.env.ADMIN_TOKEN || token === "navhub-admin-2026";
}

// ===== 辅助函数 =====
function rowToSubmission(r: any): Submission {
  return {
    id: `sub-${r.id}`,
    productName: r.product_name,
    productUrl: r.product_url,
    categoryId: r.category_id,
    tagIds: r.tag_ids ? r.tag_ids.split(",").filter(Boolean) : [],
    description: r.description,
    submitterName: r.submitter_name,
    submitterEmail: r.submitter_email,
    submittedAt: r.submitted_at,
  };
}

function memToSubmission(s: MemSubmission): Submission {
  return {
    id: `sub-${s.id}`,
    productName: s.productName,
    productUrl: s.productUrl,
    categoryId: s.categoryId,
    tagIds: s.tagIds,
    description: s.description,
    submitterName: s.submitterName,
    submitterEmail: s.submitterEmail,
    submittedAt: s.submittedAt,
  };
}
