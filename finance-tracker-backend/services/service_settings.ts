import { supabase } from '../config/supabase';

export interface ClientSettings {
  currency: string;
  date_format: string;
  notify_bills: boolean;
  notify_budgets: boolean;
  notify_recurring: boolean;
}

const defaultSettings: ClientSettings = {
  currency: 'INR',
  date_format: 'DD/MM/YYYY',
  notify_bills: true,
  notify_budgets: true,
  notify_recurring: true,
};

export const getSettingsService = async (client_id: string): Promise<ClientSettings> => {
  const { data, error } = await supabase
    .from('client_settings')
    .select('currency, date_format, notify_bills, notify_budgets, notify_recurring')
    .eq('client_id', client_id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // PGRST116 means no rows returned - return defaults without saving yet
      return defaultSettings;
    }
    console.error('Error fetching settings:', error);
    throw error;
  }

  return data;
};

export const updateSettingsService = async (client_id: string, settings: Partial<ClientSettings>): Promise<ClientSettings> => {
  // Try to update first, if it fails because it doesn't exist, we'll insert
  
  const { data: existingData, error: checkError } = await supabase
    .from('client_settings')
    .select('id')
    .eq('client_id', client_id)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
     console.error('Error checking existing settings:', checkError);
     throw checkError;
  }

  let result;

  if (existingData) {
    // Update existing settings
    const { data, error } = await supabase
      .from('client_settings')
      .update(settings)
      .eq('client_id', client_id)
      .select('currency, date_format, notify_bills, notify_budgets, notify_recurring')
      .single();

    if (error) {
       console.error('Error updating settings:', error);
       throw error;
    }
    result = data;
  } else {
    // Insert new settings merged with defaults
    const newSettings = {
        ...defaultSettings,
        ...settings,
        client_id: client_id
    };

    const { data, error } = await supabase
      .from('client_settings')
      .insert([newSettings])
      .select('currency, date_format, notify_bills, notify_budgets, notify_recurring')
      .single();

    if (error) {
       console.error('Error inserting settings:', error);
       throw error;
    }
    result = data;
  }

  return result;
};
