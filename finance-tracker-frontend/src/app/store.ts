import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/components/redux/slices/slice_auth";
import accountReducer from "@/components/redux/slices/slice_accounts";
import transactionReducer from "@/components/redux/slices/slice_transactions";
import categoryReducer from "@/components/redux/slices/slice_categories";
import { tr } from "date-fns/locale";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountReducer,
    transactions: transactionReducer,
    categories: categoryReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
