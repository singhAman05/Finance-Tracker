import { toast } from "sonner";

export interface ApiResult<T> {
    data: T | null;
    error: string | null;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function apiClient<T = any>(
    path: string,
    options: RequestInit = {}
): Promise<ApiResult<T>> {
  // Safely access localStorage in the browser
    const token =
        typeof window !== "undefined" ? localStorage.getItem("jwt") : null;

    if (!token) {
        toast.error("Not authenticated");
        window.location.href = "/login";
        return { data: null, error: "User not authenticated" };
    }

    try {
        const { headers: userHeaders, ...rest } = options;
        const url = baseUrl ? new URL(path, baseUrl).toString() : path;

        const response = await fetch(url, {
        ...rest,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(userHeaders as Record<string, string>),
        },
        });

        // Handle auth errors (401/403)
        if (response.status === 401 || response.status === 403) {
        toast.error("Session expired. Redirecting to login…");
        window.location.href = "/login";
        return { data: null, error: "Authentication required" };
        }

        const result = await response.json();

        if (!response.ok) {
        const errorMsg = result?.message || "Something went wrong";
        toast.error(errorMsg);
        return { data: null, error: errorMsg };
        }
        // console.log(result)
        // If the backend wraps data in a `data` field, return that; otherwise return the whole result
        return { data: (result.data ?? result) as T, error: null };
    } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Network error";
        toast.error(errorMsg);
        return { data: null, error: errorMsg };
    }
}
