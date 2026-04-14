import { supabase } from '../config/supabase';
import { tokenGenerator } from '../middleware/jwt';
import { AppError } from '../utils/AppError';

const NO_ROWS = 'PGRST116';

export const loginWithPhone = async (phone: string) => {
  const { data: existingUser, error: fetchError } = await supabase
    .from('clients')
    .select('*')
    .eq('phone', phone)
    .single();

  let user = existingUser;

  if (fetchError && fetchError.code !== NO_ROWS) {
    throw AppError.internal('Failed to fetch user', fetchError);
  }

  if (!existingUser) {
    const { data: newUser, error: createError } = await supabase
      .from('clients')
      .insert([{ phone, profile_complete: false }])
      .select('*')
      .single();

    if (createError || !newUser) {
      throw AppError.internal('Failed to create user', createError);
    }
    user = newUser;
  }

  const token = tokenGenerator({
    id: user.id,
    phone: user.phone,
    profile_complete: user.profile_complete,
  });

  return {
    user: {
      id: user.id,
      phone: user.phone,
      email: user.email,
      full_name: user.full_name,
      profession: user.profession,
      profile_complete: user.profile_complete,
      created_at: user.created_at,
    },
    token,
  };
};

export const loginWithGoogle = async (email: string, name: string) => {
  const { data: existingUser, error: fetchError } = await supabase
    .from('clients')
    .select('*')
    .eq('email', email)
    .single();

  let user = existingUser;

  if (fetchError && fetchError.code !== NO_ROWS) {
    throw AppError.internal('Failed to fetch user', fetchError);
  }

  if (!existingUser) {
    const { data: newUser, error: createError } = await supabase
      .from('clients')
      .insert([{ email, full_name: name, profile_complete: false }])
      .select('*')
      .single();

    if (createError || !newUser) {
      throw AppError.internal('Failed to create user', createError);
    }
    user = newUser;
  }

  const token = tokenGenerator({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    profile_complete: user.profile_complete,
  });

  return {
    user: {
      id: user.id,
      phone: user.phone,
      email: user.email,
      full_name: user.full_name,
      profession: user.profession,
      profile_complete: user.profile_complete,
      created_at: user.created_at,
    },
    token,
  };
};
