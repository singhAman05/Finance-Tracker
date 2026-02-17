import { Request, Response } from "express";
import {
    createBudget,
    fetchBudgets,
    deleteBudget,
    updateBudget,
    fetchBudgetSummary
} from "../services/service_budgets";
import { getCache, setCache, deleteCache } from "../utils/cacheUtils";

export const handleBudgetCreation = async (req: Request, res: Response) => {
    const user = (req as any).user.payload;
    const client_id = user.id;

    const {
        category_id,
        name,
        amount,
        period_type,
        start_date,
        end_date,
        notes,
    } = req.body;

    // Basic validation (you can move this to validationUtils later)
    if (!category_id || !amount || !period_type || !start_date || !end_date) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    try {
        const payload = {
            client_id,
            category_id,
            name: name?.trim() || null,
            amount: parseFloat(amount),
            period_type,
            start_date,
            end_date,
            notes: notes?.trim() || null,
        };

        const result = await createBudget(payload);

        if (result.error) {
            console.error("Budget creation error:", result.error);
            res.status(500).json({ message: "Failed to create budget" });
            return;
        }

        // Invalidate cache
        const cacheKey = `budgets:${client_id}`;
        await deleteCache(cacheKey);

        res.status(201).json({
            message: "Budget created successfully",
            data: result.data,
        });
    } catch (err) {
        console.error("Unexpected budget creation error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const handleBudgetFetch = async (req: Request, res: Response) => {
    const user = (req as any).user.payload;
    const client_id = user.id;
    const cacheKey = `budgets:${client_id}`;

    try {
        // Check cache first
        const cached = await getCache(cacheKey);
        if (cached) {
            res.status(200).json({
                message: "Budgets from Cache",
                data: cached,
            });
            return;
        }

        const result = await fetchBudgets(client_id);

        if (result.data && result.data.length === 0) {
            res.status(200).json({
                message: "No Budgets Found",
                data: result.data,
            });
            return;
        }

        if (result.error) {
            console.error("Budget fetch error:", result.error);
            res.status(405).json({ message: `${result.error}` });
            return;
        }

        // Cache for 1 hour
        await setCache(cacheKey, result.data, 3600);

        res.status(200).json({
            message: "Budgets fetched",
            data: result.data,
        });
    } catch (err) {
        console.error("Budget fetch failed:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const handleBudgetDeletion = async (req: Request, res: Response) => {
    const { budget_id } = req.params;
    const user = (req as any).user.payload;
    const client_id = user.id;

    try {
        const result = await deleteBudget(budget_id, client_id);

        if (result.error) {
            console.error("Budget deletion error:", result.error);
            res.status(404).json({
                message: "Budget not found or unauthorized",
            });
            return;
        }

        const cacheKey = `budgets:${client_id}`;
        await deleteCache(cacheKey);

        res.status(200).json({
            message: "Budget deleted successfully",
            data: { budget_id },
        });
    } catch (err) {
        console.error("Budget deletion failed:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const handleBudgetUpdate = async (req: Request, res: Response) => {
    const { budget_id } = req.params;
    const user = (req as any).user.payload;
    const client_id = user.id;

    try {
        const result = await updateBudget(budget_id, client_id, req.body);

        if (result.error) {
            console.error("Budget update error:", result.error);
            res.status(404).json({
                message: "Budget not found or unauthorized",
            });
            return;
        }

        const cacheKey = `budgets:${client_id}`;
        await deleteCache(cacheKey);

        res.status(200).json({
            message: "Budget updated successfully",
            data: result.data,
        });
    } catch (err) {
        console.error("Budget update failed:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const handleBudgetSummary = async (req: Request, res: Response) => {
    const user = (req as any).user.payload;
    const client_id = user.id;
    const cacheKey = `budgets:summary:${client_id}`;

    try {
        const cached = await getCache(cacheKey);
        if (cached) {
            res.status(200).json({
                message: "Budget summary from cache",
                data: cached,
            });
            return;
        }

        const result = await fetchBudgetSummary(client_id);

        if (result.error) {
            console.error("Budget summary error:", result.error);
            res.status(500).json({
                message: "Failed to fetch budget summary",
            });
            return;
        }
        await setCache(cacheKey, result.data, 900); // 15 mins

        res.status(200).json({
            message: "Budget summary fetched",
            data: result.data,
        });
    } catch (err) {
        console.error("Budget summary failed:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
