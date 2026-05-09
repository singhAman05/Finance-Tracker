import { baseUrl } from "@/utils/Error_handler";
import type { User } from "@/types/interfaces";

// --- Response types for auth endpoints ---
interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
}

interface AuthPayload {
  user: User;
}

interface ErrorResponse {
  message: string;
  details?: unknown;
}

// --- Route functions ---
// Auth routes use raw fetch (NOT apiClient) because apiClient
// relies on the cookie being set, and auth endpoints are what SET the cookie.

export const phoneLoginRoute = async (phone: string): Promise<AuthPayload> => {
  const response = await fetch(`${baseUrl}/api/auth/phone`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });

  const body = (await response.json()) as AuthResponse | ErrorResponse;

  if (!response.ok) {
    throw new Error(body?.message || "Login failed. Please try again.");
  }

  const { user } = body as AuthResponse;
  return { user };
};

export const loginGoogleRoute = async (
  email: string,
  name: string,
  idToken?: string
): Promise<AuthPayload> => {
  const response = await fetch(`${baseUrl}/api/auth/google-login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, idToken }),
  });

  const body = (await response.json()) as AuthResponse | ErrorResponse;

  if (!response.ok) {
    throw new Error(body?.message || "Login failed. Please try again.");
  }

  const { user } = body as AuthResponse;
  return { user };
};
