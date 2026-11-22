"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";
import {
  signInAction,
  signUpAction,
  type LoginState,
  type SignUpState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TabValue = "login" | "signup";

const TABS: { value: TabValue; label: string; icon: React.ElementType }[] = [
  { value: "login", label: "Login", icon: LogIn },
  { value: "signup", label: "Create account", icon: UserPlus },
];

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

function Message({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-md px-3 py-2 text-sm font-medium ${
        tone === "error" ? "bg-down/10 text-down" : "bg-up/10 text-up"
      }`}
    >
      {children}
    </p>
  );
}

function EmailField({ id }: { id: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-primary">
        Email
      </label>
      <Input
        id={id}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        placeholder="you@example.com"
        className="h-11 w-full"
      />
    </div>
  );
}

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  minLength,
  hint,
  onInput,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  hint?: string;
  onInput?: React.FormEventHandler<HTMLInputElement>;
}) {
  const [show, setShow] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-primary">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          onInput={onInput}
          aria-describedby={hintId}
          className="h-11 w-full pr-11"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {show ? (
            <EyeOff size={18} aria-hidden />
          ) : (
            <Eye size={18} aria-hidden />
          )}
        </button>
      </div>
      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Flags the confirm field as invalid while it differs from the password. */
function syncConfirmValidity(form: HTMLFormElement | null) {
  if (!form) return;
  const pw = form.elements.namedItem("password") as HTMLInputElement | null;
  const cf = form.elements.namedItem(
    "confirmPassword",
  ) as HTMLInputElement | null;
  if (!pw || !cf) return;
  cf.setCustomValidity(
    cf.value && cf.value !== pw.value ? "Passwords do not match" : "",
  );
}

function SubmitButton({
  pending,
  idleLabel,
  pendingLabel,
  icon: Icon,
}: {
  pending: boolean;
  idleLabel: string;
  pendingLabel: string;
  icon: React.ElementType;
}) {
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Icon aria-hidden />}
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

/**
 * `allowSignUp` controls the "Create account" tab.
 * For a private, single-owner site set it to false so only login is shown.
 */
export function LoginForm({ allowSignUp = true }: { allowSignUp?: boolean }) {
  const uid = useId();
  const [activeTab, setActiveTab] = useState<TabValue>("login");

  const [loginState, loginFormAction, loginPending] = useActionState<
    LoginState,
    FormData
  >(signInAction, null);

  const [signupState, signupFormAction, signupPending] = useActionState<
    SignUpState,
    FormData
  >(signUpAction, { status: "idle" });

  const signupFormRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (signupState.status === "success") signupFormRef.current?.reset();
  }, [signupState]);

  const tabId = (v: TabValue) => `${uid}-tab-${v}`;
  const panelId = (v: TabValue) => `${uid}-panel-${v}`;

  function onTabKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next: TabValue = activeTab === "login" ? "signup" : "login";
    setActiveTab(next);
    requestAnimationFrame(() => document.getElementById(tabId(next))?.focus());
  }

  const loginPane = (
    <LoginPane
      idPrefix={uid}
      state={loginState}
      formAction={loginFormAction}
      pending={loginPending}
    />
  );

  if (!allowSignUp) return loginPane;

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Account access"
        onKeyDown={onTabKeyDown}
        className="flex gap-1 border-b border-border"
      >
        {TABS.map(({ value, label, icon: Icon }) => {
          const selected = activeTab === value;
          return (
            <button
              key={value}
              id={tabId(value)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId(value)}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(value)}
              className={`-mb-px flex min-h-11 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                selected
                  ? "border-secondary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={16} aria-hidden />
              {label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={panelId(activeTab)}
        aria-labelledby={tabId(activeTab)}
      >
        {activeTab === "login" ? (
          loginPane
        ) : (
          <SignUpPane
            idPrefix={uid}
            state={signupState}
            formAction={signupFormAction}
            pending={signupPending}
            formRef={signupFormRef}
            onDone={() => setActiveTab("login")}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panes                                                               */
/* ------------------------------------------------------------------ */

function LoginPane({
  idPrefix,
  state,
  formAction,
  pending,
}: {
  idPrefix: string;
  state: LoginState;
  formAction: (formData: FormData) => void | Promise<void>;
  pending: boolean;
}) {
  return (
    <form action={formAction} className="space-y-4" noValidate={false}>
      {/* fieldset disables every control at once while submitting */}
      <fieldset disabled={pending} className="space-y-4">
        <EmailField id={`${idPrefix}-login-email`} />
        <PasswordField
          id={`${idPrefix}-login-password`}
          name="password"
          label="Password"
          autoComplete="current-password"
        />
      </fieldset>

      {state?.error ? <Message tone="error">{state.error}</Message> : null}

      <SubmitButton
        pending={pending}
        idleLabel="Sign in"
        pendingLabel="Signing in..."
        icon={LogIn}
      />
    </form>
  );
}

function SignUpPane({
  idPrefix,
  state,
  formAction,
  pending,
  formRef,
  onDone,
}: {
  idPrefix: string;
  state: SignUpState;
  formAction: (formData: FormData) => void | Promise<void>;
  pending: boolean;
  formRef: React.RefObject<HTMLFormElement | null>;
  onDone: () => void;
}) {
  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <fieldset disabled={pending} className="space-y-4">
        <EmailField id={`${idPrefix}-signup-email`} />
        <PasswordField
          id={`${idPrefix}-signup-password`}
          name="password"
          label="Password"
          autoComplete="new-password"
          minLength={8}
          hint="At least 8 characters."
          onInput={(e) => syncConfirmValidity(e.currentTarget.form)}
        />
        <PasswordField
          id={`${idPrefix}-signup-confirm`}
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          minLength={8}
          onInput={(e) => syncConfirmValidity(e.currentTarget.form)}
        />
      </fieldset>

      {state.status === "error" ? (
        <Message tone="error">{state.error}</Message>
      ) : null}

      {state.status === "success" ? (
        <div className="space-y-2">
          <Message tone="success">
            Account created. Check your email to confirm, then sign in.
          </Message>
          <Button
            type="button"
            variant="outline"
            onClick={onDone}
            className="h-11 w-full"
          >
            Go to sign in
          </Button>
        </div>
      ) : null}

      {state.status !== "success" ? (
        <SubmitButton
          pending={pending}
          idleLabel="Create account"
          pendingLabel="Creating account..."
          icon={UserPlus}
        />
      ) : null}
    </form>
  );
}