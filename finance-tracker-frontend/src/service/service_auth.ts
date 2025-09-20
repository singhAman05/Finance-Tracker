import { loginRoute } from "@/routes/route_auth";
import { login } from "@/components/redux/slices/slice_auth";
import { AppDispatch } from "@/app/store"; // Adjust if your store file is elsewhere
import { signIn, signOut } from "next-auth/react";

export const loginService = async (phone: string, dispatch: AppDispatch) => {
  try {
    const data = await loginRoute(phone);
    // Destructure user and token from API response
    // console.log("Login response data:", data);
    const { message, token, user } = data;
    localStorage.setItem("jwt", token);
    localStorage.setItem("user", JSON.stringify(user));
    // Save to Redux store
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
  try {
    await signIn("google", { 
      redirect: true,
      callbackUrl: "/dashboard" // Or wherever you want to redirect after success
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "An unexpected error occurred during Google sign-in"
    );
  }
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