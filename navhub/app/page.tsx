import Link from "next/link";
import { cookies } from "next/headers";
import { SearchBox } from "@/components/SearchBox";
import { ProductCard } from "@/components/ProductCard";
import {
  categories,
  tags,
  getProductsByCategory,
} from "@/lib/data";
import { listAllProducts, getUpvotedSet } from "@/lib/store";

export default function HomePage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = searchParams?.q?.toLowerCase().trim() ?? "";
  const all = listAllProducts().sort((a, b) => b.upvotes - a.upvotes);
  const featured = all.filter((p) => p.featured);

  const filtered = q
    ? all.filter((p) => {
        const haystack =
          `${p.name} ${p.tagline} ${p.description}`.toLowerCase();
        const matchedTags = p.tagIds
          .map((id) => tags.find((t) => t.id === id)?.name ?? "")
          .join(" ");
        return haystack.includes(q) || matchedTags.toLowerCase().includes(q);
      })
    : all;

  const trending = [...featured, ...all.filter((p) => !p.featured)].slice(0, 6);
  const newArrivals = [...all]
    .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt))
    .slice(0, 6);

  const voterKey = cookies().get("navhub_voter")?.value ?? "";
  const upvotedSet = getUpvotedSet(all.map((p) => p.id), voterKey);

  return (
    <div className="container-page py-10">
      {/* Hero */}
      <section className="rounded-3xl border border-ink-100 bg-gradient-to-br from-brand-50 via-white to-white px-6 py-12 dark:border-ink-800 dark:from-brand-900/20 dark:via-ink-900 dark:to-ink-900 sm:px-10 sm:py-16">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            🧭 v1 · 精选 AI 产品导航
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50 sm:text-4xl lg:text-5xl">
            发现真正好用的 <span className="text-brand-600 dark:text-brand-300">AI 工具</span>
          </h1>
          <p className="mt-4 text-base text-ink-600 dark:text-ink-300 sm:text-lg">
            覆盖对话、编程、图像、视频、办公、音频、营销等九大类；按分类、标签、热度快速找到适合你的产品。
          </p>
          <div className="mt-6 max-w-xl">
            <SearchBox />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-ink-500 dark:text-ink-400">
            <span>热门：</span>
            <Link href="/tag/deepseek" className="hover:text-brand-600 dark:hover:text-brand-300">
              #DeepSeek
            </Link>
            <span>·</span>
            <Link href="/tag/coding" className="hover:text-brand-600 dark:hover:text-brand-300">
              #AI编程
            </Link>
            <span>·</span>
            <Link href="/tag/midjourney" className="hover:text-brand-600 dark:hover:text-brand-300">
              #Midjourney
            </Link>
            <span>·</span>
            <Link href="/category/agent" className="hover:text-brand-600 dark:hover:text-brand-300">
              #AI Agent
            </Link>
          </div>
        </div>
      </section>

      {/* 主体：左侧分类边栏 + 右侧内容 */}
      <div className="mt-12 flex gap-6">
        {/* 左侧分类边栏 */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20 space-y-1.5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-900 dark:text-ink-50">分类导览</h2>
              <Link href="/categories" className="text-xs text-brand-600 hover:underline dark:text-brand-300">
                全部 →
              </Link>
            </div>
            {categories.map((cat) => {
              const count = getProductsByCategory(cat.id).length;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group flex items-center gap-2.5 rounded-xl border border-ink-100 bg-white px-3 py-2.5 transition hover:border-brand-300 hover:bg-brand-50 dark:border-ink-800 dark:bg-ink-800/40 dark:hover:border-brand-700 dark:hover:bg-brand-900/20"
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink-900 dark:text-ink-50">
                      {cat.name}
                    </div>
                    <div className="truncate text-xs text-ink-500 dark:text-ink-400">
                      {cat.desc}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-ink-100 px-1.5 py-0.5 text-xs text-ink-600 dark:bg-ink-700 dark:text-ink-300">
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* 右侧主内容 */}
        <div className="min-w-0 flex-1">
          {/* 搜索结果 */}
          {q && (
            <section>
              <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">
                搜索 "{searchParams?.q}" · 命中 {filtered.length} 条
              </h2>
              {filtered.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center text-ink-500 dark:border-ink-700 dark:bg-ink-800/40 dark:text-ink-400">
                  未找到相关产品，试试别的关键词？
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      upvoted={upvotedSet.has(p.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 编辑推荐 */}
          {!q && (
            <section>
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">🌟 编辑推荐</h2>
                <span className="text-sm text-ink-500 dark:text-ink-400">{featured.length} 款</span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {trending.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    upvoted={upvotedSet.has(p.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 全部产品 / 最新 */}
          {!q && (
            <section className="mt-12">
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">🆕 最新收录</h2>
                <Link href="/ranking" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
                  全部榜单 →
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {newArrivals.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    upvoted={upvotedSet.has(p.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 标签云 */}
          {!q && (
            <section className="mt-12">
              <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">🏷️ 热门标签</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Link key={t.id} href={`/tag/${t.slug}`} className="chip">
                    #{t.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 提交 CTA */}
          <section className="mt-16 rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-8 dark:border-brand-900/40 dark:from-brand-900/20 dark:to-ink-900 sm:p-10">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-xl font-semibold text-ink-900 dark:text-ink-50">
                  发现了好产品？推荐给我们 ✨
                </h3>
                <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                  提交审核通过后将展示在首页推荐位。
                </p>
              </div>
              <Link href="/submit" className="btn-primary">
                立即提交 →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
