import { supabase } from "../config/supabase";

interface ProfilePayload {
  full_name: string;
  email: string;
  phone: string;
  profession: string;
  profile_complete: boolean;
}

// --- #6: Now scoped to authenticated user via client_id ---
export const updatingProfile = async (client_id: string, payload: ProfilePayload) => {
  const { full_name, email, phone, profession, profile_complete } = payload;

  const { data, error } = await supabase
    .from("clients")
    .update({ full_name, email, phone, profession, profile_complete })
    .eq("id", client_id)  // Only update OWN profile
    .select("*")
    .single();

  return { data, error };
};
