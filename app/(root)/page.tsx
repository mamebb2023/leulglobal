import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#14243A] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="leading-none">
            <span className="text-lg font-bold tracking-wide sm:text-xl">
              LEULGLOBAL
            </span>
            <span className="text-xs font-semibold text-[#C8A34D] sm:text-sm">
              .COM
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#C8A34D] px-4 text-sm font-semibold text-[#14243A] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden />
            Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 items-center">
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A34D] sm:text-sm">
            Private market intelligence
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Your markets, in one private place.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            Gold, crypto, foreign exchange, oil and commodities, with clear
            sources and update times, built to review on your iPhone.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#C8A34D] px-6 font-semibold text-[#14243A] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-6 text-center text-xs text-white/60 sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <span className="font-semibold tracking-wider text-[#C8A34D]">
            LEULGLOBAL.COM &nbsp;|&nbsp; SIMPLE • PRIVATE • INFORMATIVE
          </span>
          <span>Private single-owner market intelligence platform</span>
        </div>
      </footer>
    </div>
  );
}
