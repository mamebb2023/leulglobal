# Plan: Settings / Account page (`/dashboard/settings`)

## Goal
Add a Settings/Account page where the owner can view common account details (email, created at, last sign-in at, confirmation status) and change their password.

## Context
- Stack: Next.js 16 App Router, React 19, Supabase Auth (`@supabase/ssr`), shadcn/ui (`Card`/`Input`/`Button`), zod, vitest, Tailwind.
- Dashboard routes live in `app/(root)/dashboard/` and are gated by `proxy.ts` middleware (matcher `/dashboard/:path*`) and `requireOwner()` in `app/(root)/dashboard/layout.tsx:24` (same pattern as `lib/auth.ts:9`).
- `components/DashboardLayout.tsx:15` (bottom nav) and `components/Sidebar.tsx:26` already link to `/dashboard/settings` — no navigation changes needed.
- Existing auth actions in `app/actions/auth.ts`: `signInAction`, `signOutAction`; both return `{ error: string } | null` and use `redirect`.
- No toast component exists; feedback via inline error/success text only.

## Decisions
1. **Route**: `app/(root)/dashboard/settings/page.tsx` — Server Component under the already-gated dashboard layout.
2. **Account details**: fetched per-request with `supabase.auth.getUser()` (same pattern as `requireOwner`); show email, `created_at`, `last_sign_in_at`, `email_confirmed_at`.
3. **Password change**: new server action `changePasswordAction` in `app/actions/auth.ts`. Flow: verify current password via `signInWithPassword(email, currentPassword)`, then `supabase.auth.updateUser({ password: newPassword })`. Returns `{ error: string } | null`; on success show inline success and reset form fields.
4. **Validation**: zod schema (already a dependency): current password required; new password ≥ 8 chars; confirmation must match new password.
5. **UI**: two cards — read-only account-details card + change-password form card; reuse existing `Card`, `Input`, `Button` and lucide icons; inline status messages (no new dependencies).
6. **Tests**: vitest unit test for the zod validation schema (`tests/settings/change-password.test.ts`); server action itself not unit-tested (Supabase mocking not used anywhere in existing tests).

## Tasks
1. Add `changePasswordAction` (zod validation + current-password verify + `updateUser`) to `app/actions/auth.ts`.
2. Create `app/(root)/dashboard/settings/ChangePasswordForm.tsx` — client form with inline error/success messages.
3. Create `app/(root)/dashboard/settings/page.tsx` — server component fetching the user and rendering the details card + form.
4. Add `tests/settings/change-password.test.ts` covering the validation schema.
5. Validate: `npm run lint`, `npx tsc --noEmit`, `npm test`.

## Open questions
- Password flow: current design requires entering the current password before changing it (re-verify via `signInWithPassword`, then `updateUser`). If you prefer a simpler flow (skip current-password check, just `updateUser({ password })`), say so and I'll adjust task 1.
