import { addTransactionRoute, fetchTransactionsRoute } from "@/routes/route_transactions";

export const addTransactionService = async (payload: {
    account_id: string;
    category_id: string;
    amount: number;
    date: string;
    description?: string;
    is_recurring?: boolean;
    recurrence_rule?: string;
    }) => {
    const result = await addTransactionRoute(payload);
    return result;
};

export const fetchTransactions = async()=>{
    const result = await fetchTransactionsRoute();
    console.log("Fetched transactions in service:", result);
    return result;
}

export const deleteTransaction = async(transaction_id : string)=>{
    return {data: null, error: null};
};