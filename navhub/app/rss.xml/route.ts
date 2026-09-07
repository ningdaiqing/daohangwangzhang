import { NextResponse } from "next/server";
import { listAllProducts } from "@/lib/store";
import { getCategoryById, getTagById } from "@/lib/data";

export const dynamic = "force-dynamic";

const SITE_URL = "https://navhub.example.com";

export async function GET() {
  const products = listAllProducts()
    .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt))
    .slice(0, 30);

  const now = new Date().toUTCString();

  const itemsXml = products
    .map((p) => {
      const category = getCategoryById(p.categoryId);
      const tagNames = p.tagIds
        .map((id) => getTagById(id)?.name)
        .filter(Boolean)
        .join(", ");
      const domain = (() => {
        try {
          return new URL(p.url).hostname.replace(/^www\./, "");
        } catch {
          return "";
        }
      })();
      const logo = domain
        ? `<img src="https://favicon.im/${encodeURIComponent(domain)}?larger=true" alt="${p.name}" />`
        : "";
      const link = `${SITE_URL}/product/${p.id}`;
      return `    <item>
      <title><![CDATA[${p.name}]]></title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${new Date(p.submittedAt).toUTCString()}</pubDate>
      <category>${category ? escapeXml(category.name) : ""}</category>
      <description><![CDATA[${logo}<p>${p.tagline}</p><p>${p.description}</p>${tagNames ? `<p>标签：${tagNames}</p>` : ""}<p><a href="${p.url}">访问官网</a></p>]]></description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NavHub · AI 产品导航</title>
    <link>${SITE_URL}</link>
    <description>精选高质量 AI 产品，覆盖对话、编程、图像、视频、办公、Agent 六大类。</description>
    <language>zh-CN</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
