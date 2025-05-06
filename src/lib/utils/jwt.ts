import { getCookie } from './cookies';

interface TokenPayload {
  exp?: number;
  [key: string]: unknown;
}

/**
 * Decodes a JWT token to get the payload.
 * Note: This is a simple decode, not a verification.
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Gets the JWT token from cookies
 */
export const getToken = (): string | null => {
  return getCookie('jwt_token');
};

/**
 * Adds authorization header to fetch options
 */
export const withAuth = (options: RequestInit = {}): RequestInit => {
  const token = getToken();
  if (!token) return options;

  return {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Checks if a token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const expiryTime = decoded.exp * 1000;
  return Date.now() >= expiryTime;
};

/**
 * Gets user information from the token
 */
export const getUserFromToken = (token: string): TokenPayload | null => {
  return decodeToken(token);
}; 