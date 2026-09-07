import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  getCategoryById,
  getTagById,
} from "@/lib/data";
import { listAllProducts, getUpvotedSet } from "@/lib/store";
import { generateSeoContent } from "@/lib/seo-content";
import { UpvoteButton } from "./UpvoteButton";
import { ProductLogo } from "@/components/ProductLogo";

// 不再用 generateStaticParams；产品总数 = mock 20 + 动态审核通过 N，动态渲染更顺
export const dynamicParams = true;

function findProduct(id: string) {
  return listAllProducts().find((p) => p.id === id);
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const p = findProduct(params.id);
  if (!p) return { title: "产品 · NavHub" };
  const category = getCategoryById(p.categoryId);
  const title = `${p.name}是什么？${p.tagline} | ${category?.name ?? "AI 工具"} · NavHub`;
  const description = `${p.name}是${category?.name ?? "AI 工具"}之一。${p.tagline}。${p.description.slice(0, 80)} 查看功能介绍、使用方法、定价方案和替代品。`;
  return {
    title,
    description,
    openGraph: { title, description, url: `/product/${p.id}` },
  };
}

function buildProductJsonLd(p: ReturnType<typeof findProduct>) {
  if (!p) return null;
  const category = getCategoryById(p.categoryId);
  const tags = p.tagIds.map(getTagById).filter(Boolean) as NonNullable<ReturnType<typeof getTagById>>[];
  const seo = generateSeoContent(p, category, tags);
  const domain = (() => {
    try {
      return new URL(p.url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: p.name,
    description: p.description,
    url: p.url,
    applicationCategory: "AIProduct",
    offers: {
      "@type": "Offer",
      price: p.pricing === "free" ? "0" : p.pricing === "freemium" ? "0" : "",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Math.min(5, 3 + (p.upvotes % 20) / 10).toFixed(1),
      reviewCount: p.upvotes,
    },
    image: domain
      ? `https://favicon.im/${encodeURIComponent(domain)}?larger=true`
      : undefined,
  };
}

function buildFaqJsonLd(p: ReturnType<typeof findProduct>) {
  if (!p) return null;
  const category = getCategoryById(p.categoryId);
  const tags = p.tagIds.map(getTagById).filter(Boolean) as NonNullable<ReturnType<typeof getTagById>>[];
  const seo = generateSeoContent(p, category, tags);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seo.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export default function ProductDetail({ params }: { params: { id: string } }) {
  const p = findProduct(params.id);
  if (!p) return notFound();

  const jsonLd = buildProductJsonLd(p);
  const faqJsonLd = buildFaqJsonLd(p);

  const voterKey = cookies().get("navhub_voter")?.value ?? "";
  const upvoted = voterKey
    ? getUpvotedSet([p.id], voterKey).has(p.id)
    : false;

  const category = getCategoryById(p.categoryId);
  const tags = p.tagIds.map(getTagById).filter(Boolean) as NonNullable<ReturnType<typeof getTagById>>[];
  const seoContent = generateSeoContent(p, category, tags);

  const related = listAllProducts()
    .filter((x) => x.categoryId === p.categoryId && x.id !== p.id)
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 3);

  return (
    <div className="container-page py-10">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <nav className="text-xs text-ink-500 dark:text-ink-400">
        <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-300">
          首页
        </Link>
        <span className="mx-1.5">/</span>
        {category && (
          <>
            <Link
              href={`/category/${category.slug}`}
              className="hover:text-brand-600 dark:hover:text-brand-300"
            >
              {category.name}
            </Link>
            <span className="mx-1.5">/</span>
          </>
        )}
        <span className="text-ink-700 dark:text-ink-200">{p.name}</span>
      </nav>

      <section className="mt-4 rounded-3xl border border-ink-100 bg-white p-6 shadow-card dark:border-ink-800 dark:bg-ink-800/40 sm:p-10">
        <div className="flex flex-wrap items-start gap-5">
          <ProductLogo
            url={p.url}
            name={p.name}
            color={p.logoColor}
            initial={p.logoInitial}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
                {p.name}
              </h1>
              {p.featured && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  推荐
                </span>
              )}
              <PricingTag pricing={p.pricing} />
            </div>
            <p className="mt-2 text-lg text-ink-600 dark:text-ink-300">{p.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {category && (
                <Link href={`/category/${category.slug}`} className="chip">
                  {category.emoji} {category.name}
                </Link>
              )}
              {p.tagIds.map((tagId) => {
                const tag = getTagById(tagId);
                if (!tag) return null;
                return (
                  <Link key={tagId} href={`/tag/${tag.slug}`} className="chip">
                    #{tag.name}
                  </Link>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                访问官网 ↗
              </a>
              <UpvoteButton
                productId={p.id}
                initialCount={p.upvotes}
                initialUpvoted={upvoted}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 border-t border-ink-100 pt-8 dark:border-ink-800 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-50">产品介绍</h2>
            <p className="mt-3 text-ink-600 dark:text-ink-300">{p.description}</p>
          </div>
          <aside className="rounded-2xl bg-ink-50 p-5 dark:bg-ink-900/40">
            <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-50">信息</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500 dark:text-ink-400">分类</dt>
                <dd>
                  {category && (
                    <Link href={`/category/${category.slug}`} className="text-brand-600 hover:underline dark:text-brand-300">
                      {category.name}
                    </Link>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500 dark:text-ink-400">付费方式</dt>
                <dd className="text-ink-700 dark:text-ink-200">
                  {p.pricing === "free" ? "免费" : p.pricing === "freemium" ? "免费增值" : "付费"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500 dark:text-ink-400">提交人</dt>
                <dd className="text-ink-700 dark:text-ink-200">{p.submittedBy ?? "匿名"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500 dark:text-ink-400">收录日期</dt>
                <dd className="text-ink-700 dark:text-ink-200">
                  {new Date(p.submittedAt).toLocaleDateString("zh-CN")}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {/* SEO 结构化内容 */}
      <section className="mt-10 space-y-10">
        {seoContent.sections.map((section, idx) => (
          <div key={idx} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card dark:border-ink-800 dark:bg-ink-800/40 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
              {section.heading}
            </h2>
            <div className="mt-4 space-y-3">
              {section.paragraphs.map((para, i) => (
                <p key={i} className="leading-relaxed text-ink-600 dark:text-ink-300">
                  {para}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 space-y-2">
                  {section.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-ink-600 dark:text-ink-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}

        {/* FAQ */}
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card dark:border-ink-800 dark:bg-ink-800/40 sm:p-8">
          <h2 className="text-xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
            {p.name} 常见问题（FAQ）
          </h2>
          <div className="mt-4 divide-y divide-ink-100 dark:divide-ink-700">
            {seoContent.faqs.map((faq, idx) => (
              <details key={idx} className="group py-3">
                <summary className="flex cursor-pointer items-center justify-between font-medium text-ink-900 dark:text-ink-50">
                  {faq.question}
                  <span className="ml-2 shrink-0 text-ink-400 transition group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-2 leading-relaxed text-ink-600 dark:text-ink-300">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 相关推荐 */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">同类推荐</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} href={`/product/${r.id}`} className="card">
                <div className="flex items-start gap-3">
                  <ProductLogo
                    url={r.url}
                    name={r.name}
                    color={r.logoColor}
                    initial={r.logoInitial}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{r.name}</h3>
                    <p className="line-clamp-2 text-sm text-ink-500 dark:text-ink-400">
                      {r.tagline}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PricingTag({ pricing }: { pricing: "free" | "freemium" | "paid" }) {
  const map = {
    free: { label: "免费", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
    freemium: { label: "免费增值", cls: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" },
    paid: { label: "付费", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" },
  } as const;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[pricing].cls}`}>
      {map[pricing].label}
    </span>
  );
}
