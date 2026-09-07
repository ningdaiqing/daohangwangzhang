import { cookies } from "next/headers";
import Link from "next/link";
import { listSubmissions, countSubmissions } from "@/lib/store";
import { isAdminToken } from "@/lib/store";
import { categories } from "@/lib/data";
import { AdminLoginForm } from "./AdminLoginForm";
import { ReviewActions } from "./ReviewActions";

export const metadata = { title: "后台审核 · NavHub" };

export default function AdminPage() {
  const token = cookies().get("navhub_admin")?.value;
  const isAuthed = isAdminToken(token);

  if (!isAuthed) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-ink-100 bg-white p-8 shadow-card dark:border-ink-800 dark:bg-ink-800/40 sm:p-10">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
            🛡️ 后台审核
          </h1>
          <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
            请输入管理员口令以查看提交队列。开发环境默认口令写在源码里。
          </p>
          <div className="mt-6">
            <AdminLoginForm />
          </div>
          <p className="mt-6 text-xs text-ink-400 dark:text-ink-500">
            普通用户请回到
            <Link href="/" className="ml-1 text-brand-600 hover:underline dark:text-brand-300">
              首页
            </Link>
            。
          </p>
        </div>
      </div>
    );
  }

  const pending = listSubmissions({ status: "pending" });
  const approved = listSubmissions({ status: "approved" });
  const rejected = listSubmissions({ status: "rejected" });

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
            🛡️ 后台审核
          </h1>
          <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
            待审 {countSubmissions("pending")} · 已通过 {approved.length} · 已驳回 {rejected.length}
          </p>
        </div>
        <ReviewActions mode="logout" />
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">
          ⏳ 待审 · {pending.length}
        </h2>
        {pending.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center text-ink-500 dark:border-ink-700 dark:bg-ink-800/40 dark:text-ink-400">
            🎉 队列已清空。
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {pending.map((s) => {
              const cat = categories.find((c) => c.id === s.categoryId);
              return (
                <li
                  key={s.id}
                  className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card dark:border-ink-800 dark:bg-ink-800/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-ink-900 dark:text-ink-50">
                          {s.productName}
                        </h3>
                        {cat && (
                          <span className="chip">{cat.emoji} {cat.name}</span>
                        )}
                        <a
                          href={s.productUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-brand-600 hover:underline dark:text-brand-300"
                        >
                          访问 ↗
                        </a>
                      </div>
                      <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
                        {s.description}
                      </p>
                      <div className="mt-2 text-xs text-ink-500 dark:text-ink-400">
                        by {s.submitterName} ({s.submitterEmail}) ·{" "}
                        {new Date(s.submittedAt).toLocaleString("zh-CN")}
                      </div>
                    </div>
                    <ReviewActions mode="review" id={s.id} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">
          ✅ 已通过 · {approved.length}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {approved.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-sm dark:border-emerald-900/40 dark:bg-emerald-900/10"
            >
              <div className="font-semibold text-ink-900 dark:text-ink-50">{s.productName}</div>
              <div className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                by {s.submitterName}
              </div>
            </div>
          ))}
          {approved.length === 0 && (
            <p className="text-sm text-ink-500 dark:text-ink-400">尚无。</p>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">
          ❌ 已驳回 · {rejected.length}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rejected.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-sm dark:border-rose-900/40 dark:bg-rose-900/10"
            >
              <div className="font-semibold text-ink-900 dark:text-ink-50">{s.productName}</div>
              <div className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                by {s.submitterName}
              </div>
            </div>
          ))}
          {rejected.length === 0 && (
            <p className="text-sm text-ink-500 dark:text-ink-400">尚无。</p>
          )}
        </div>
      </section>
    </div>
  );
}
