import { apiClient } from "@/utils/Error_handler";
import type { User, ProfilePayload } from "@/types/interfaces";

interface ProfileResponse {
  message: string;
  user: User;
}

export const profileRoute = async (profile_update: ProfilePayload) => {
  const data = await apiClient<ProfileResponse>("/api/profile/complete_profile", {
    method: "POST",
    body: JSON.stringify(profile_update),
  });

  if (data.error) throw new Error(data.error.message);

  // Save user safely to sessionStorage
  if (data.result?.user) {
    sessionStorage.setItem("user", JSON.stringify(data.result.user));
  }

  return data.result;
};
