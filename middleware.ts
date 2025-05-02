import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Auth protected paths
const protectedPaths = [
  '/onboarding', 
  '/dashboard',
  '/profile',
];

// Auth paths that should redirect to dashboard if already logged in
const authPaths = [
  '/auth/login',
  '/auth/register',
];

// Diagnostic paths that should always be accessible
const diagnosticPaths = [
  '/auth/debug',
  '/auth/error',
  '/auth/linkedin-config-checker',
];

// Development mode flag - this helps prevent redirect loops during development
const isDevelopment = process.env.NODE_ENV === 'development';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Log for debugging redirect loops
  console.log(`[Middleware] Processing request for: ${pathname}`);
  
  // In development mode, we'll disable auth protection by default
  // You can opt back into auth protection by adding ?auth_check=true to URLs
  // For testing authentication, we're making it toggleable via URL parameter
  const shouldCheckAuth = isDevelopment 
    ? request.nextUrl.searchParams.has('auth_check')  // In dev: use URL param to enable auth
    : true;  // In production: always check auth
  
  if (isDevelopment && !shouldCheckAuth) {
    console.log(`[Middleware] Development mode - auth checks disabled for: ${pathname}`);
    return NextResponse.next();
  }
  
  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname === path);
  const isDiagnosticPath = diagnosticPaths.some(path => pathname === path);
  
  // Skip auth check for diagnostic paths
  if (isDiagnosticPath) {
    console.log(`[Middleware] Allowing access to diagnostic path: ${pathname}`);
    return NextResponse.next();
  }
  
  // Get the token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // Redirect logic
  if (isProtectedPath && !token) {
    // Prevent redirect loops for the onboarding path
    if (pathname.startsWith('/onboarding') && pathname !== '/onboarding') {
      console.log(`[Middleware] Not redirecting internal onboarding path: ${pathname}`);
      return NextResponse.next();
    }
    
    // Special case for development: prevent redirect loops with onboarding paths
    if (isDevelopment && pathname.startsWith('/onboarding')) {
      console.log(`[Middleware] Development mode - allowing access to onboarding path: ${pathname}`);
      return NextResponse.next();
    }
    
    // Redirect to login if trying to access protected route without auth
    console.log(`[Middleware] Redirecting to login from: ${pathname}`);
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }
  
  if (isAuthPath && token) {
    // Redirect to dashboard if already logged in and trying to access auth pages
    console.log(`[Middleware] Redirecting to dashboard from auth path: ${pathname}`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  console.log(`[Middleware] Allowing access to: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except for public assets and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}; 