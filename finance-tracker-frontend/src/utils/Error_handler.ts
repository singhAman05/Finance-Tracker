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
        sessionStorage.removeItem("user");
        window.location.replace("/login");
    }
}

export const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

/** Read a cookie value by name */
function getCookie(name: string): string | undefined {
    if (typeof document === "undefined") return undefined;
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : undefined;
}

export async function apiClient<T = any>(
    path: string,
    options: RequestInit = {}
): Promise<ApiResult<T>> {
    try {
        const { headers: userHeaders, ...rest } = options;
        const url = new URL(path, baseUrl).toString();

        const csrfToken = getCookie("csrf-token");

        const response = await fetch(url, {
            ...rest,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
                ...userHeaders,
            },
        });

        // HTTP Errors
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

        // Success
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
