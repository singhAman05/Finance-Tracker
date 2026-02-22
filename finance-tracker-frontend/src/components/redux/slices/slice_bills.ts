import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Bill, BillInstance } from "@/types/interfaces";

interface BillsState {
    bills: Bill[];
    instances: BillInstance[];
    loading: boolean;
}

const initialState: BillsState = {
    bills: [],
    instances: [],
    loading: false,
};

const billsSlice = createSlice({
    name: "bills",
    initialState,
    reducers: {
        setBills(state, action: PayloadAction<Bill[]>) {
            state.bills = action.payload;
        },
        setInstances(state, action: PayloadAction<BillInstance[]>) {
            state.instances = action.payload;
        },
        markInstancePaid(state, action: PayloadAction<string>) {
            const instance = state.instances.find(
                (i) => i.id === action.payload
            );
            if (instance) {
                instance.status = "paid";
                instance.paid_at = new Date().toISOString();
            }
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        resetBills(state) {
            state.bills = [];
            state.instances = [];
            state.loading = false;
        },
    },
});

export const { setBills, setInstances, markInstancePaid, setLoading, resetBills } =
    billsSlice.actions;
export default billsSlice.reducer;
