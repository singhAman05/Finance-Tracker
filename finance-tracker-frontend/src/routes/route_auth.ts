import { baseUrl } from "@/utils/Error_handler";
import type { User } from "@/types/interfaces";

// --- Response types for auth endpoints ---
interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// --- Route functions ---
// Auth routes use raw fetch (NOT apiClient) because apiClient requires
// a JWT token, and auth endpoints are what ISSUE the token.

export const phoneLoginRoute = async (phone: string): Promise<AuthResponse> => {
  const response = await fetch(`${baseUrl}/api/auth/phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Login failed. Please try again.");
  }

  return data as AuthResponse;
};

export const loginGoogleRoute = async (
  email: string,
  name: string,
  idToken?: string
): Promise<AuthResponse> => {
  const response = await fetch(`${baseUrl}/api/auth/google-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, idToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Login failed. Please try again.");
  }

  return data as AuthResponse;
};