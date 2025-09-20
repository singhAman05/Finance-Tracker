import { apiClient, } from "@/utils/Error_handler";

export function callAddTransactionAPI(
    payload: {
        account_id: string;
        category_id: string;
        amount: number;
        date: string;
        description?: string;
        is_recurring?: boolean;
        recurrence_rule?: string;
    }
    ) {
    return apiClient<any>(
        "/api/transactions/add-transaction",
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );
}


export const fetchTransactionAPI = async()=>{
    const data = await apiClient<any>(
        `/api/transactions/fetch-transactions`,
        {
            method: "GET",
        }
    )
    return data.data
}
