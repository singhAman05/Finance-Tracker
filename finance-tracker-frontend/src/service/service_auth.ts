import { phoneLoginRoute } from "@/routes/route_auth";
import { login } from "@/components/redux/slices/slice_auth";
import { AppDispatch } from "@/app/store";
import { signIn, signOut } from "next-auth/react";
import { baseUrl } from "@/utils/Error_handler";

export const loginService = async (phone: string, dispatch: AppDispatch) => {
  try {
    const { user } = await phoneLoginRoute(phone);

    sessionStorage.setItem("user", JSON.stringify(user));

    dispatch(login({ user }));

    return user.profile_complete;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "An unexpected error occurred"
    );
  }
};

export const loginWithGoogle = async () => {
  await signIn("google");
};

export const logoutService = async () => {
  try {
    await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Logout API failure is non-critical
  }
  sessionStorage.removeItem("user");
  await signOut({ callbackUrl: process.env.NEXTAUTH_URL });
};
