import { supabase } from "../config/supabase"

export const creatingAccount = async (account_payload: any) => {
   const {
      client_id,
      bank_name,
      account_type,
      balance,
      currency,
      account_holder_name,
      account_number_last4,
   } = account_payload;

   const { data, error } = await supabase
      .from('accounts')
      .insert({
         client_id,
         account_type: account_type,
         balance: balance ?? 0,
         currency: currency ?? 'INR',
         account_holder_name,
         bank_name,
         account_number_last4,
      })
      .select()
      .single();

   return { data, error };
};

export const fetchAllaccounts = async (client_id: string) => {
   const { data, error } = await supabase
      .from('accounts')
      .select()
      .eq('client_id', client_id)

   return { data, error };
};

export const deleteAccount = async (account_id: string, client_id: string) => {
   const { data, error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", account_id)
      .eq("client_id", client_id)
      .select()
      .single();
   return { data, error };
};