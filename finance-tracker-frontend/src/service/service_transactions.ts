import { callAddTransactionAPI, fetchTransactionAPI } from "@/routes/route_transactions";

export const addTransactionService = async (payload: {
    account_id: string;
    category_id: string;
    amount: number;
    date: string;
    description?: string;
    is_recurring?: boolean;
    recurrence_rule?: string;
    }) => {
    return await callAddTransactionAPI(payload);
};

export const fetchTransactions = async()=>{
    return await fetchTransactionAPI();
}
