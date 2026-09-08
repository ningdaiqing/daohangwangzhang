import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { ProductCard } from "@/components/ProductCard";
import {
  categories,
  getCategoryBySlug,
} from "@/lib/data";
import { listAllProducts, getUpvotedSet } from "@/lib/store";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return { title: "分类 · NavHub" };
  return { title: `${cat.name} · NavHub`, description: cat.desc };
}

export default async function CategoryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return notFound();

  const all = listAllProducts()
    .filter((p) => p.categoryId === cat.id)
    .sort((a, b) => b.upvotes - a.upvotes);

  const voterKey = (await cookies()).get("navhub_voter")?.value ?? "";
  const upvotedSet = getUpvotedSet(all.map((p) => p.id), voterKey);

  return (
    <div className="container-page py-10">
      <nav className="text-xs text-ink-500 dark:text-ink-400">
        <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-300">
          首页
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/categories" className="hover:text-brand-600 dark:hover:text-brand-300">
          分类
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-700 dark:text-ink-200">{cat.name}</span>
      </nav>

      <section
        className={`mt-4 rounded-3xl bg-gradient-to-br ${cat.gradient} p-8 text-white shadow-card sm:p-10`}
      >
        <div className="text-4xl">{cat.emoji}</div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{cat.name}</h1>
        <p className="mt-2 max-w-2xl text-white/85">{cat.desc}</p>
        <div className="mt-4 inline-flex items-center gap-3 text-sm text-white/90">
          <span className="rounded-full bg-white/15 px-3 py-1">
            共 {all.length} 款产品
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1">
            总点赞 {all.reduce((s, p) => s + p.upvotes, 0).toLocaleString()}
          </span>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">全部产品</h2>
          <span className="text-sm text-ink-500 dark:text-ink-400">按热度排序</span>
        </div>
        {all.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center text-ink-500 dark:border-ink-700 dark:bg-ink-800/40 dark:text-ink-400">
            该分类下还没有产品，欢迎{" "}
            <Link href="/submit" className="text-brand-600 hover:underline dark:text-brand-300">
              提交第一款
            </Link>
            。
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {all.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                showCategory={false}
                upvoted={upvotedSet.has(p.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
