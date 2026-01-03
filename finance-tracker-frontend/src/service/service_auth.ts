import { phoneLoginRoute } from "@/routes/route_auth";
import { login } from "@/components/redux/slices/slice_auth";
import { AppDispatch } from "@/app/store";
import { signIn, signOut } from "next-auth/react";

export const loginService = async (phone: string, dispatch: AppDispatch) => {
  try {
    const data = await phoneLoginRoute(phone);
    const { message, token, user } = data;

    localStorage.setItem("jwt", token);
    localStorage.setItem("user", JSON.stringify(user));

    dispatch(login({ user, token }));

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
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    await signOut({ callbackUrl: process.env.NEXTAUTH_URL });
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
