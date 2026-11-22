"use client";

import { useActionState, useRef, useEffect } from "react";
import { changePasswordAction } from "@/app/actions/auth";
import { type ChangePasswordState } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, AlertCircle, CheckCircle } from "lucide-react";

const INITIAL_STATE: ChangePasswordState = { status: "idle" };

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    INITIAL_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the inputs after a successful password change.
  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-4 w-4" aria-hidden />
          Password
        </CardTitle>
        <CardDescription>
          Enter your current password to set a new one.
        </CardDescription>
      </CardHeader>

      <form ref={formRef} action={formAction}>
        <CardContent className="space-y-4">
          {state.status === "error" && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {state.error}
            </div>
          )}
          {state.status === "success" && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-md bg-up/10 p-3 text-sm text-up"
            >
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Password updated.
            </div>
          )}

          <Field id="currentPassword" label="Current password">
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              disabled={isPending}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="newPassword"
              label="New password"
              hint="At least 8 characters."
            >
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isPending}
                aria-describedby="newPassword-hint"
              />
            </Field>
            <Field id="confirmPassword" label="Confirm new password">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isPending}
              />
            </Field>
          </div>
        </CardContent>

        <CardFooter className="justify-end border-t pt-6">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? "Updating…" : "Update password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
