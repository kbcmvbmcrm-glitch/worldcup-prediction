"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AlertMessage } from "@/components/AlertMessage";
import { ADMIN_CLIENT_SESSION_KEY } from "@/lib/admin/constants";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "管理者ログインに失敗しました");
      }

      sessionStorage.setItem(ADMIN_CLIENT_SESSION_KEY, "true");
      setPassword("");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "管理者ログインに失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-zinc-900">管理者ログイン</h1>
      <p className="mt-2 text-sm text-zinc-600">
        管理画面を利用するにはパスワードを入力してください。
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="admin-password"
            className="mb-2 block text-sm font-medium text-zinc-700"
          >
            管理者パスワード
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {errorMessage ? <AlertMessage type="error" message={errorMessage} /> : null}

        <button
          type="submit"
          disabled={isSubmitting || !password}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {isSubmitting ? "確認中..." : "ログイン"}
        </button>
      </form>
    </section>
  );
}
