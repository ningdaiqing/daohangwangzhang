"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  url: string;
  name: string;
  color: string;
  initial: string;
  size?: "sm" | "md" | "lg";
}

/**
 * 优先加载目标网站的 favicon；加载失败或无 URL 时降级到色块 + 首字母。
 * favicon 来源：Google S2 Favicon API，无需鉴权、覆盖绝大多数站点。
 */
export function ProductLogo({ url, name, color, initial, size = "md" }: Props) {
  const [errored, setErrored] = useState(false);

  const sizeMap = {
    sm: { box: "h-9 w-9 rounded-lg text-sm", px: 36 },
    md: { box: "h-11 w-11 rounded-xl text-base", px: 44 },
    lg: { box: "h-16 w-16 rounded-2xl text-2xl", px: 64 },
  } as const;

  const dim = sizeMap[size];

  const domain = url ? safeDomain(url) : "";
  // 优先使用 favicon.im（CDN 加速，国内快），失败降级到色块
  const faviconSrc = domain
    ? `https://favicon.im/${encodeURIComponent(domain)}?larger=true`
    : "";

  if (!faviconSrc || errored) {
    return (
      <div
        className={`grid shrink-0 place-items-center font-bold text-white shadow-card ${dim.box}`}
        style={{ background: color }}
        title={name}
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl bg-white p-1 shadow-card ring-1 ring-ink-100 dark:bg-ink-800 dark:ring-ink-700 ${dim.box}`}
    >
      <Image
        src={faviconSrc}
        alt={`${name} logo`}
        fill
        sizes={`${dim.px}px`}
        className="object-contain p-0.5"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

function safeDomain(raw: string): string {
  try {
    const u = new URL(raw);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
