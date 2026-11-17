import { Suspense } from "react";
import type { ReactNode } from "react";
import { connection } from "next/server";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumbs from "@/components/ui/breadcrumb";
import { DataSources } from "@/components/dashboard/DataSources";
import { MockBanner } from "@/components/dashboard/DataBanner";
import { requireOwner } from "@/lib/auth";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<SessionSkeleton />}>
      <OwnerOnly>{children}</OwnerOnly>
    </Suspense>
  );
}

/**
 * Auth reads the request, so it lives behind a Suspense boundary instead of
 * the prerendered shell. The proxy redirects unauthenticated requests before
 * this renders; requireOwner() is the second, server-side check that also
 * rejects a valid non-owner session.
 */
async function OwnerOnly({ children }: { children: ReactNode }) {
  await requireOwner();

  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <DataModeBanner />
      </Suspense>
      <Breadcrumbs className="mx-auto mb-4 max-w-6xl" />
      {children}
      <DataSources />
    </DashboardLayout>
  );
}

function SessionSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary text-primary-foreground">
      <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
        <span
          className="h-2 w-2 animate-pulse rounded-full bg-secondary"
          aria-hidden
        />
        Checking your session…
      </span>
    </div>
  );
}

/**
 * Read at request time. The dashboard shell is prerendered, so a plain
 * `process.env` check here would freeze the banner into the build.
 */
async function DataModeBanner() {
  await connection();
  return process.env.DATA_MODE === "mock" ? <MockBanner /> : null;
}
