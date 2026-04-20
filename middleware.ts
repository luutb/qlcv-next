import { NextRequest, NextResponse } from 'next/server';

type Role = 'admin' | 'manager' | 'staff' | 'accountant';

const ROLE_ROUTES: Record<string, Role[]> = {
  '/admin': ['admin'],
  '/manager': ['admin', 'manager'],
  '/staff': ['admin', 'manager', 'staff'],
  '/accountant': ['admin', 'accountant'],
  '/shared': ['admin', 'manager', 'staff', 'accountant'],
};

const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  manager: '/manager',
  staff: '/staff',
  accountant: '/accountant',
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  if (
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value as Role | undefined;

  // Not authenticated -> redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Root redirect to role-based home
  if (pathname === '/') {
    const home = role ? ROLE_HOME[role] || '/staff' : '/staff';
    return NextResponse.redirect(new URL(home, request.url));
  }

  // Check role-based access
  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      if (!role || !allowedRoles.includes(role)) {
        const home = role ? ROLE_HOME[role] || '/staff' : '/login';
        return NextResponse.redirect(new URL(home, request.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|firebase-messaging-sw.js).*)',
  ],
};
