import { apiClient } from "@/utils/Error_handler";
import type { Bill, BillInstance } from "@/types/interfaces";

interface BillResponse {
    message: string;
    data: Bill;
}

interface BillsListResponse {
    message: string;
    data: Bill[];
}

interface BillInstancesResponse {
    message: string;
    data: BillInstance[];
}

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
    const data = await apiClient<BillResponse>("/api/bills/create-bill", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (data.error) throw new Error(data.error.message);
    return data.result;
};

export const fetchBillsRoute = async () => {
    const data = await apiClient<BillsListResponse>("/api/bills/fetch-bills", {
        method: "GET",
    });
    if (data.error) throw new Error(data.error.message);
    return data.result;
};

export const fetchBillInstancesRoute = async () => {
    const data = await apiClient<BillInstancesResponse>("/api/bills/fetch-bill-instances", {
        method: "GET",
    });
    if (data.error) throw new Error(data.error.message);
    return data.result;
};

export const payBillInstanceRoute = async (bill_instance_id: string) => {
    const data = await apiClient<{ message: string }>(
        `/api/bills/pay-bill/${bill_instance_id}`,
        {
            method: "POST",
        }
    );
    if (data.error) throw new Error(data.error.message);
    return data.result;
};
