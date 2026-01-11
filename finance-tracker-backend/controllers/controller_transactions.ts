import { Request, Response } from "express";
import { fetchTransactions, createTransaction, deleteTransaction } from "../services/service_transactions";
import { validateTransactionPayload } from "../utils/validationUtils";
import { getCache, setCache, deleteCache } from "../utils/cacheUtils";
import { captureRejectionSymbol } from "events";

export const handleTransactionsAdd = async (req: Request, res: Response) => {
    const user = (req as any).user.payload;
    const client_id = user.id;

    const validation = validateTransactionPayload({ ...req.body, client_id });

    if (!validation.valid) {
        res.status(400).json({ message: validation.message });
        return;
    }

    const {
        account_id,
        category_id,
        amount,
        type,
        date,
        description,
        is_recurring,
        recurrence_rule,
    } = req.body;

    const payload = {
        client_id,
        account_id,
        category_id,
        amount,
        type,
        date: date || new Date().toISOString().split("T")[0],
        description: description || null,
        is_recurring: is_recurring ?? false,
        recurrence_rule: recurrence_rule || null,
    };

    try {
        const result = await createTransaction(payload);

        if (result.error) {
            console.error("Supabase Error:", result.error);
            res.status(500).json({ message: "Failed to add transaction." });
            return;
        }

        // Invalidate cache after successful insert
        const cacheKey = `transactions:${client_id}`;
        await deleteCache(cacheKey);

        res.status(201).json({ message: "Transaction added", data: result.data });
    } catch (err) {
        console.error("Unexpected Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const handleTransactionsFetch = async (req: Request, res: Response) => {
    const user = (req as any).user.payload;
    const client_id = user.id;
    const cacheKey = `transactions:${client_id}`;

    try {
        // Try to get from Redis cache first
        // console.log("Fetched Transactions from DB: Attempting to get from cache");
        const cached = await getCache(cacheKey);
        if (cached) {
            console.log("Serving transactions from Redis cache");
            res.status(200).json({ message: `Transactions from Cache`, data: cached });
            return;
        }

        // If not found in cache, fetch from DB
        const result = await fetchTransactions(client_id);

        if (result.data && result.data.length === 0) {
            // console.log(`No Transactions made by user: ${client_id} : `, result.data);
            res.status(200).json({ message: `No Transactions made`, data: result.data });
            return;
        }

        if (result.error) {
            console.log(`Cannot Fetch Transactions from DB`);
            res.status(405).json({ message: `${result.error}` });
            return;
        }
        // console.log("Fetched Transactions from DB:", result.data);
        // Set cache for future
        await setCache(cacheKey, result.data, 3600); // 1 hour TTL

        res.status(200).json({ message: `Transactions fetched`, data: result.data });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Internal Server Error` });
    }
};

export const handleTransactionDelete = async (req: Request, res: Response) => {
    const { transaction_id } = req.params;
    const user = (req as any).user.payload;
    const client_id = user.id;
    try {
        const result = await deleteTransaction(transaction_id, client_id);

        if (result.error) {
            console.log("Transaction deletion error:", result.error);
            res.status(404).json({ message: "Transaction not found or unauthorized" });
            return;
        }

        const cacheKey = `transactions:${client_id}`;
        await deleteCache(cacheKey);

        res.status(200).json({
            message: "Transaction deleted successfully",
            data: { transaction_id },
        });
    } catch (err) {
        console.error("Transaction deletion failed:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
}
