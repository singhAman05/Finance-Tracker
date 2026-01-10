export interface ApiResult<T> {
    result: T | null;
    error: {
        message: string;
        status?: number;
        details?: any; // For validation errors
        type: "AUTH" | "NETWORK" | "SERVER" | "VALIDATION" | "UNKNOWN";
    } | null;
}

function redirectToLogin() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("jwt");
        window.location.replace("/login"); // hard redirect (prevents back nav)
    }
}


const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function apiClient<T = any>(
    path: string,
    options: RequestInit = {}
    ): Promise<ApiResult<T>> {
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;

    // 1. Pre-fetch Auth Check
    if (!token) {
        redirectToLogin();
        return {
            result: null,
            error: { message: "Session missing", type: "AUTH", status: 401 }
        };
    }

    try {
        const { headers: userHeaders, ...rest } = options;
        const url = new URL(path, baseUrl).toString();

        const response = await fetch(url, {
        ...rest,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...userHeaders,
        },
        });

        // 2. Handle HTTP Errors
        if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = { message: "Unable to parse server response" };
        }

        const status = response.status;

        // Categorize common scenarios
        if (status === 401 || status === 403) {
            redirectToLogin();
        }
        if (status === 422 || status === 400) {
            return { result: null, error: { message: errorData.message || "Validation failed", status, type: "VALIDATION", details: errorData.errors } };
        }
        if (status >= 500) {
            return { result: null, error: { message: "Server is currently unavailable", status, type: "SERVER" } };
        }

        return { result: null, error: { message: errorData.message || "Request failed", status, type: "UNKNOWN" } };
        }

        // 3. Handle Success
        const result = await response.json();
        console.log("Error handler - API Response:", result);
        return {
        result: (result) as T,
        error: null
        };

    } catch (err: unknown) {
        const isNetwork = err instanceof TypeError && err.message === "Failed to fetch";
        return {
        result: null,
        error: {
            message: isNetwork ? "Network connection lost" : "An unexpected error occurred",
            type: isNetwork ? "NETWORK" : "UNKNOWN",
        },
        };
    }
}