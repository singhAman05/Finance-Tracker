import { Request, Response } from "express";
import { creatingAccount, fetchAllaccounts } from "../services/service_accounts";
import { validateAccount } from "../utils/validationUtils";
import { getCache, setCache, deleteCache } from "../utils/cacheUtils";

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
            res.status(400).json({ message: isValid.message });
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
            console.log(result.error);
            res.status(500).json({ message: `Internal Server Error` });
            return;
        }

        // Invalidate cache after new account is added
        const cacheKey = `accounts:${client_id}`;
        await deleteCache(cacheKey);
        res.status(201).json({ message: `Account added Successfully`, data: result.data });
    } catch (err) {
        console.log(`Account addition failed : ${err}`);
        res.status(500).json({ message: `Internal Server Error` });
    }
};

export const handleAccountFetch = async (req: Request, res: Response) => {
    const user = (req as any).user.payload;
    const client_id = user.id;
    const cacheKey = `accounts:${client_id}`;

    try {
        // Try to fetch from Redis cache
        const cached = await getCache(cacheKey);
        if (cached) {
            // console.log("Serving accounts from Redis cache");
            res.status(200).json({ message: `Accounts from Cache`, data: cached });
            return;
        }

        // Fetch from DB
        const result = await fetchAllaccounts(client_id);

        if (result.data && result.data.length === 0) {
            res.status(404).json({ message: `No linked accounts` });
            return;
        }

        if (result.error) {
            console.log(`Cannot Fetch Accounts from DB`);
            res.status(405).json({ message: `${result.error}` });
            return;
        }

        // Cache the result
        await setCache(cacheKey, result.data, 3600); // 1 hour TTL

        res.status(200).json({ message: `Accounts Fetched`, data: result.data });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Internal Server Error` });
    }
};
