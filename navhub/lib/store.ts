// 数据库上层 API：submissions + upvotes + products_extra
import { getDb } from "./db";
import {
  categories,
  products as mockProducts,
  tags as mockTags,
  type Product,
  type Submission,
  type PricingTier,
} from "./data";

// ====== 类型映射 ======
interface SubmissionRow {
  id: number;
  product_name: string;
  product_url: string;
  category_id: string;
  tag_ids: string;
  description: string;
  submitter_name: string;
  submitter_email: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at: string | null;
  review_note: string | null;
}

interface ProductExtraRow {
  id: string;
  product_name: string;
  product_url: string;
  category_id: string;
  tag_ids: string;
  description: string;
  submitter_name: string;
  created_at: string;
}

function rowToSubmission(r: SubmissionRow): Submission {
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

// ====== Submissions ======
export function listSubmissions(opts?: {
  status?: SubmissionRow["status"];
}): Submission[] {
  const db = getDb();
  const status = opts?.status ?? "pending";
  const rows = db
    .prepare<{ status: string }, SubmissionRow>(
      `SELECT * FROM submissions WHERE status = @status ORDER BY submitted_at DESC LIMIT 50`
    )
    .all({ status });
  return rows.map(rowToSubmission);
}

export function countSubmissions(status: SubmissionRow["status"]): number {
  const db = getDb();
  const row = db
    .prepare<{ status: string }, { c: number }>(
      `SELECT COUNT(*) as c FROM submissions WHERE status = @status`
    )
    .get({ status });
  return row?.c ?? 0;
}

export function createSubmission(input: Omit<Submission, "id" | "submittedAt">): {
  ok: boolean;
  id?: number;
  error?: string;
} {
  const db = getDb();
  try {
    // URL 重复检查
    const dup = db
      .prepare<{ url: string }, { c: number }>(
        `SELECT COUNT(*) as c FROM submissions WHERE product_url = @url AND status != 'rejected'`
      )
      .get({ url: input.productUrl });
    if ((dup?.c ?? 0) > 0) {
      return { ok: false, error: "该产品已被提交过，请勿重复提交" };
    }

    const info = db
      .prepare(
        `INSERT INTO submissions
          (product_name, product_url, category_id, tag_ids, description,
           submitter_name, submitter_email, status, submitted_at)
         VALUES
          (@product_name, @product_url, @category_id, @tag_ids, @description,
           @submitter_name, @submitter_email, 'pending', @submitted_at)`
      )
      .run({
        product_name: input.productName,
        product_url: input.productUrl,
        category_id: input.categoryId,
        tag_ids: input.tagIds.join(","),
        description: input.description,
        submitter_name: input.submitterName,
        submitter_email: input.submitterEmail,
        submitted_at: new Date().toISOString(),
      });
    return { ok: true, id: Number(info.lastInsertRowid) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ====== Upvotes ======
export function upvoteProduct(productId: string, voterKey: string): {
  ok: boolean;
  upvoted: boolean;
  total: number;
} {
  const db = getDb();
  const exists = db
    .prepare<{ p: string; v: string }, { c: number }>(
      `SELECT COUNT(*) as c FROM upvotes WHERE product_id = @p AND voter_key = @v`
    )
    .get({ p: productId, v: voterKey });

  if ((exists?.c ?? 0) > 0) {
    db.prepare(`DELETE FROM upvotes WHERE product_id = @p AND voter_key = @v`).run({
      p: productId,
      v: voterKey,
    });
    const c = countUpvotes(productId);
    return { ok: true, upvoted: false, total: c };
  }

  db.prepare(
    `INSERT INTO upvotes (product_id, voter_key, created_at) VALUES (@p, @v, @t)`
  ).run({ p: productId, v: voterKey, t: new Date().toISOString() });
  const c = countUpvotes(productId);
  return { ok: true, upvoted: true, total: c };
}

export function countUpvotes(productId: string): number {
  const db = getDb();
  const row = db
    .prepare<{ p: string }, { c: number }>(
      `SELECT COUNT(*) as c FROM upvotes WHERE product_id = @p`
    )
    .get({ p: productId });
  return row?.c ?? 0;
}

export function getUpvotedSet(productIds: string[], voterKey: string): Set<string> {
  if (productIds.length === 0 || !voterKey) return new Set();
  const db = getDb();
  const placeholders = productIds.map(() => "?").join(",");
  const rows = db
    .prepare<unknown[], { product_id: string }>(
      `SELECT product_id FROM upvotes WHERE voter_key = ? AND product_id IN (${placeholders})`
    )
    .all(voterKey, ...productIds);
  return new Set(rows.map((r) => r.product_id));
}

// ====== 合并产品源（mock + 通过审核的提交） ======
export function getProductUpvotes(productId: string, base = 0): number {
  return base + countUpvotes(productId);
}

export function listAllProducts(): Product[] {
  // mock 数据的点赞 = 原始值（mock 里写死的）+ DB 中真实用户点赞
  const mock: Product[] = mockProducts.map((p) => ({
    ...p,
    upvotes: p.upvotes + countUpvotes(p.id),
  }));

  // 通过审核的 submissions → 自动晋升为可展示产品（id 前缀 user-）
  const db = getDb();
  const approvedRows = db
    .prepare<unknown[], ProductExtraRow>(
      `SELECT * FROM products_extra ORDER BY created_at DESC`
    )
    .all();
  const extras: Product[] = approvedRows.map((r) => ({
    // r.id 已经是 'user-N' 形式的 final id（由 approveSubmission 写入时决定的）
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

  return [...mock, ...extras];
}

export function approveSubmission(submissionId: number, note?: string): { ok: boolean; error?: string } {
  const db = getDb();
  const row = db
    .prepare<{ id: number }, SubmissionRow>(`SELECT * FROM submissions WHERE id = @id`)
    .get({ id: submissionId });
  if (!row) return { ok: false, error: "提交不存在" };
  if (row.status !== "pending") return { ok: false, error: "该提交已处理" };

  // 晋升为可展示产品
  const userProductId = `user-${row.id}`;
  const exists = db
    .prepare<{ id: string }, { c: number }>(
      `SELECT COUNT(*) as c FROM products_extra WHERE id = @id`
    )
    .get({ id: userProductId });
  if ((exists?.c ?? 0) === 0) {
    db.prepare(
      `INSERT INTO products_extra
        (id, product_name, product_url, category_id, tag_ids, description, submitter_name, created_at)
       VALUES
        (@id, @product_name, @product_url, @category_id, @tag_ids, @description, @submitter_name, @created_at)`
    ).run({
      id: userProductId,
      product_name: row.product_name,
      product_url: row.product_url,
      category_id: row.category_id,
      tag_ids: row.tag_ids,
      description: row.description,
      submitter_name: row.submitter_name,
      created_at: new Date().toISOString(),
    });
  }

  db.prepare(
    `UPDATE submissions SET status='approved', reviewed_at=@t, review_note=@n WHERE id=@id`
  ).run({ id: submissionId, t: new Date().toISOString(), n: note ?? null });
  return { ok: true };
}

export function rejectSubmission(submissionId: number, note?: string): { ok: boolean; error?: string } {
  const db = getDb();
  const row = db
    .prepare<{ id: number }, SubmissionRow>(`SELECT * FROM submissions WHERE id = @id`)
    .get({ id: submissionId });
  if (!row) return { ok: false, error: "提交不存在" };
  if (row.status !== "pending") return { ok: false, error: "该提交已处理" };

  db.prepare(
    `UPDATE submissions SET status='rejected', reviewed_at=@t, review_note=@n WHERE id=@id`
  ).run({ id: submissionId, t: new Date().toISOString(), n: note ?? null });
  return { ok: true };
}

// ====== 工具：简单的 admin token ======
// 主公想要的话改成读 env；v2 先 hardcode 在文件里
export function isAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  // 开发环境默认值
  return token === "navhub-admin-2026";
}
