"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Props {
  initial?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function SearchBox({ initial, placeholder = "搜索产品 / 标签 / 描述…", onChange }: Props) {
  const params = useSearchParams();
  const [value, setValue] = useState(initial ?? params?.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!onChange) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(value.trim()), 200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, onChange]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    const target = q ? `/?q=${encodeURIComponent(q)}` : "/";
    router.push(target);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
        🔍
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input pl-10 pr-24"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400 hover:text-ink-700 dark:hover:text-ink-100"
        >
          清除
        </button>
      )}
    </form>
  );
}
