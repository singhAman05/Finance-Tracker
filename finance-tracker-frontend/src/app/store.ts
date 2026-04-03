import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer, { logout } from "@/components/redux/slices/slice_auth";
import accountReducer from "@/components/redux/slices/slice_accounts";
import transactionReducer from "@/components/redux/slices/slice_transactions";
import categoryReducer from "@/components/redux/slices/slice_categories";
import modalReducer from "@/components/redux/slices/slice_modal";
import billsReducer from "@/components/redux/slices/slice_bills";
import budgetReducer from "@/components/redux/slices/slice_budgets";
import settingsReducer from "@/components/redux/slices/slice_settings";

const appReducer = combineReducers({
  auth: authReducer,
  accounts: accountReducer,
  transactions: transactionReducer,
  categories: categoryReducer,
  modal: modalReducer,
  bills: billsReducer,
  budgets: budgetReducer,
  settings: settingsReducer,
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: any) => {
  if (action.type === logout.type && state) {
    // Reset data slices, keeping auth to process logout, and modal/settings
    state = {
      ...state,
      accounts: undefined as any,
      transactions: undefined as any,
      categories: undefined as any,
      bills: undefined as any,
      budgets: undefined as any,
      settings: undefined as any,
    };
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
