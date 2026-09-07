"use client";

import { useTransition } from "react";
import { reviewAction, adminLogout } from "@/app/actions";

export function ReviewActions(props:
  | { mode: "review"; id: string }
  | { mode: "logout" }
) {
  const [pending, startTransition] = useTransition();

  if (props.mode === "logout") {
    return (
      <button
        onClick={() =>
          startTransition(async () => {
            await adminLogout();
            window.location.reload();
          })
        }
        disabled={pending}
        className="btn-ghost"
      >
        退出登录
      </button>
    );
  }

  function review(id: string, action: "approve" | "reject") {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("action", action);
    startTransition(async () => {
      await reviewAction(fd);
      // Server action revalidatePath 后自然刷新
    });
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => review(props.id, "approve")}
        disabled={pending}
        className="rounded-xl bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white shadow-card transition hover:bg-emerald-600 disabled:opacity-60"
      >
        ✓ 通过
      </button>
      <button
        onClick={() => review(props.id, "reject")}
        disabled={pending}
        className="rounded-xl bg-rose-500 px-3 py-1.5 text-sm font-medium text-white shadow-card transition hover:bg-rose-600 disabled:opacity-60"
      >
        ✗ 驳回
      </button>
    </div>
  );
}
