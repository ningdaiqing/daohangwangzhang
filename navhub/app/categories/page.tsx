import Link from "next/link";
import { CategoryTile } from "@/components/CategoryTile";
import { categories } from "@/lib/data";
import { listAllProducts } from "@/lib/store";

export const metadata = { title: "全部分类 · NavHub" };

export default function CategoriesPage() {
  const all = listAllProducts();
  const total = all.length;
  return (
    <div className="container-page py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
          全部分类
        </h1>
        <p className="mt-2 text-ink-600 dark:text-ink-300">
          共 {categories.length} 个分类 · 收录 {total} 款 AI 产品
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <CategoryTile
            key={cat.id}
            category={cat}
            count={all.filter((p) => p.categoryId === cat.id).length}
          />
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-500 dark:border-ink-700 dark:text-ink-400">
        提示：
        <Link href="/submit" className="ml-1 text-brand-600 hover:underline dark:text-brand-300">
          提交新的 AI 产品 →
        </Link>
        通过审核后即可出现在对应分类下。
      </div>
    </div>
  );
}
