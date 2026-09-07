"use client";

import { useState, useTransition } from "react";
import type { Category, Tag } from "@/lib/data";
import { submitProduct } from "../actions";

interface Props {
  categories: Category[];
  tags: Tag[];
}

export function SubmitForm({ categories, tags }: Props) {
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(form: FormData) {
    setErrors([]);
    setSuccess(null);
    startTransition(async () => {
      const res = await submitProduct(form);
      if (res.ok) {
        setSuccess("提交成功！我们会尽快审核。");
        (document.getElementById("submit-form") as HTMLFormElement)?.reset();
      } else if (res.errors) {
        setErrors(res.errors);
      }
    });
  }

  return (
    <form id="submit-form" action={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="产品名称" required>
          <input name="productName" required className="input" placeholder="例如 Cursor" />
        </Field>
        <Field label="产品网址" required>
          <input
            name="productUrl"
            type="url"
            required
            className="input"
            placeholder="https://…"
          />
        </Field>
      </div>

      <Field label="所属分类" required>
        <select name="categoryId" required className="input">
          <option value="">请选择…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="标签（可多选）">
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <label
              key={t.id}
              className="cursor-pointer select-none rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 transition has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700 dark:border-ink-700 dark:bg-ink-900/40 dark:text-ink-300 dark:has-[:checked]:border-brand-400 dark:has-[:checked]:bg-brand-900/40 dark:has-[:checked]:text-brand-200"
            >
              <input type="checkbox" name="tagIds" value={t.id} className="sr-only" />
              #{t.name}
            </label>
          ))}
        </div>
      </Field>

      <Field label="产品介绍" required>
        <textarea
          name="description"
          required
          rows={4}
          minLength={10}
          className="input resize-y"
          placeholder="简要描述该产品的核心功能、特色场景、目标用户（10 字以上）"
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="提交人姓名" required>
          <input name="submitterName" required className="input" placeholder="你的名字/昵称" />
        </Field>
        <Field label="联系邮箱" required>
          <input
            name="submitterEmail"
            type="email"
            required
            className="input"
            placeholder="you@example.com"
          />
        </Field>
      </div>

      {errors.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300">
          <div className="font-semibold">提交失败，请检查：</div>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
          {success}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="reset" className="btn-ghost">
          清空
        </button>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "提交中…" : "提交审核"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}
