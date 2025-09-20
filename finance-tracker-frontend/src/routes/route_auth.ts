export const loginRoute = async (phone: string) => {
  try {
    const response = await fetch("http://localhost:8000/api/auth/login", {
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
