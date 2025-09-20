import { loginRoute } from "@/routes/route_auth";
import { login } from "@/components/redux/slices/slice_auth";
import { AppDispatch } from "@/app/store"; // Adjust if your store file is elsewhere

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
