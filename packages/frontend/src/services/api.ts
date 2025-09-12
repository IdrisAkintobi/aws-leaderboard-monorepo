import { userActions, userStore } from '../store/user';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Something went wrong');
  }
  return response.json();
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const register = async (
  username: string,
  email: string,
  name: string,
  password: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, name, password }),
  });
  if (response.status !== 201) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }
};

export const verifyToken = async (email: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, token }),
  });
  if (response.status !== 200) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Token verification failed');
  }
};

export const submitScore = async (score: number) => {
  const token = userStore.idToken;
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`${API_BASE_URL}/scores/submit`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ score }),
  });
  return handleResponse(response);
};

export const getLeaderboard = async () => {
  const token = userStore.accessToken;
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }

  const response = await fetch(`${API_BASE_URL}/scores/leaderboard`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const logout = () => {
  userActions.logout();
};
