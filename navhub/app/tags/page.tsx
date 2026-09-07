import Link from "next/link";
import { tags } from "@/lib/data";
import { listAllProducts } from "@/lib/store";

export const metadata = { title: "标签 · NavHub" };

export default function TagsPage() {
  const all = listAllProducts();
  const stats = tags.map((t) => ({
    tag: t,
    count: all.filter((p) => p.tagIds.includes(t.id)).length,
  }));
  const valid = stats.filter((s) => s.count > 0);

  return (
    <div className="container-page py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
          全部标签
        </h1>
        <p className="mt-2 text-ink-600 dark:text-ink-300">
          按标签快速筛选产品，可点击进入查看对应产品列表。
        </p>
      </div>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-ink-700 dark:text-ink-200">
          🟢 已使用 · {valid.length}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {valid.map(({ tag, count }) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="chip gap-2 px-3 py-1 text-sm"
            >
              <span>#{tag.name}</span>
              <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                {count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-ink-700 dark:text-ink-200">
          ⚪ 其他标签 · {stats.length - valid.length}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {stats
            .filter((s) => s.count === 0)
            .map(({ tag }) => (
              <span key={tag.id} className="chip opacity-60">
                #{tag.name}
              </span>
            ))}
        </div>
      </section>
    </div>
  );
}
