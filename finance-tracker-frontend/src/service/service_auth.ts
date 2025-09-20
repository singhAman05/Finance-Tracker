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
    const res = await signIn("google", { 
      redirect: false, // This prevents automatic redirect
    });
    
    console.log("Google sign-in result:", res);
    
    // The response object typically contains:
    // - ok: boolean indicating if the sign-in was successful
    // - url: string with the redirect URL if successful
    // - error: string with error message if failed
    // - status: number indicating the status
    
    if (res?.error) {
      console.error("Google sign-in failed:", res.error);
      throw new Error(res.error);
    }
    
    if (res?.url) {
      console.log("Redirect URL:", res.url);
      // You can parse the URL to extract parameters if needed
      const url = new URL(res.url);
      const params = new URLSearchParams(url.search);
      
      // If you need to extract specific parameters from the redirect URL
      console.log("URL parameters:", Object.fromEntries(params.entries()));
      
      // You can manually redirect if needed
      // window.location.href = res.url;
    }
    
    return res;
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