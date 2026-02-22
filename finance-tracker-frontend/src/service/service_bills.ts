import { notify } from "@/lib/notifications";
import {
    createBillRoute,
    fetchBillsRoute,
    fetchBillInstancesRoute,
    payBillInstanceRoute,
    CreateBillPayload,
} from "@/routes/route_bills";

export type { CreateBillPayload };

export const createBill = async (payload: CreateBillPayload) => {
    const result = await createBillRoute(payload);
    if (result) {
        notify.success(result.message || "Bill created successfully");
    }
    return result;
};

export const fetchBills = async () => {
    const result = await fetchBillsRoute();
    return result;
};

export const fetchBillInstances = async () => {
    const result = await fetchBillInstancesRoute();
    return result;
};

export const payBillInstance = async (bill_instance_id: string) => {
    const result = await payBillInstanceRoute(bill_instance_id);
    if (result) {
        notify.success("Bill marked as paid!");
    }
    return result;
};
