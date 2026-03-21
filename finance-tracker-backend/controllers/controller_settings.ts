import { Request, Response } from "express";
import { getSettingsService, updateSettingsService } from "../services/service_settings";

export const handleGetSettings = async (req: Request, res: Response) => {
    try {
        const payload = (req as any).user.payload;
        if (!payload || !payload.id) {
            res.status(401).json({ success: false, message: "Unauthorized: Invalid user payload" });
            return;
        }

        const settings = await getSettingsService(payload.id);
        res.status(200).json({ success: true, message: "Settings fetched successfully", result: settings });
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
        
        // Build settings object, only including provided fields
        const settingsToUpdate: any = {};
        if (currency !== undefined) settingsToUpdate.currency = currency;
        if (date_format !== undefined) settingsToUpdate.date_format = date_format;
        if (notify_bills !== undefined) settingsToUpdate.notify_bills = notify_bills;
        if (notify_budgets !== undefined) settingsToUpdate.notify_budgets = notify_budgets;
        if (notify_recurring !== undefined) settingsToUpdate.notify_recurring = notify_recurring;

        const updatedSettings = await updateSettingsService(payload.id, settingsToUpdate);
        
        res.status(200).json({ 
            success: true, 
            message: "Settings updated successfully", 
            result: updatedSettings 
        });
    } catch (error) {
        console.error("Error in handleUpdateSettings:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
