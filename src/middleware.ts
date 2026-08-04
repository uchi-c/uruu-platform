import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const isApiRoute = req.nextUrl.pathname.startsWith("/api");

    // Standard tenant-isolation header injection for API routes
    if (isApiRoute && token?.tenantId) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-tenant-id", token.tenantId as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthRoute = req.nextUrl.pathname.startsWith("/auth");
        if (isAuthRoute) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*", "/admin/:path*"],
};
