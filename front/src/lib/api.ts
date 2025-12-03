export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RegisterData {
  email: string;
  username: string;
  password: string;
  display_name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
    display_name?: string;
    avatar_url?: string | null;
  };
}

interface ErrorResponse {
  error: string;
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Registration failed');
  }

  return result;
}

/**
 * Login existing user
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Login failed');
  }

  return result;
}

/**
 * Logout user
 */
export async function logout() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error('Logout failed');
  }

  return true;
}

/**
 * Get current user info (requires authentication)
 */
export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to get user info');
  }

  return result;
}

/**
 * Get current user's profile
 */
export async function getProfile() {
  const response = await fetch(`${API_URL}/profile`, {
    method: 'GET',
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to get profile');
  }

  return result;
}

/**
 * Get a user's profile by ID
 */
export async function getUserProfile(userId: number) {
  const response = await fetch(`${API_URL}/profile/${userId}`, {
    method: 'GET',
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to get user profile');
  }

  return result;
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/profile/avatar`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to upload avatar');
  }

  return result;
}

/**
 * Update user profile (e.g., username)
 */
export async function updateProfile(data: { display_name?: string }) {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update profile');
    }

    return result;
  } catch (err: any) {
    // Network error (e.g., CORS, timeout, or backend unreachable)
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error('Network error: Cannot reach the server. Check if backend is running.');
    }
    throw err;
  }
}
