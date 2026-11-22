import { Suspense } from "react";
import type { ReactNode } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumbs from "@/components/ui/breadcrumb";
import { DataSources } from "@/components/dashboard/DataSources";
import { MockBanner } from "@/components/dashboard/DataBanner";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<SessionSkeleton />}>
      <DashboardLayout>
        <Suspense fallback={null}>
          <DataModeBanner />
        </Suspense>
        <Breadcrumbs className="mx-auto mb-4 max-w-6xl" />
        {children}
        <DataSources />
      </DashboardLayout>
    </Suspense>
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
