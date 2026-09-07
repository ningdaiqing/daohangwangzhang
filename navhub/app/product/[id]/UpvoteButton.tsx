"use client";

import { useTransition, useState, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import { toggleUpvoteAction } from "@/app/actions";

interface Props {
  productId: string;
  initialCount: number;
  initialUpvoted: boolean;
}

export function UpvoteButton({ productId, initialCount, initialUpvoted }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState(false);

  const [opt, setOpt] = useOptimistic(
    { upvoted: initialUpvoted, count: initialCount },
    (state, next: { upvoted: boolean }) => ({
      upvoted: next.upvoted,
      count: state.count + (next.upvoted ? 1 : -1),
    })
  );

  function onClick() {
    if (pending) return;
    setPending(true);
    setOpt({ upvoted: !opt.upvoted });
    startTransition(async () => {
      const res = await toggleUpvoteAction(productId);
      setPending(false);
      if (res.ok) router.refresh();
    });
  }

  return (
    <button
      onClick={onClick}
      aria-pressed={opt.upvoted}
      aria-label={opt.upvoted ? "取消点赞" : "点赞"}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
        opt.upvoted
          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
          : "bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700"
      }`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={opt.upvoted ? "currentColor" : "none"}
        className={opt.upvoted ? "" : "text-orange-500"}
      >
        <path
          d="M12 4l-7 7h4v8h6v-8h4l-7-7z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="text-orange-500"
        />
      </svg>
      <span className="font-semibold">{opt.count.toLocaleString()}</span> 点赞
    </button>
  );
}
