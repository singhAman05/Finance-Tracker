import { apiClient } from "@/utils/Error_handler";
import type { User } from "@/types/interfaces";

// --- Response types for auth endpoints ---
interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// --- Route functions ---

export const phoneLoginRoute = async (phone: string): Promise<AuthResponse> => {
  const data = await apiClient<AuthResponse>("/api/auth/phone", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
  if (data.error) throw new Error(data.error.message);
  return data.result as AuthResponse;
};

export const loginGoogleRoute = async (email: string, name: string): Promise<AuthResponse> => {
  const data = await apiClient<AuthResponse>("/api/auth/google-login", {
    method: "POST",
    body: JSON.stringify({ email, name }),
  });
  if (data.error) throw new Error(data.error.message);
  return data.result as AuthResponse;
};