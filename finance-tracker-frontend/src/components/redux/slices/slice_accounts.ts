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
    },
});

export const { setAccounts, addAccount, removeAccount } = accountSlice.actions;

export default accountSlice.reducer;