import Link from "next/link";
import { cookies } from "next/headers";
import { ProductCard } from "@/components/ProductCard";
import { categories } from "@/lib/data";
import { listAllProducts, getUpvotedSet } from "@/lib/store";

export const metadata = { title: "产品榜单 · NavHub" };

export default function RankingPage() {
  const all = listAllProducts().sort((a, b) => b.upvotes - a.upvotes);
  const featured = all.filter((p) => p.featured);
  const top10 = all.slice(0, 10);
  const total = all.length;

  const voterKey = cookies().get("navhub_voter")?.value ?? "";
  const upvotedSet = getUpvotedSet(all.map((p) => p.id), voterKey);

  return (
    <div className="container-page py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
          🔥 产品榜单
        </h1>
        <p className="mt-2 text-ink-600 dark:text-ink-300">
          按用户点赞数排序，实时反映大家最喜欢的 AI 工具。共收录 {total} 款。
        </p>
      </div>

      {/* Top 10 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">🏆 TOP 10</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top10.map((p, idx) => (
            <div key={p.id} className="relative">
              <span
                className={`absolute -top-2 -left-2 z-10 grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white shadow-card ${
                  idx === 0
                    ? "bg-amber-500"
                    : idx === 1
                    ? "bg-zinc-400"
                    : idx === 2
                    ? "bg-orange-400"
                    : "bg-ink-600"
                }`}
              >
                {idx + 1}
              </span>
              <ProductCard product={p} upvoted={upvotedSet.has(p.id)} />
            </div>
          ))}
        </div>
      </section>

      {/* 编辑精选 */}
      {featured.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">🌟 编辑精选</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} upvoted={upvotedSet.has(p.id)} />
            ))}
          </div>
        </section>
      )}

      {/* 按分类 */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">📚 按分类浏览</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="chip gap-2 px-3 py-1.5 text-sm"
            >
              {c.emoji} {c.name} →
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
