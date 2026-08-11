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

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 p-6">
      <h1 className="text-xl font-bold">إنشاء حساب</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          البريد الإلكتروني
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            dir="ltr"
            className="rounded border border-gray-400 px-3 py-2 text-start"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          كلمة المرور
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            dir="ltr"
            className="rounded border border-gray-400 px-3 py-2 text-start"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          تأكيد كلمة المرور
          <input
            type="password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            dir="ltr"
            className="rounded border border-gray-400 px-3 py-2 text-start"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm text-green-700">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "جارٍ الإنشاء…" : "إنشاء الحساب"}
        </button>
      </form>

      <p className="text-sm">
        لديك حساب؟{" "}
        <Link href="/login" className="underline">
          سجّل الدخول
        </Link>
      </p>
    </main>
  );
}
