"use client";

import { useState, useTransition } from "react";
import { adminLogin } from "@/app/actions";

export function AdminLoginForm() {
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(form: FormData) {
    setErr(null);
    startTransition(async () => {
      const res = await adminLogin(form);
      if (res.ok) {
        window.location.reload();
      } else if (res.error) {
        setErr(res.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <input
        name="token"
        type="password"
        autoFocus
        required
        placeholder="管理员口令"
        className="input"
      />
      {err && (
        <p className="text-sm text-rose-600 dark:text-rose-300">{err}</p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "验证中…" : "登录"}
      </button>
    </form>
  );
}
