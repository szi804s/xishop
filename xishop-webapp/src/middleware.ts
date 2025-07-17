import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  // Protect creator dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }
  }

  // Protect superadmin routes with strict email check
  if (pathname.startsWith("/superadmin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }
    // Critical check: Only allow the super admin email
    if (token.email !== process.env.SUPER_ADMIN_EMAIL) {
      // Redirect non-admins to a safe page, like the main dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/dashboard/:path*", "/superadmin/:path*"],
}; 