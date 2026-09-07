Markdown

# NavHub · AI 产品导航站

> 精选高质量 AI 产品，覆盖 9 大分类，85+ 款工具，程序化 SEO 驱动。

## ✨ 功能特性

- **85 款 AI 产品**：覆盖对话、编程、图像、视频、办公、Agent、音频、营销、研究 9 大分类
- **程序化 SEO**：每个产品页自动生成结构化内容（什么是 / 核心功能 / 如何使用 / 定价方案 / 适合人群 / FAQ）
- **JSON-LD 结构化数据**：WebSite + SoftwareApplication + FAQPage，搜索引擎富片段
- **RSS 订阅源**：`/rss.xml` 按收录时间输出最近 30 款产品
- **分类导览 + 标签筛选**：左侧边栏分类导航，36 个标签快速筛选
- **点赞投票**：Cookie 识别用户，一键点赞，SQLite 持久化
- **后台审核**：提交的产品通过 `/admin` 后台审核后上线
- **暗色模式**：一键切换明暗主题
- **真实 Favicon**：自动加载产品官网图标，加载失败降级为色块

## 🛠 技术栈

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **SQLite** (better-sqlite3)
- **Next.js Image Optimization**

## 🚀 快速开始

```bash
安装依赖
npm install

开发模式
npm run dev

生产构建
npm run build npm start


Plain Text


访问 http://localhost:3000

## 📁 项目结构
navhub/ ├── app/ │ ├── page.tsx # 首页（分类边栏 + 推荐产品） │ ├── product/[id]/ # 产品详情页（SEO 内容 + FAQ） │ ├── category/[slug]/ # 分类列表页 │ ├── tag/[slug]/ # 标签筛选页 │ ├── ranking/ # 榜单页 │ ├── submit/ # 提交产品 │ ├── admin/ # 后台审核 │ ├── rss.xml/ # RSS 订阅源 │ └── layout.tsx # 全局布局 + JSON-LD ├── components/ │ ├── ProductCard.tsx # 产品卡片 │ ├── ProductLogo.tsx # Favicon 加载 + 降级 │ ├── SearchBox.tsx # 站内搜索 │ └── ... ├── lib/ │ ├── data.ts # 分类 / 标签 / 产品数据 │ ├── seo-content.ts # 程序化 SEO 内容生成器 │ ├── store.ts # SQLite 持久化 │ └── db.ts # 数据库连接 └── tailwind.config.ts


Plain Text


## 📊 数据统计

| 维度 | 数量 |
|------|------|
| 产品 | 85+ |
| 分类 | 9 |
| 标签 | 36 |
| SEO 页面 | 85×（每个产品自动生成） |

## 📝 License

MIT
