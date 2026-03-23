import { Request, Response } from "express";
import { fetchTransactions, createTransaction, deleteTransaction } from "../services/service_transactions";
import { validateTransactionPayload } from "../utils/validationUtils";
import { getCache, setCache, deleteCache } from "../utils/cacheUtils";
import { parsePagination, buildPaginationMeta } from "../utils/paginationUtils";

export const handleTransactionsAdd = async (req: Request, res: Response) => {
    const user = (req as any).user.payload;
    const client_id = user.id;

    const validation = validateTransactionPayload({ ...req.body, client_id });

    if (!validation.valid) {
        res.status(400).json({ success: false, message: validation.message });
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
            console.error("Transaction creation error:", result.error);
            res.status(500).json({ success: false, message: "Failed to add transaction." });
            return;
        }

        // Invalidate cache after successful insert
        const cacheKey = `transactions:${client_id}`;
        await deleteCache(cacheKey);
        await deleteCache(`budgets:summary:${client_id}`);
        // Also invalidate accounts cache since balance was updated
        await deleteCache(`accounts:${client_id}`);

        res.status(201).json({ message: "Transaction added", data: result.data });
    } catch (err) {
        console.error("Transaction creation error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const handleTransactionsFetch = async (req: Request, res: Response) => {
    const user = (req as any).user.payload;
    const client_id = user.id;
    const { page, limit, from, to } = parsePagination(req);
    const cacheKey = `transactions:${client_id}:${page}:${limit}`;

    try {
        const cached = await getCache(cacheKey);
        if (cached) {
            res.status(200).json({ message: "Transactions from Cache", ...cached });
            return;
        }

        const result = await fetchTransactions(client_id, { from, to });

        if (result.data && result.data.length === 0) {
            res.status(200).json({ message: "No Transactions made", data: result.data, pagination: buildPaginationMeta(page, limit, result.count) });
            return;
        }

        // --- #17/#18: Don't leak Supabase error details ---
        if (result.error) {
            console.error("Cannot Fetch Transactions from DB:", result.error);
            res.status(500).json({ success: false, message: "Failed to fetch transactions" });
            return;
        }

        const responseBody = {
            data: result.data,
            pagination: buildPaginationMeta(page, limit, result.count),
        };

        await setCache(cacheKey, responseBody, 3600); // 1 hour TTL

        res.status(200).json({ message: "Transactions fetched", ...responseBody });
    } catch (err) {
        console.error("Transaction fetch error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const handleTransactionDelete = async (req: Request, res: Response) => {
    const { transaction_id } = req.params;
    const user = (req as any).user.payload;
    const client_id = user.id;
    try {
        const result = await deleteTransaction(transaction_id, client_id);

        if (result.error) {
            console.error("Transaction deletion error:", result.error);
            res.status(404).json({ success: false, message: "Transaction not found or unauthorized" });
            return;
        }

        const cacheKey = `transactions:${client_id}`;
        await deleteCache(cacheKey);
        await deleteCache(`budgets:summary:${client_id}`);
        // Also invalidate accounts cache since balance was reversed
        await deleteCache(`accounts:${client_id}`);

        res.status(200).json({
            message: "Transaction deleted successfully",
            data: { transaction_id },
        });
    } catch (err) {
        console.error("Transaction deletion failed:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
