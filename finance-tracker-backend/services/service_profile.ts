import { supabase } from "../config/supabase";

interface ProfilePayload {
  full_name: string;
  email: string;
  phone: string;
  profession: string;
  profile_complete: boolean;
}

export const updatingProfile = async (payload: ProfilePayload) => {
  const { phone, ...rest } = payload;

  const { data, error } = await supabase
    .from("clients")
    .update(rest)
    .eq("phone", phone)
    .select("*")
    .single();

  return { data, error };
};
