import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Allow auth callback routes to pass through
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next();
  }

  // Handle common redirects
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Handle old routes that might exist
  if (pathname.startsWith('/todos')) {
    return NextResponse.redirect(new URL('/todo', request.url));
  }

  // Handle trailing slashes
  if (pathname.endsWith('/') && pathname !== '/') {
    return NextResponse.redirect(new URL(pathname.slice(0, -1), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
