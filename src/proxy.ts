import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renamed `middleware.ts` to `proxy.ts`; the exported function is `proxy`.
// See node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md

/** Reachable without a session. */
const PUBLIC_PATHS = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // Responses that set auth cookies must never be cached by a CDN.
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // getUser() validates the token with the auth server. getSession() only reads
  // the cookie, so it must not be trusted here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!user && !isPublic) {
    return redirectTo("/login", request, response);
  }

  if (user && (isPublic || pathname === "/")) {
    return redirectTo("/projects", request, response);
  }

  return response;
}

/** Redirect while carrying over any cookies refreshed above. */
function redirectTo(pathname: string, request: NextRequest, from: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  // `/api` is excluded on purpose: route handlers answer with 401 JSON,
  // they must not be redirected to the login page.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
