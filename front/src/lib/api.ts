export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8080/api';

interface RegisterData
{
  email: string;
  username: string;
  password: string;
  display_name?: string;
}

interface LoginData
{
  email: string;
  password: string;
  twofa_token?: string;
}

interface AuthResponse
{
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
    display_name?: string;
    avatar_url?: string | null;
  };
}

// register a new user
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
  if (!response.ok)
    throw new Error(result.error || 'Registration failed');
  return result;
}

// login user
export async function login(data: LoginData): Promise<AuthResponse | { requires2FA: boolean; message: string }> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || 'Login failed');
  return result;
}

// logout user
export async function logout() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok && response.status !== 204)
    throw new Error('Logout failed');
  return true;
}

// get current logged-in user info
export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });

  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || 'Failed to get user info');
  return result;
}

// get current user's profile
export async function getProfile() {
  const response = await fetch(`${API_URL}/profile`, {
    method: 'GET',
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok)
    throw new Error(result.error || 'Failed to get profile');
  return result;
}

// get a user's profile by ID
export async function getUserProfile(userId: number) {
  const response = await fetch(`${API_URL}/profile/${userId}`, {
    method: 'GET',
    credentials: 'include',
  });

  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || 'Failed to get user profile');
  return result;
}

// post user avatar
export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/profile/avatar`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || 'Failed to upload avatar');
  return result;
}

// update user information
export async function updateProfile(data: { display_name?: string; username?: string; email?: string; password?: string }) {
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
    if (!response.ok)
      throw new Error(result.error || 'Failed to update profile');
    return result;
  }
  catch (err: any)
  {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error('Network error: Cannot reach the server. Check if backend is running.');
    }
    throw err;
  }
}

// get current user's match history
export async function getMatchHistory() {
  const response = await fetch(`${API_URL}/profile/match-history`, {
    method: 'GET',
    credentials: 'include',
  });

  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || 'Failed to get match history');
  return result;
}

// get a user's match history by ID
export async function getUserMatchHistory(userId: number) {
  const response = await fetch(`${API_URL}/profile/${userId}/match-history`, {
    method: 'GET',
    credentials: 'include',
  });

  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || 'Failed to get user match history');
  return result;
}

// get top players for leaderboard
export async function getLeaderboard() {
  const response = await fetch(`${API_URL}/profile/leaderboard`, {
    method: 'GET',
    credentials: 'include',
  });

  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || 'Failed to get leaderboard');
  return result;
}

// get user's friends list
export async function getFriends(userId: number) {
  const response = await fetch(`${API_URL}/friendships/${userId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok)
    throw new Error('Failed to get friends');
  const result = await response.json();
  return result;
}
