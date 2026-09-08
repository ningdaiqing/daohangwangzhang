"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  createSubmission,
  upvoteProduct,
  approveSubmission,
  rejectSubmission,
} from "@/lib/store";
import { getCategoryById } from "@/lib/data";

async function getVoterKey(): Promise<string> {
  const c = await cookies();
  let v = c.get("navhub_voter")?.value;
  if (!v) {
    v = `anon-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
    c.set("navhub_voter", v, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return v;
}

async function getAdminToken(): Promise<string | undefined> {
  return (await cookies()).get("navhub_admin")?.value;
}

// ===== 提交 =====
export async function submitProduct(form: FormData): Promise<{
  ok: boolean;
  errors?: string[];
}> {
  const productName = String(form.get("productName") ?? "").trim();
  const productUrl = String(form.get("productUrl") ?? "").trim();
  const categoryId = String(form.get("categoryId") ?? "");
  const tagIds = form.getAll("tagIds").map((v) => String(v));
  const description = String(form.get("description") ?? "").trim();
  const submitterName = String(form.get("submitterName") ?? "").trim();
  const submitterEmail = String(form.get("submitterEmail") ?? "").trim();

  const errs: string[] = [];
  if (!productName || productName.length < 2) errs.push("产品名称至少 2 个字");
  if (!/^https?:\/\/.+/i.test(productUrl)) errs.push("产品网址必须以 http(s):// 开头");
  if (!categoryId || !getCategoryById(categoryId)) errs.push("请选择合法分类");
  if (!description || description.length < 10) errs.push("产品介绍至少 10 个字");
  if (!submitterName) errs.push("请填写提交人姓名");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(submitterEmail)) errs.push("邮箱格式不正确");
  if (errs.length) return { ok: false, errors: errs };

  const r = createSubmission({
    productName,
    productUrl,
    categoryId,
    tagIds,
    description,
    submitterName,
    submitterEmail,
  });
  if (!r.ok) {
    return { ok: false, errors: [r.error ?? "提交失败，请稍后再试"] };
  }
  // 触发 /submit 页面 SSR 重新读取最近提交
  revalidatePath("/submit");
  revalidatePath("/admin");
  return { ok: true };
}

// ===== 点赞 =====
export async function toggleUpvoteAction(productId: string): Promise<{
  ok: boolean;
  upvoted?: boolean;
  total?: number;
}> {
  if (!productId) return { ok: false };
  const voterKey = await getVoterKey();
  const r = upvoteProduct(productId, voterKey);
  revalidatePath("/");
  revalidatePath(`/product/${productId}`);
  revalidatePath("/ranking");
  return { ok: r.ok, upvoted: r.upvoted, total: r.total };
}

// ===== 审核 =====
async function isAdmin(): Promise<boolean> {
  const v = await getAdminToken();
  return v === "navhub-admin-2026";
}

export async function reviewAction(form: FormData): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdmin())) return { ok: false, error: "无权限" };
  const id = Number(form.get("id"));
  const action = String(form.get("action") ?? "");
  const note = String(form.get("note") ?? "").trim() || undefined;
  if (!id) return { ok: false, error: "无效提交 id" };

  const r =
    action === "approve"
      ? approveSubmission(id, note)
      : action === "reject"
      ? rejectSubmission(id, note)
      : { ok: false, error: "未知操作" };

  revalidatePath("/admin");
  revalidatePath("/");
  return r;
}

export async function adminLogin(form: FormData): Promise<{ ok: boolean; error?: string }> {
  const token = String(form.get("token") ?? "");
  if (token !== "navhub-admin-2026") {
    return { ok: false, error: "口令错误" };
  }
  (await cookies()).set("navhub_admin", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminLogout(): Promise<{ ok: boolean }> {
  (await cookies()).delete("navhub_admin");
  revalidatePath("/admin");
  return { ok: true };
}
