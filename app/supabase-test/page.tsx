import { supabase } from "@/lib/supabase";

type ConnectionStatus = {
  connected: boolean;
  message: string;
  details?: string;
};

async function checkSupabaseConnection(): Promise<ConnectionStatus> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return {
      connected: false,
      message: "Supabase connection failed",
      details: error.message,
    };
  }

  return {
    connected: true,
    message: "Supabase connection successful",
    details: data.session
      ? "Authenticated session found"
      : "No active session (API is reachable)",
  };
}

export default async function SupabaseTestPage() {
  const status = await checkSupabaseConnection();

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Supabase Connection Test
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This page verifies that your Next.js app can reach Supabase using
          the credentials in <code className="font-mono">.env.local</code>.
        </p>

        <div
          className={`mt-6 rounded-xl border p-4 ${
            status.connected
              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
              : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
          }`}
        >
          <p
            className={`font-medium ${
              status.connected
                ? "text-emerald-800 dark:text-emerald-200"
                : "text-red-800 dark:text-red-200"
            }`}
          >
            {status.message}
          </p>
          {status.details ? (
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              {status.details}
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          Update{" "}
          <code className="font-mono text-zinc-800 dark:text-zinc-200">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="font-mono text-zinc-800 dark:text-zinc-200">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          in <code className="font-mono">.env.local</code>, then restart{" "}
          <code className="font-mono">npm run dev</code>.
        </p>
      </main>
    </div>
  );
}
