"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authErrorMessage } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (password !== confirmation) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(authErrorMessage(signUpError));
      setPending(false);
      return;
    }

    // No session means email confirmation is enabled on the project.
    if (!data.session) {
      setNotice("أُنشئ الحساب. افتح رابط التأكيد المُرسَل إلى بريدك ثم سجّل الدخول");
      setPending(false);
      return;
    }

    router.replace("/projects");
    router.refresh();
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-7 px-6 py-10">
      <div className="flex items-center gap-[9px]">
        <span className="w-2.5 h-2.5 rounded-[3px] bg-brand" />
        <span className="text-base font-semibold tracking-[-0.01em]">مسار</span>
      </div>

      <div className="w-full max-w-[400px] bg-surface border border-line rounded-[14px] px-[34px] pt-9 pb-8">
        <h1 className="text-[21px] font-semibold mb-1.5">إنشاء حساب</h1>
        <p className="text-[13.5px] text-muted leading-[1.6] mb-[26px]">
          دقيقة واحدة، ثم تبدأ أول مشروع لك.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-medium text-ink-soft">
              البريد الإلكتروني
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              dir="ltr"
              placeholder="name@work.com"
              className="h-[42px] px-3 text-sm text-start bg-surface border border-line-input rounded-lg"
            />
          </label>

          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-medium text-ink-soft">
              كلمة المرور
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="٦ أحرف على الأقل"
              className="h-[42px] px-3 text-sm bg-surface border border-line-input rounded-lg"
            />
          </label>

          <label className="flex flex-col gap-[7px]">
            <span className="text-[13px] font-medium text-ink-soft">
              تأكيد كلمة المرور
            </span>
            <input
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="أعد كتابة كلمة المرور"
              className="h-[42px] px-3 text-sm bg-surface border border-line-input rounded-lg"
            />
          </label>

          {error && (
            <p role="alert" className="text-[13px] text-overdue-ink">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-[13px] text-done-ink">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-[42px] mt-1.5 bg-brand hover:bg-brand-hover text-white rounded-lg text-[14.5px] font-medium cursor-pointer disabled:opacity-50"
          >
            {pending ? "جارٍ الإنشاء…" : "إنشاء الحساب"}
          </button>
        </form>

        <div className="mt-[22px] pt-5 border-t border-line-soft text-[13.5px] text-muted flex gap-1.5">
          <span>لديك حساب بالفعل؟</span>
          <Link href="/login" className="text-brand font-medium">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </main>
  );
}
