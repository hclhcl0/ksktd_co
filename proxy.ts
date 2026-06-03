// proxy.ts (Next.js 16+ uses proxy.ts instead of middleware.ts)
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes - không cần đăng nhập
  const publicRoutes = ['/login'];
  if (publicRoutes.includes(pathname)) {
    // Nếu đã đăng nhập, redirect về trang phù hợp
    if (session) {
      const role = (session.user as { role?: string })?.role;
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return NextResponse.redirect(new URL('/submit-report', req.url));
    }
    return NextResponse.next();
  }

  // Chưa đăng nhập → redirect về login
  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (session.user as { role?: string })?.role;

  // Chỉ admin được xem dashboard và accounts
  if (pathname.startsWith('/dashboard') && role !== 'admin') {
    return NextResponse.redirect(new URL('/submit-report', req.url));
  }
  if (pathname.startsWith('/accounts') && role !== 'admin') {
    return NextResponse.redirect(new URL('/submit-report', req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Bảo vệ tất cả route trừ static files và API auth
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
