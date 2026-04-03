import { Request, Response } from "express";
import {
    createBudget,
    fetchBudgets,
    deleteBudget,
    updateBudget,
    fetchBudgetSummary
} from "../services/service_budgets";
import { getCache, setCache, deleteCache, deleteCacheByPrefix } from "../utils/cacheUtils";
import { parsePagination, buildPaginationMeta } from "../utils/paginationUtils";

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
    if (!category_id || amount === undefined || !period_type || !start_date || !end_date) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    const parsedAmount = Number(amount);
    const allowedPeriods = ["weekly", "monthly", "quarterly", "yearly", "custom"];

    if (!allowedPeriods.includes(period_type)) {
        res.status(400).json({ message: "Invalid period type" });
        return;
    }

    if (isNaN(parsedAmount) || parsedAmount < 0) {
        res.status(400).json({ message: "Invalid amount" });
        return;
    }
    if (new Date(start_date) >= new Date(end_date)) {
        res.status(400).json({
            message: "End date must be after start date"
        });
        return;
    }

    try {
        const payload = {
            client_id,
            category_id,
            name: name?.trim() || null,
            amount: parsedAmount,
            period_type,
            start_date,
            end_date,
            notes: notes?.trim() || null,
        };

        const result = await createBudget(payload);

        if (result.error?.message.includes("exclusion")) {
            res.status(400).json({
                message: "Budget overlaps with an existing budget for this category"
            });
            return;
        }

        if (result.error) {
            console.error("Budget creation error:", result.error);
            res.status(500).json({ message: "Failed to create budget" });
            return;
        }

        // Invalidate cache
        await deleteCacheByPrefix(`budgets:${client_id}:`);
        await deleteCache(`budgets:summary:${client_id}`);

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
    const { page, limit, from, to } = parsePagination(req);
    const cacheKey = `budgets:${client_id}:${page}:${limit}`;

    try {
        // Check cache first
        const cached = await getCache(cacheKey);
        if (cached) {
            res.status(200).json({
                message: "Budgets from Cache",
                ...cached,
            });
            return;
        }

        const result = await fetchBudgets(client_id, { from, to });

        if (result.data && result.data.length === 0) {
            res.status(200).json({
                message: "No Budgets Found",
                data: result.data,
                pagination: buildPaginationMeta(page, limit, result.count),
            });
            return;
        }

        if (result.error) {
            console.error("Budget fetch error:", result.error);
            res.status(500).json({ success: false, message: "Failed to fetch budgets" });
            return;
        }

        const responseBody = {
            data: result.data,
            pagination: buildPaginationMeta(page, limit, result.count),
        };

        // Cache for 1 hour
        await setCache(cacheKey, responseBody, 3600);

        res.status(200).json({
            message: "Budgets fetched",
            ...responseBody,
        });
    } catch (err) {
        console.error("Budget fetch failed:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
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

        await deleteCacheByPrefix(`budgets:${client_id}:`);
        await deleteCache(`budgets:summary:${client_id}`);

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
        const existingBudgets = await fetchBudgets(client_id);
        const budgetToUpdate = existingBudgets.data?.find((b: any) => b.id === budget_id);

        if (budgetToUpdate && budgetToUpdate.is_active === false) {
            res.status(400).json({ message: "Cannot update an expired budget" });
            return;
        }

        // --- #8: Whitelist allowed fields (prevent mass-assignment) ---
        const { amount, period_type, start_date, end_date, notes, name } = req.body;
        const safeUpdates: Record<string, unknown> = {};
        if (amount !== undefined) safeUpdates.amount = amount;
        if (period_type !== undefined) safeUpdates.period_type = period_type;
        if (start_date !== undefined) safeUpdates.start_date = start_date;
        if (end_date !== undefined) safeUpdates.end_date = end_date;
        if (notes !== undefined) safeUpdates.notes = notes;
        if (name !== undefined) safeUpdates.name = name;

        const result = await updateBudget(budget_id, client_id, safeUpdates);

        if (result.error) {
            console.error("Budget update error:", result.error);
            res.status(404).json({
                message: "Budget not found or unauthorized",
            });
            return;
        }

        await deleteCacheByPrefix(`budgets:${client_id}:`);
        await deleteCache(`budgets:summary:${client_id}`);

        res.status(200).json({
            message: "Budget updated successfully",
            data: result.data,
        });
    } catch (err) {
        console.error("Budget update failed:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const handleBudgetExpire = async (req: Request, res: Response) => {
    const { budget_id } = req.params;
    const user = (req as any).user.payload;
    const client_id = user.id;

    try {
        const today = new Date().toISOString().split("T")[0];

        // Update both end_date and is_active explicitly to end the budget early
        const updates = {
            end_date: today,
            is_active: false
        };

        const result = await updateBudget(budget_id, client_id, updates);

        if (result.error) {
            console.error("Budget expire error:", result.error);
            res.status(404).json({
                message: "Budget not found or unauthorized",
            });
            return;
        }

        await deleteCacheByPrefix(`budgets:${client_id}:`);
        await deleteCache(`budgets:summary:${client_id}`);

        res.status(200).json({
            message: "Budget successfully ended early",
            data: result.data,
        });
    } catch (err) {
        console.error("Budget expire failed:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const handleBudgetSummary = async (req: Request, res: Response) => {
    const user = (req as any).user.payload;
    const client_id = user.id;
    const cacheKey = `budgets:summary:${client_id}`;

    try {
        // --- #21: Re-enabled budget summary cache read ---
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
