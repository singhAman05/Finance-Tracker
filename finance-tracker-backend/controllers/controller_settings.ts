import { Request, Response } from "express";
import { clearHistoryService, exportUserDataService, getSettingsService, updateSettingsService } from "../services/service_settings";
import { deleteCache, deleteCacheByPrefix } from "../utils/cacheUtils";

// --- #9: Allowed values for settings validation ---
const ALLOWED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SGD', 'AED', 'SAR'];
const ALLOWED_DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'DD.MM.YYYY'];

export const handleGetSettings = async (req: Request, res: Response) => {
    try {
        const payload = (req as any).user.payload;
        if (!payload || !payload.id) {
            res.status(401).json({ success: false, message: "Unauthorized: Invalid user payload" });
            return;
        }

        const settings = await getSettingsService(payload.id);
        res.status(200).json({ success: true, message: "Settings fetched successfully", data: settings });
    } catch (error) {
        console.error("Error in handleGetSettings:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const handleUpdateSettings = async (req: Request, res: Response) => {
    try {
        const payload = (req as any).user.payload;
        if (!payload || !payload.id) {
            res.status(401).json({ success: false, message: "Unauthorized: Invalid user payload" });
            return;
        }

        const { currency, date_format, notify_bills, notify_budgets, notify_recurring } = req.body;

        // --- #9: Validate settings values ---
        if (currency !== undefined && !ALLOWED_CURRENCIES.includes(currency)) {
            res.status(400).json({
                success: false,
                message: `Invalid currency. Allowed: ${ALLOWED_CURRENCIES.join(', ')}`
            });
            return;
        }

        if (date_format !== undefined && !ALLOWED_DATE_FORMATS.includes(date_format)) {
            res.status(400).json({
                success: false,
                message: `Invalid date format. Allowed: ${ALLOWED_DATE_FORMATS.join(', ')}`
            });
            return;
        }

        if (notify_bills !== undefined && typeof notify_bills !== 'boolean') {
            res.status(400).json({ success: false, message: "notify_bills must be a boolean" });
            return;
        }
        if (notify_budgets !== undefined && typeof notify_budgets !== 'boolean') {
            res.status(400).json({ success: false, message: "notify_budgets must be a boolean" });
            return;
        }
        if (notify_recurring !== undefined && typeof notify_recurring !== 'boolean') {
            res.status(400).json({ success: false, message: "notify_recurring must be a boolean" });
            return;
        }

        // Build settings object, only including provided fields
        const settingsToUpdate: Record<string, unknown> = {};
        if (currency !== undefined) settingsToUpdate.currency = currency;
        if (date_format !== undefined) settingsToUpdate.date_format = date_format;
        if (notify_bills !== undefined) settingsToUpdate.notify_bills = notify_bills;
        if (notify_budgets !== undefined) settingsToUpdate.notify_budgets = notify_budgets;
        if (notify_recurring !== undefined) settingsToUpdate.notify_recurring = notify_recurring;

        const updatedSettings = await updateSettingsService(payload.id, settingsToUpdate);
        
        res.status(200).json({
            success: true,
            message: "Settings updated successfully",
            data: updatedSettings
        });
    } catch (error) {
        console.error("Error in handleUpdateSettings:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const handleExportUserData = async (req: Request, res: Response) => {
    try {
        const payload = (req as any).user.payload;
        if (!payload || !payload.id) {
            res.status(401).json({ success: false, message: "Unauthorized: Invalid user payload" });
            return;
        }

        const data = await exportUserDataService(payload.id);
        res.status(200).json({ success: true, message: "Data export prepared", data });
    } catch (error) {
        console.error("Error in handleExportUserData:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const handleClearHistory = async (req: Request, res: Response) => {
    try {
        const payload = (req as any).user.payload;
        if (!payload || !payload.id) {
            res.status(401).json({ success: false, message: "Unauthorized: Invalid user payload" });
            return;
        }

        const result = await clearHistoryService(payload.id);

        await deleteCacheByPrefix(`transactions:${payload.id}:`);
        await deleteCacheByPrefix(`accounts:${payload.id}:`);
        await deleteCacheByPrefix(`bills:${payload.id}:`);
        await deleteCacheByPrefix(`bill_instances:${payload.id}:`);
        await deleteCacheByPrefix(`budgets:${payload.id}:`);
        await deleteCache(`budgets:summary:${payload.id}`);

        res.status(200).json({ success: true, message: "History cleared successfully", data: result });
    } catch (error) {
        console.error("Error in handleClearHistory:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
