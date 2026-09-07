import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeScript } from "@/components/ThemeScript";

export const metadata: Metadata = {
  title: "NavHub · AI 产品导航",
  description: "精选高质量 AI 产品，覆盖对话、编程、图像、视频、办公、Agent 六大类。",
  keywords: ["AI 产品", "AI 工具", "AI 导航", "AI 产品导航", "NavHub"],
  metadataBase: new URL("https://navhub.example.com"),
  openGraph: {
    title: "NavHub · AI 产品导航",
    description: "精选高质量 AI 产品，覆盖对话、编程、图像、视频、办公、Agent 六大类。",
    type: "website",
  },
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/rss.xml", title: "NavHub RSS" }],
    },
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NavHub",
  url: "https://navhub.example.com",
  description: "精选高质量 AI 产品导航站",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://navhub.example.com/?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen font-sans">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
