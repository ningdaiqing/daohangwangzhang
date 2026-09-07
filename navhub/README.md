# NavHub · AI 产品导航站 v2

> 精选 AI 产品导航站，覆盖对话、编程、图像、视频、办公、Agent 六大类。
> 定位参考 ProductHunt 的卡片流 + 真实持久化层。

## ✨ 已实现功能

### 浏览
- ✅ **首页**：Hero + 搜索、分类导航、编辑推荐、最新收录、热门标签、提交 CTA
- ✅ **分类列表 / 分类详情**：6 大分类，分类页带 Banner + 排序列表
- ✅ **标签列表 / 标签详情**：20 个标签可筛选
- ✅ **产品详情**：介绍、标签、定价、提交人、同类推荐；**实时点赞按钮**
- ✅ **产品榜单**：TOP 10 + 编辑精选 + 分类入口
- ✅ **搜索**：首页 `?q=` 参数覆盖产品名/标签/描述
- ✅ **暗色 / 亮色主题**：Header 一键切换，本地持久化

### 持久化（v2 新增）
- ✅ **SQLite (better-sqlite3)** 单文件数据库，零依赖、零运维
  - `submissions`：用户提交表，含 status (pending/approved/rejected)
  - `upvotes`：点赞去重表，按 voter_key（即 cookie 标识）唯一
  - `products_extra`：审核通过后晋升的可展示产品
- ✅ **真实提交**：`/submit` 表单走 Server Action 写入数据库
- ✅ **真实点赞**：`ProductCard` + 详情页 `UpvoteButton` 用 Server Action + Cookie voter key，按人去重
- ✅ **审核后台**：`/admin` 路由，密码口令登录 (`navhub-admin-2026`)，可逐条通过 / 驳回
- ✅ **审核通过即晋升**：通过后自动出现在首页 / 分类 / 榜单中

### 设计
- Server Components + 仅交互组件 `"use client"`
- `useOptimistic` + `useTransition` 让点赞"秒到感"

## 🧱 技术栈

- Next.js 14（App Router）+ TypeScript
- Tailwind CSS 3（含自定义品牌色 `brand` / 中性色 `ink`）
- **better-sqlite3 11** —— 同步 SQLite，wal 模式，无外部服务

## 📁 目录结构

```
navhub/
├─ app/
│  ├─ page.tsx                    首页（实时搜索 + 点赞）
│  ├─ actions.ts                  ★ Server Actions 集中入口
│  ├─ layout.tsx                  全局布局
│  ├─ globals.css
│  ├─ categories/page.tsx         分类列表
│  ├─ category/[slug]/page.tsx    分类详情
│  ├─ tags/page.tsx               标签列表
│  ├─ tag/[slug]/page.tsx         标签详情
│  ├─ product/[id]/page.tsx       产品详情（含点赞按钮）
│  ├─ product/[id]/UpvoteButton.tsx
│  ├─ ranking/page.tsx            榜单
│  ├─ submit/                     提交页 + 表单
│  ├─ admin/                      ★ 后台审核
│  │  ├─ page.tsx                 登录 / 队列 / 已通过 / 已驳回
│  │  ├─ AdminLoginForm.tsx
│  │  └─ ReviewActions.tsx
│  ├─ not-found.tsx
├─ components/                    UI 组件
├─ lib/
│  ├─ data.ts                     数据模型 + 20 款产品 mock
│  ├─ db.ts                       ★ SQLite 单例 + 建表
│  └─ store.ts                    ★ 上层 API（submissions / upvotes / products_extra）
```

## 🚀 运行

```bash
cd navhub
npm install        # 安装依赖（已配置国内镜像 npmmirror）
npm run dev        # 开发模式
# 浏览器打开 http://localhost:3000
```

数据落在项目根目录的 `.data/navhub.db`（首次启动自动建表）。

### 后台

访问 `/admin` → 输入口令 **`navhub-admin-2026`**（源码里写死，**仅开发用**；上生产请改成读 env）。

## 🧬 数据流

```
用户 /submit  → Server Action createSubmission
              → INSERT submissions(status=pending)
                                  ↓
                  /admin 通过
                                  ↓
              approveSubmission
              → INSERT products_extra(id="user-N", …)
              → UPDATE submissions SET status='approved'
                                  ↓
              listAllProducts() = mock + products_extra
              → 首页 / 榜单 / 分类 立刻可见
                                  ↓
用户点赞   → Server Action toggleUpvoteAction
            → INSERT/DELETE upvotes(product_id, voter_key)
            → router.refresh() 让所有卡片重新拉数据
```

## 🔧 后续可扩展

- [ ] 接 Postgres / Supabase（更全平台同步）
- [ ] 真实用户体系（OAuth / 邮箱注册）
- [ ] 详情页 SEO 元信息（og:image、JSON-LD）
- [ ] RSS / 订阅
- [ ] 多语言
- [ ] 产品 logo 上传
- [ ] 评分 / 评论

## 📝 Mock 数据调整

直接编辑 `lib/data.ts` 即可。要批量替换为真实数据时，把 `products` 数组换成从 CMS / API 拉取即可。
