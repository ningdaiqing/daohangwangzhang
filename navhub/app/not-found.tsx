import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="text-7xl">🧭</div>
      <h1 className="mt-4 text-3xl font-bold text-ink-900 dark:text-ink-50">页面不存在</h1>
      <p className="mt-2 text-ink-600 dark:text-ink-300">
        你访问的内容可能已被下架或拼写有误。
      </p>
      <Link href="/" className="btn-primary mt-6">
        回到首页
      </Link>
    </div>
  );
}
