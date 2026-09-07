import { categories, tags } from "@/lib/data";
import { listSubmissions, countSubmissions } from "@/lib/store";
import { SubmitForm } from "./SubmitForm";

export const metadata = { title: "提交 AI 产品 · NavHub" };

export default function SubmitPage() {
  const recent = listSubmissions({ status: "pending" });
  const pendingCount = countSubmissions("pending");
  return (
    <div className="container-page py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
            ✍️ 提交 AI 产品
          </h1>
          <p className="mt-2 text-ink-600 dark:text-ink-300">
            填写下面的表单，审核通过后会展示在首页推荐位。提交即表示同意我们对其进行整理与编辑。
          </p>

          <div className="mt-6 rounded-3xl border border-ink-100 bg-white p-6 shadow-card dark:border-ink-800 dark:bg-ink-800/40 sm:p-8">
            <SubmitForm categories={categories} tags={tags} />
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card dark:border-ink-800 dark:bg-ink-800/40">
            <h3 className="text-base font-semibold text-ink-900 dark:text-ink-50">
              📋 收录标准
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-600 dark:text-ink-300">
              <li>· 必须是 AI 驱动的产品或服务</li>
              <li>· 产品需可公开访问，且有可用的官方网站</li>
              <li>· 描述清晰、不夸大，提供实用价值</li>
              <li>· 禁止黄赌毒、虚假宣传、爬虫类产品</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card dark:border-ink-800 dark:bg-ink-800/40">
            <h3 className="text-base font-semibold text-ink-900 dark:text-ink-50">
              📬 待审核 · {pendingCount} 条
            </h3>
            {recent.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
                暂无待审核记录。成为第一个吧！
              </p>
            ) : (
              <ul className="mt-3 space-y-3 text-sm">
                {recent.slice(0, 5).map((s) => (
                  <li key={s.id} className="rounded-lg bg-ink-50 p-3 dark:bg-ink-900/40">
                    <div className="font-semibold text-ink-900 dark:text-ink-50">
                      {s.productName}
                    </div>
                    <div className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                      by {s.submitterName} ·{" "}
                      {new Date(s.submittedAt).toLocaleString("zh-CN")}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
