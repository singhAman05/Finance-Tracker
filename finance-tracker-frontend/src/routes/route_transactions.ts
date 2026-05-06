import { apiClient } from "@/utils/Error_handler";
import type { Transaction } from "@/types/interfaces";

interface TransactionResponse {
  message: string;
  data: Transaction[];
  pagination?: { page: number; limit: number; total: number; pages: number };
}

interface SingleTransactionResponse {
  message: string;
  data: Transaction;
}

export const addTransactionRoute = async (
    payload: {
        account_id: string;
        category_id: string;
        amount: number;
        type: string;
        date: string;
        description?: string;
        is_recurring?: boolean;
        recurrence_rule?: string;
    }
) => {
    const res = await apiClient<SingleTransactionResponse>(
        "/api/transactions/add-transaction",
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );
    if (res.error) throw new Error(res.error.message);
    return res.result;
};

export const fetchTransactionsRoute = async (
    page = 1,
    limit = 20,
    options?: { start_date?: string; end_date?: string }
) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (options?.start_date) params.set("start_date", options.start_date);
    if (options?.end_date) params.set("end_date", options.end_date);

    const res = await apiClient<TransactionResponse>(
        `/api/transactions/fetch-transactions?${params.toString()}`,
        { method: "GET" }
    );
    if (res.error) throw new Error(res.error.message);
    return res.result;
};

export const deleteTransactionRoute = async (transaction_id: string) => {
    const res = await apiClient<{ message: string }>(
        `/api/transactions/delete-transaction/${transaction_id}`,
        {
            method: "DELETE",
        }
    );
    if (res.error) throw new Error(res.error.message);
    return res.result;
};
