import { Request, Response } from "express";
import {
    createBill,
    fetchBills,
    fetchBillInstances,
    markBillInstanceAsPaid,
} from "../services/service_bills";
import { getCache, setCache, deleteCache } from "../utils/cacheUtils";

/* ==============================
   Create Bill
============================== */

export const handleBillCreation = async (req: Request, res: Response) => {
    const user = (req as any).user.payload;
    const client_id = user.id;

    const {
        account_id,
        system_category_id,
        name,
        amount,
        is_recurring,
        recurrence_type,
        recurrence_interval,
        start_date,
        end_date,
        reminder_days_before,
        notes,
    } = req.body;

    if (!system_category_id || !name || !amount || !start_date) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    try {
        const payload = {
            client_id,
            account_id: account_id || null,
            system_category_id,
            name: name.trim(),
            amount: parseFloat(amount),
            is_recurring: is_recurring ?? false,
            recurrence_type: recurrence_type || null,
            recurrence_interval: recurrence_interval || 1,
            start_date,
            end_date: end_date || null,
            reminder_days_before: reminder_days_before ?? 0,
            notes: notes?.trim() || null,
        };

        const bill = await createBill(payload);

        // Invalidate related caches
        await deleteCache(`bills:${client_id}`);
        await deleteCache(`bill_instances:${client_id}`);

        res.status(201).json({
            message: "Bill created successfully",
            data: bill,
        });
    } catch (err: any) {
        console.error("Bill creation failed:", err);
        res.status(500).json({ message: err.message || "Internal Server Error" });
    }
};

/* ==============================
   Fetch Bills
============================== */

export const handleBillsFetch = async (req: Request, res: Response) => {
    const user = (req as any).user.payload;
    const client_id = user.id;
    const cacheKey = `bills:${client_id}`;

    try {
        const cached = await getCache(cacheKey);
        if (cached) {
            res.status(200).json({
                message: "Bills from Cache",
                data: cached,
            });
            return;
        }

        const bills = await fetchBills(client_id);

        await setCache(cacheKey, bills, 3600);

        res.status(200).json({
            message: "Bills fetched",
            data: bills,
        });
    } catch (err) {
        console.error("Fetch bills failed:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/* ==============================
   Fetch Bill Instances
============================== */

export const handleBillInstancesFetch = async (
    req: Request,
    res: Response
) => {
    const user = (req as any).user.payload;
    const client_id = user.id;
    const cacheKey = `bill_instances:${client_id}`;

    try {
        const cached = await getCache(cacheKey);
        if (cached) {
            res.status(200).json({
                message: "Bill instances from Cache",
                data: cached,
            });
            return;
        }

        const instances = await fetchBillInstances(client_id);

        await setCache(cacheKey, instances, 1800); // 30 mins

        res.status(200).json({
            message: "Bill instances fetched",
            data: instances,
        });
    } catch (err) {
        console.error("Fetch bill instances failed:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/* ==============================
   Mark Bill Instance as Paid
============================== */

export const handleBillInstancePayment = async (
    req: Request,
    res: Response
) => {
    const { bill_instance_id } = req.params;
    const user = (req as any).user.payload;
    const client_id = user.id;

    if (!bill_instance_id) {
        res.status(400).json({ message: "Bill instance id is required" });
        return;
    }

    try {
        await markBillInstanceAsPaid(bill_instance_id, client_id);

        // Invalidate caches
        await deleteCache(`bill_instances:${client_id}`);
        await deleteCache(`transactions:${client_id}`);

        res.status(200).json({
            message: "Bill marked as paid successfully",
            data: { bill_instance_id },
        });
    } catch (err: any) {
        console.error("Bill payment failed:", err);
        res.status(400).json({
            message: err.message || "Failed to mark bill as paid",
        });
    }
};
