import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/utils/jwt';

/**
 * API route to get user profile
 * This endpoint returns the complete user profile information
 */
export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token not provided' },
        { status: 401 }
      );
    }
    
    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { error: 'Backend URL not configured' },
        { status: 500 }
      );
    }
    
    const response = await fetch(`${backendUrl}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend profile fetch failed:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: response.status }
      );
    }
    
    const profileData = await response.json();
    return NextResponse.json(profileData);
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 