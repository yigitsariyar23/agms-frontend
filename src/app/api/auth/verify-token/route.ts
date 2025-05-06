import { NextRequest, NextResponse } from 'next/server';
import { isTokenExpired, getUserFromToken } from '@/lib/utils/jwt';

/**
 * API route to verify if a JWT token is valid
 * 
 * This endpoint extracts the token from Authorization header,
 * validates it, and returns user information if valid
 */
export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token not provided' },
        { status: 401 }
      );
    }
    
    // Check if token is expired
    if (isTokenExpired(token)) {
      return NextResponse.json(
        { success: false, message: 'Token expired' },
        { status: 401 }
      );
    }
    
    // Extract user info from token
    const tokenData = getUserFromToken(token);
    const user = tokenData?.user;
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token: user data not found' },
        { status: 401 }
      );
    }
    
    // Token is valid, return success with user data
    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      user
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Error verifying token' },
      { status: 500 }
    );
  }
} 