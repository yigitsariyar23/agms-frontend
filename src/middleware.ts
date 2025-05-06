import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to check JWT token and redirect based on authentication status
 * 
 * If JWT token exists:
 * - If it's valid, redirect authenticated users away from auth pages
 * - If it's invalid, remove the token cookie
 */
export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const isAuthPath = path === '/auth' || path === '/auth/register' || path.startsWith('/auth/reset-password');
  
  // Static resources and API routes should be excluded
  if (
    path.startsWith('/_next') || 
    path.startsWith('/api') || 
    path.includes('/favicon.ico') ||
    path.startsWith('/static')
  ) {
    return NextResponse.next();
  }
  
  // Check if the JWT token exists in cookies
  const token = request.cookies.get('jwt_token')?.value;
  
  // If user is on auth page but has a valid token, redirect to dashboard
  if (isAuthPath && token) {
    try {
      // Verify token with the local API endpoint
      const verifyUrl = new URL('/api/auth/verify-token', request.url);
      const verifyResponse = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (verifyResponse.ok) {
        const data = await verifyResponse.json();
        if (data.success) {
          // Token is valid, redirect to dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
      
      // Token is invalid or expired, remove it
      const invalidTokenResponse = NextResponse.next();
      invalidTokenResponse.cookies.delete('jwt_token');
      return invalidTokenResponse;
    } catch (error) {
      console.error('Error verifying token in middleware:', error);
      // On error, proceed without redirection but clear invalid token
      const errorResponse = NextResponse.next();
      errorResponse.cookies.delete('jwt_token');
      return errorResponse;
    }
  }
  
  // If user tries to access a protected route without a token, redirect to auth
  if (!isAuthPath && !token) {
    // Save the original URL to redirect back after login
    const url = new URL('/auth', request.url);
    url.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(url);
  }
  
  // For all other cases, proceed normally
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes
    '/(.*)',
  ],
}; 