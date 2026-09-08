import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { ProductCard } from "@/components/ProductCard";
import { tags, getTagBySlug } from "@/lib/data";
import { listAllProducts, getUpvotedSet } from "@/lib/store";

export const runtime = 'edge';

export function generateStaticParams() {
  return tags.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = getTagBySlug(slug);
  if (!tag) return { title: "标签 · NavHub" };
  return { title: `#${tag.name} · NavHub` };
}

export default async function TagDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = getTagBySlug(slug);
  if (!tag) return notFound();

  const list = listAllProducts()
    .filter((p) => p.tagIds.includes(tag.id))
    .sort((a, b) => b.upvotes - a.upvotes);

  const voterKey = (await cookies()).get("navhub_voter")?.value ?? "";
  const upvotedSet = getUpvotedSet(list.map((p) => p.id), voterKey);

  return (
    <div className="container-page py-10">
      <nav className="text-xs text-ink-500 dark:text-ink-400">
        <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-300">
          首页
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/tags" className="hover:text-brand-600 dark:hover:text-brand-300">
          标签
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-700 dark:text-ink-200">#{tag.name}</span>
      </nav>

      <section className="mt-4 rounded-3xl border border-ink-100 bg-white p-8 shadow-card dark:border-ink-800 dark:bg-ink-800/40 sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
          #{tag.name}
        </h1>
        <p className="mt-2 text-ink-600 dark:text-ink-300">
          共找到 {list.length} 款标记了该标签的产品
        </p>
      </section>

      {list.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center text-ink-500 dark:border-ink-700 dark:bg-ink-800/40 dark:text-ink-400">
          暂未有产品被标记此标签。
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} upvoted={upvotedSet.has(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
