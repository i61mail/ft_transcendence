const API_URL = 'http://localhost:4000';

interface RegisterData {
  email: string;
  username: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
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
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Login failed');
  }

  return result;
}

/**
 * Get current user info (requires authentication)
 */
export async function getCurrentUser(token: string) {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to get user info');
  }

  return result;
}
