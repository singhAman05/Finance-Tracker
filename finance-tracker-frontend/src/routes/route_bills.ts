import { apiClient } from "@/utils/Error_handler";

export interface CreateBillPayload {
    account_id?: string;
    system_category_id: string;
    name: string;
    amount: number;
    is_recurring?: boolean;
    recurrence_type?: "weekly" | "monthly" | "quarterly" | "yearly";
    recurrence_interval?: number;
    start_date: string;
    end_date?: string;
    reminder_days_before?: number;
    notes?: string;
}

export const createBillRoute = async (payload: CreateBillPayload) => {
    const data = await apiClient<any>("/api/bills/create-bill", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return data.result;
};

export const fetchBillsRoute = async () => {
    const data = await apiClient<any>("/api/bills/fetch-bills", {
        method: "GET",
    });
    return data.result;
};

export const fetchBillInstancesRoute = async () => {
    const data = await apiClient<any>("/api/bills/fetch-bill-instances", {
        method: "GET",
    });
    return data.result;
};

export const payBillInstanceRoute = async (bill_instance_id: string) => {
    const data = await apiClient<any>(
        `/api/bills/pay-bill/${bill_instance_id}`,
        {
            method: "POST",
        }
    );
    return data.result;
};
