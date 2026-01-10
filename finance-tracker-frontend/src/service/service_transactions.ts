import { addTransactionRoute, fetchTransactionsRoute, deleteTransactionRoute } from "@/routes/route_transactions";

export const createTransaction = async (payload: {
    account_id: string;
    category_id: string;
    amount: number;
    type: string;
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
    try{
        const result = await deleteTransactionRoute(transaction_id);
        return result;
      }
      catch(error){
        console.error("Failed to delete transaction:", error);
        throw error;
      }
};