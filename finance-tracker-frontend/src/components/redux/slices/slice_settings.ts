import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ClientSettings } from "@/service/service_settings";

interface SettingsState {
  settings: ClientSettings | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<ClientSettings>) => {
      state.settings = action.payload;
    },
    updateLocalSettings: (state, action: PayloadAction<Partial<ClientSettings>>) => {
      if (state.settings) {
         state.settings = { ...state.settings, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setSettings, updateLocalSettings, setLoading, setError } = settingsSlice.actions;
export default settingsSlice.reducer;
