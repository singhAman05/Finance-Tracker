import { apiClient } from "@/utils/Error_handler";

export const addTransactionRoute = async (
    payload: {
        account_id: string;
        category_id: string;
        amount: number;
        date: string;
        description?: string;
        is_recurring?: boolean;
        recurrence_rule?: string;
    }
    ) => {
    const data =  await apiClient<any>(
        "/api/transactions/add-transaction",
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );
    return data.result;
}


export const fetchTransactionsRoute = async()=>{
    const data = await apiClient<any>(
        `/api/transactions/fetch-transactions`,
        {
            method: "GET",
        }
    )
    return data.result
}

export const deleteTransactionAPI = async(transaction_id: string)=>{
    return await apiClient<any>(
        `/api/transactions/delete-transaction/${transaction_id}`,
        {
            method: "DELETE",
        }
    );
}
