import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in · LeulGlobal",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-primary text-primary-foreground">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="leading-none">
            <span className="text-lg font-extrabold tracking-wide sm:text-xl">
              LEULGLOBAL
            </span>
            <span className="text-xs font-semibold text-secondary sm:text-sm">
              .COM
            </span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-secondary/15 text-secondary ring-1 ring-secondary/30">
              <LockKeyhole className="size-6" aria-hidden />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Sign in
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Create an account or sign in to access your dashboard.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 text-foreground shadow-2xl">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-white/50">
            Prices and provider keys stay on the server. Your session is stored
            in secure cookies.
          </p>
        </div>
      </main>
    </div>
  );
}
