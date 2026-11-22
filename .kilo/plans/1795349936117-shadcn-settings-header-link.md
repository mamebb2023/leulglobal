# Plan: Fix runtime errors + complete shadcn settings/header changes

## Context
Previous implementation changes (already applied to working tree):
- `components/DashboardLayout.tsx`: Replaced header logout button with Settings link; removed `signOutAction` import + `LogOut` icon.
- `app/(root)/dashboard/settings/ChangePasswordForm.tsx`: Added "Danger zone" sign-out form using `signOutAction`.

Two runtime errors now block the app:

### Error 1 — `app/actions/auth.ts:14`
`export const changePasswordSchema = z.object(...)` exports a Zod schema object from a `"use server"` file. Next.js turbopack requires ALL `"use server"` exports to be async functions. This was latent until importing `signOutAction` into the client `ChangePasswordForm` triggered stricter module validation.

### Error 2 — `app/(root)/dashboard/layout.tsx:13`
`OwnerOnly` calls `await requireOwner()` (which internally uses Supabase client → `Date.now()`) during prerendering without first calling `await connection()`. Next.js flags `Date.now()` as unstable during prerender.

## Files to modify

1. **`lib/validators.ts`** (new) — Move `changePasswordSchema` here (no `"use server"`, so exporting a Zod object is fine).
2. **`app/actions/auth.ts`** — Remove `changePasswordSchema` export + `z` import; import schema from `@/lib/validators`.
3. **`tests/settings/change-password.test.ts`** — Update import of `changePasswordSchema` from `@/app/actions/auth` → `@/lib/validators`.
4. **`app/(root)/dashboard/layout.tsx`** — Add `await connection()` before `await requireOwner()` in `OwnerOnly`.

## Validation
- `npm run lint` — clean
- `npm test` — 39/39 pass (after updating test import)
- `npx tsc --noEmit` — clean

## Rollback
- Revert `auth.ts`, `layout.tsx`, `lib/validators.ts`, and test import changes; delete `lib/validators.ts`.
