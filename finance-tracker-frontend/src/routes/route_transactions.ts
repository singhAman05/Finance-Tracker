import { apiClient } from "@/utils/Error_handler";
import type { Transaction } from "@/types/interfaces";

interface TransactionResponse {
  message: string;
  data: Transaction[];
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
    const data = await apiClient<SingleTransactionResponse>(
        "/api/transactions/add-transaction",
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );
    if (data.error) throw new Error(data.error.message);
    return data.result;
};

export const fetchTransactionsRoute = async () => {
    const data = await apiClient<TransactionResponse>(
        "/api/transactions/fetch-transactions",
        {
            method: "GET",
        }
    );
    if (data.error) throw new Error(data.error.message);
    return data.result;
};

export const deleteTransactionRoute = async (transaction_id: string) => {
    const data = await apiClient<{ message: string }>(
        `/api/transactions/delete-transaction/${transaction_id}`,
        {
            method: "DELETE",
        }
    );
    if (data.error) throw new Error(data.error.message);
    return data.result;
};
