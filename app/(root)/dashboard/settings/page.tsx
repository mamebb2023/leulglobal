import { Suspense } from "react";
import { connection } from "next/server";
import {
  CalendarDays,
  Clock,
  LogOut,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOutAction } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import ChangePasswordForm from "./ChangePasswordForm";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account details and security.
        </p>
      </header>

      <Suspense fallback={<AccountDetailsSkeleton />}>
        <AccountDetails />
      </Suspense>

      <ChangePasswordForm />

      <SessionCard />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Account details                                                            */
/* -------------------------------------------------------------------------- */

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  ...DATE_FORMAT,
  hour: "2-digit",
  minute: "2-digit",
};

function formatDate(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = DATE_FORMAT,
) {
  return value ? new Date(value).toLocaleDateString(undefined, options) : null;
}

async function AccountDetails() {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" aria-hidden />
            Account details
          </CardTitle>
          <CardDescription>
            We couldn&rsquo;t load your account details. Refresh the page to try
            again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const user = data.user;
  const confirmedAt = formatDate(user.email_confirmed_at ?? user.confirmed_at);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-4 w-4" aria-hidden />
          Account details
        </CardTitle>
        <CardDescription>Your profile and sign-in activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="divide-y">
          <DetailRow icon={Mail} label="Email" value={user.email ?? "—"} />
          <DetailRow
            icon={ShieldCheck}
            label="Email status"
            value={
              confirmedAt ? (
                <span className="text-up">Verified on {confirmedAt}</span>
              ) : (
                <span className="text-muted-foreground">Not verified</span>
              )
            }
          />
          <DetailRow
            icon={CalendarDays}
            label="Member since"
            value={formatDate(user.created_at) ?? "—"}
          />
          <DetailRow
            icon={Clock}
            label="Last sign in"
            value={formatDate(user.last_sign_in_at, DATE_TIME_FORMAT) ?? "—"}
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3 text-sm first:pt-0 last:pb-0">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="ml-auto min-w-0 truncate text-right font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}

function AccountDetailsSkeleton() {
  return (
    <Card aria-busy="true" aria-label="Loading account details">
      <CardHeader>
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted/60" />
      </CardHeader>
      <CardContent className="divide-y">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted/60" />
            <div className="ml-auto h-4 w-32 animate-pulse rounded bg-muted/60" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Session                                                                    */
/* -------------------------------------------------------------------------- */

function SessionCard() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">Sign out</h2>
          <p className="text-sm text-muted-foreground">
            End your session on this device.
          </p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" className="w-full sm:w-auto">
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
