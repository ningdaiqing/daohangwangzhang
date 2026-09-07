import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-100 py-8 text-sm text-ink-500 dark:border-ink-800 dark:text-ink-400">
      <div className="container-page flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>© 2026 NavHub · 精选 AI 产品导航</div>
        <div className="flex gap-4">
          <Link href="/admin" className="hover:text-brand-600 dark:hover:text-brand-300">
            后台审核
          </Link>
          <span className="text-ink-300 dark:text-ink-600">·</span>
          <span>SQLite 已落库 · 数据持久化已开启</span>
        </div>
      </div>
    </footer>
  );
}
