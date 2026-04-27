import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "access_token";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isDashboardPath =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isCategoryPath = pathname.startsWith("/categories/");
  const isProtectedPath = isDashboardPath || isCategoryPath;

  if (token && (isAuthPage || pathname === "/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!token && isProtectedPath) {
    const loginUrl = request.nextUrl.clone();
    const callbackUrl =
      pathname === "/dashboard"
        ? `/${request.nextUrl.search}`
        : `${pathname}${request.nextUrl.search}`;

    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("callbackUrl", callbackUrl);

    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/categories/:path*", "/login", "/signup"],
};
