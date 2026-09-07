import Link from "next/link";
import type { Category } from "@/lib/data";

interface Props {
  category: Category;
  count: number;
}

export function CategoryTile({ category, count }: Props) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.gradient} p-5 text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-cardHover`}
    >
      <div className="text-3xl">{category.emoji}</div>
      <div className="mt-3 text-lg font-semibold">{category.name}</div>
      <div className="mt-1 text-sm text-white/80">{category.desc}</div>
      <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs backdrop-blur">
        {count} 款产品 →
      </div>
    </Link>
  );
}
