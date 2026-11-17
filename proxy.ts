import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

/**
 * Next.js 16 renamed middleware to proxy. This runs before the dashboard
 * renders, refreshes the Supabase session and rejects anyone who is not the
 * allow-listed owner.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let pendingCookies: PendingCookie[] = [];
  let cacheHeaders: Record<string, string> = {};

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase auth environment variables are missing");
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        pendingCookies = cookiesToSet;
        cacheHeaders = headers;
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([header, value]) =>
          response.headers.set(header, value),
        );
      },
    },
  });

  // Verify the JWT signature rather than trusting the cookie payload.
  const { data, error } = await supabase.auth.getClaims();
  const email = data?.claims?.email;

  if (error || typeof email !== "string") {
    return redirectToLogin(request, pendingCookies, cacheHeaders);
  }

  const owner = (process.env.OWNER_EMAIL ?? "").toLowerCase();
  if (email.toLowerCase() !== owner) {
    return redirectToLogin(request, pendingCookies, cacheHeaders);
  }

  return response;
}

function redirectToLogin(
  request: NextRequest,
  cookies: PendingCookie[],
  headers: Record<string, string>,
) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";

  const redirect = NextResponse.redirect(url);

  // A refreshed session may have written cookies. Carry them (and the
  // no-cache headers) onto the redirect so the browser does not loop.
  cookies.forEach(({ name, value, options }) =>
    redirect.cookies.set(name, value, options),
  );
  Object.entries(headers).forEach(([header, value]) =>
    redirect.headers.set(header, value),
  );

  return redirect;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
