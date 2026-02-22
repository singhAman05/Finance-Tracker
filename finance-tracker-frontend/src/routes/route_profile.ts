import { baseUrl } from "@/utils/Error_handler";

export const profileRoute = async (profile_update: any): Promise<void> => {
  try {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const response = await fetch(`${baseUrl}/api/profile/complete_profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile_update),
    });

    const data = await response.json();

    if (response.status !== 201) {
      console.error("Profile update failed:", data);
      throw new Error(data?.message || "Profile update failed.");
    }

    console.log("Profile updated successfully:", data);

    // Save user safely to localStorage
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  } catch (error) {
    console.error("ProfileRoute Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Unexpected profile update error."
    );
  }
};
