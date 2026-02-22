import { baseUrl } from "@/utils/Error_handler";

export const phoneLoginRoute = async (phone: string) => {
  try {
    const response = await fetch(`${baseUrl}/api/auth/phone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Login failed. Please try again.");
    }

    return data
  } catch (error) {
    console.error("Login API Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Unexpected login error."
    );
  }
};

export const loginGoogleRoute = async (email: string, name: string) => {
  try {
    const response = await fetch(`${baseUrl}/api/auth/google-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Login failed. Please try again.");
    }

    return data
  } catch (error) {
    console.error("Google Login API Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Unexpected Google login error."
    );
  }
}