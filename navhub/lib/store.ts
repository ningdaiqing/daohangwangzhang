// 数据存储层 — 从 db.ts 重新导出统一 API
// db.ts 自动适配：本地用 SQLite，Cloudflare Pages 用内存模式

export {
  listSubmissions,
  countSubmissions,
  createSubmission,
  upvoteProduct,
  countUpvotes,
  getUpvotedSet,
  getProductUpvotes,
  listAllProducts,
  approveSubmission,
  rejectSubmission,
  isAdminToken,
  isSqlite,
} from "./db";
