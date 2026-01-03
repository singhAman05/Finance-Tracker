import { supabase } from "../config/supabase";

interface ProfilePayload {
  full_name: string;
  email: string;
  phone: string;
  profession: string;
  profile_complete: boolean;
}

export const updatingProfile = async (payload: ProfilePayload) => {
  const { phone, email, ...rest } = payload;

  const { data: phoneUser } = await supabase
    .from("clients")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (phoneUser) {
    const { data, error } = await supabase
      .from("clients")
      .update({ ...rest, email })
      .eq("phone", phone)
      .select("*")
      .single();

    return { data, error };
  }

  const { data: emailUser } = await supabase
    .from("clients")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (emailUser) {
    const { data, error } = await supabase
      .from("clients")
      .update({ ...rest, phone })
      .eq("email", email)
      .select("*")
      .single();

    return { data, error };
  }

  return {
    data: null,
    error: {
      message: "No matching user found for provided phone or email.",
    },
  };
};
