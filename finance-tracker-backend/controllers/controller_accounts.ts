import { Request, Response } from "express";
import { creatingAccount, fetchAllaccounts, deleteAccount, processRecurringAccounts, fetchRecurringAccounts } from "../services/service_accounts";
import { validateAccount, validateAccountDetails } from "../utils/validationUtils";
import { getCache, setCache, deleteCache } from "../utils/cacheUtils";
import { parsePagination, buildPaginationMeta } from "../utils/paginationUtils";

export const handleAccountCreation = async (req: Request, res: Response) => {
    const {
        bank_name,
        account_type,
        balance,
        currency,
        account_holder_name,
        account_number_last4,
    } = req.body;

    const user = (req as any).user.payload;
    const client_id = user.id;

    try {
        const isValid = await validateAccount(bank_name, account_type);
        if (!isValid.valid) {
            res.status(400).json({ success: false, message: isValid.message });
            return;
        }

        // --- #16: Validate balance, currency, and account_number_last4 ---
        const detailsCheck = validateAccountDetails(balance, currency, account_number_last4);
        if (!detailsCheck.valid) {
            res.status(400).json({ success: false, message: detailsCheck.message });
            return;
        }

        const account_payload = {
            client_id,
            bank_name: bank_name.trim(),
            account_type,
            balance: parseFloat(balance),
            currency,
            account_holder_name: account_holder_name.trim(),
            account_number_last4: account_number_last4.trim(),
        };

        const result = await creatingAccount(account_payload);
        if (result.error) {
            console.error("Account creation error:", result.error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
            return;
        }

        // Invalidate cache after new account is added
        const cacheKey = `accounts:${client_id}`;
        await deleteCache(cacheKey);
        res.status(201).json({ message: "Account added Successfully", data: result.data });
    } catch (err) {
        console.error("Account addition failed:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const handleAccountFetch = async (req: Request, res: Response) => {
    const user = (req as any).user.payload;
    const client_id = user.id;
    const { page, limit, from, to } = parsePagination(req);
    const cacheKey = `accounts:${client_id}:${page}:${limit}`;

    try {
        // Try to fetch from Redis cache
        const cached = await getCache(cacheKey);
        if (cached) {
            res.status(200).json({ message: "Accounts from Cache", ...cached });
            return;
        }

        // Fetch from DB with pagination
        const result = await fetchAllaccounts(client_id, { from, to });

        if (result.data && result.data.length === 0) {
            res.status(200).json({ message: "No linked accounts", data: result.data, pagination: buildPaginationMeta(page, limit, result.count) });
            return;
        }

        // --- #17/#18: Don't leak Supabase error details to client ---
        if (result.error) {
            console.error("Cannot Fetch Accounts from DB:", result.error);
            res.status(500).json({ success: false, message: "Failed to fetch accounts" });
            return;
        }

        const responseBody = {
            data: result.data,
            pagination: buildPaginationMeta(page, limit, result.count),
        };

        // Cache the result
        await setCache(cacheKey, responseBody, 3600); // 1 hour TTL

        res.status(200).json({ message: "Accounts Fetched", ...responseBody });
    } catch (err) {
        console.error("Account fetch error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const handleAccountDeletion = async (req: Request, res: Response) => {
    const { account_id } = req.params;
    const user = (req as any).user.payload;
    const client_id = user.id;
    try {
        const result = await deleteAccount(account_id, client_id);

        if (result.error) {
            console.error("Account deletion error:", result.error);
            res.status(404).json({ success: false, message: "Account not found or unauthorized" });
            return;
        }

        const cacheKey = `accounts:${client_id}`;
        await deleteCache(cacheKey);

        res.status(200).json({
            message: "Account deleted successfully",
            data: { account_id },
        });
    } catch (err) {
        console.error("Account deletion failed:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const handleProcessRecurring = async (req: Request, res: Response) => {
    const user = (req as any).user.payload;
    const client_id = user.id;
    try {
        const result = await processRecurringAccounts(client_id);
        await deleteCache(`accounts:${client_id}`);
        res.status(200).json({
            message: "Recurring accounts processed",
            processed: result.processed,
        });
    } catch (err) {
        console.error("processRecurringAccounts error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const handleFetchRecurring = async (req: Request, res: Response) => {
    const user = (req as any).user.payload;
    const client_id = user.id;
    try {
        const result = await fetchRecurringAccounts(client_id);
        if (result.error) {
            console.error("fetchRecurringAccounts error:", result.error);
            res.status(500).json({ success: false, message: "Failed to fetch recurring accounts" });
            return;
        }
        res.status(200).json({ message: "Recurring accounts fetched", data: result.data });
    } catch (err) {
        console.error("fetchRecurringAccounts error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
