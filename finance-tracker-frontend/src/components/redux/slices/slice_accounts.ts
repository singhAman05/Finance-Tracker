import { createSlice } from "@reduxjs/toolkit";

type AccountState = {
    accounts: any[];
};

const initialState: AccountState = {
    accounts: [],
};

const accountSlice = createSlice({
    name: "accounts",
    initialState,
    reducers: {
        setAccounts(state, action) {
            state.accounts = action.payload;
        },
        addAccount(state, action) {
            state.accounts.push(action.payload);
        },
        removeAccount(state, action) {
            state.accounts = state.accounts.filter(account => account.id !== action.payload);
        },
        updateAccountInStore(state, action) {
            const index = state.accounts.findIndex(account => account.id === action.payload.id);
            if (index !== -1) {
                state.accounts[index] = { ...state.accounts[index], ...action.payload };
            }
        },
    },
});

export const { setAccounts, addAccount, removeAccount, updateAccountInStore } = accountSlice.actions;

export default accountSlice.reducer;