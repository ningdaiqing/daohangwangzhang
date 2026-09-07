"use client";

import { useTransition, useState, useOptimistic } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/data";
import { getCategoryById, getTagById } from "@/lib/data";
import { toggleUpvoteAction } from "@/app/actions";
import { ProductLogo } from "./ProductLogo";

interface Props {
  product: Product;
  showCategory?: boolean;
  upvoted?: boolean;
}

export function ProductCard({ product, showCategory = true, upvoted = false }: Props) {
  const category = getCategoryById(product.categoryId);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [optimistic, setOptimistic] = useOptimistic(
    { upvoted, count: product.upvotes },
    (state, next: { upvoted: boolean }) => ({
      upvoted: next.upvoted,
      count: state.count + (next.upvoted ? 1 : -1),
    })
  );
  const [pending, setPending] = useState(false);

  function onUpvote() {
    if (pending) return;
    setPending(true);
    setOptimistic({ upvoted: !optimistic.upvoted });
    startTransition(async () => {
      const res = await toggleUpvoteAction(product.id);
      setPending(false);
      if (res.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="card group flex h-full flex-col">
      <Link href={`/product/${product.id}`} className="flex items-start gap-3">
        <ProductLogo
          url={product.url}
          name={product.name}
          color={product.logoColor}
          initial={product.logoInitial}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-ink-900 group-hover:text-brand-600 dark:text-ink-50 dark:group-hover:text-brand-300">
              {product.name}
            </h3>
            {product.featured && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                推荐
              </span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">
            {product.tagline}
          </p>
        </div>
      </Link>

      <Link href={`/product/${product.id}`} className="mt-3 block">
        <p className="line-clamp-2 text-sm text-ink-600 dark:text-ink-300">
          {product.description}
        </p>
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {showCategory && category && (
          <Link href={`/category/${category.slug}`} className="chip">
            {category.emoji} {category.name}
          </Link>
        )}
        {product.tagIds.slice(0, 3).map((tagId) => {
          const tag = getTagById(tagId);
          if (!tag) return null;
          return (
            <Link key={tagId} href={`/tag/${tag.slug}`} className="chip">
              #{tag.name}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-ink-500 dark:text-ink-400">
        <PricingBadge pricing={product.pricing} />
        <button
          onClick={onUpvote}
          aria-pressed={optimistic.upvoted}
          aria-label={optimistic.upvoted ? "取消点赞" : "点赞"}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 transition ${
            optimistic.upvoted
              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
              : "hover:bg-ink-100 dark:hover:bg-ink-700"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={optimistic.upvoted ? "currentColor" : "none"}>
            <path
              d="M12 4l-7 7h4v8h6v-8h4l-7-7z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="text-orange-500"
            />
          </svg>
          {optimistic.count.toLocaleString()}
        </button>
      </div>
    </div>
  );
}

function PricingBadge({ pricing }: { pricing: Product["pricing"] }) {
  const map = {
    free: { label: "免费", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
    freemium: { label: "免费增值", cls: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" },
    paid: { label: "付费", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" },
  } as const;
  const cfg = map[pricing];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
