import { notify } from "@/lib/notifications";

export interface ApiResult<T> {
    result: T | null;
    error: {
        message: string;
        status?: number;
        details?: any;
        type: "AUTH" | "NETWORK" | "SERVER" | "VALIDATION" | "UNKNOWN";
    } | null;
}

function notifyApiError(error: ApiResult<any>["error"]) {
    if (!error) return;

    switch (error.type) {
        case "AUTH":
            notify.error("Your session has expired. Please login again.");
            break;
        case "VALIDATION":
            notify.warning(error.message || "Validation error");
            break;
        case "NETWORK":
            notify.error("Network connection lost");
            break;
        case "SERVER":
            notify.error("Server is currently unavailable");
            break;
        default:
            notify.error(error.message || "Unexpected error occurred");
    }
}

function redirectToLogin() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("jwt");
        window.location.replace("/login");
    }
}

export const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function apiClient<T = any>(
    path: string,
    options: RequestInit = {}
): Promise<ApiResult<T>> {
    const token =
        typeof window !== "undefined" ? localStorage.getItem("jwt") : null;

    // 1. Pre-fetch Auth Check
    if (!token) {
        const error = {
            message: "Session missing",
            status: 401,
            type: "AUTH" as const,
        };
        notifyApiError(error);
        redirectToLogin();
        return { result: null, error };
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

        // 2. HTTP Errors
        if (!response.ok) {
            let errorData: any = {};
            try {
                errorData = await response.json();
            } catch {
                errorData.message = "Unable to parse server response";
            }

            const status = response.status;
            let error: ApiResult<any>["error"];

            if (status === 401 || status === 403) {
                error = {
                    message: "Unauthorized",
                    status,
                    type: "AUTH",
                };
                notifyApiError(error);
                redirectToLogin();
                return { result: null, error };
            }

            if (status === 400 || status === 422) {
                error = {
                    message: errorData.message || "Validation failed",
                    status,
                    type: "VALIDATION",
                    details: errorData.errors,
                };
                notifyApiError(error);
                return { result: null, error };
            }

            if (status >= 500) {
                error = {
                    message: "Server is currently unavailable",
                    status,
                    type: "SERVER",
                };
                notifyApiError(error);
                return { result: null, error };
            }

            error = {
                message: errorData.message || "Request failed",
                status,
                type: "UNKNOWN",
            };
            notifyApiError(error);
            return { result: null, error };
        }

        // 3. Success
        const result = await response.json();
        return { result: result as T, error: null };

    } catch (err: unknown) {
        const isNetwork =
            err instanceof TypeError && err.message === "Failed to fetch";

        const error = {
            message: isNetwork
                ? "Network connection lost"
                : "An unexpected error occurred",
            type: isNetwork ? "NETWORK" : "UNKNOWN",
        } as const;

        notifyApiError(error);
        return { result: null, error };
    }
}
