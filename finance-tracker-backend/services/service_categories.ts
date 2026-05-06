import { supabase } from '../config/supabase';
import { AppError } from '../utils/AppError';

export type CategoryPayload = {
  client_id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
  parent_id?: string;
  is_default?: boolean;
};

export const addingCategory = async (category_payload: CategoryPayload) => {
  const { client_id, name, type, color = '#64748b', icon, parent_id, is_default = false } = category_payload;

  const { data, error } = await supabase
    .from('categories')
    .insert({
      client_id,
      name,
      type,
      color,
      icon,
      parent_id,
      is_default,
    })
    .select()
    .single();

  if (error && error.code === '42P01') {
    throw AppError.badRequest(
      'Custom categories table is not available in this schema. Use system categories only.'
    );
  }

  return { data, error };
};

export const getSystemCategories = async () => {
  const { data, error } = await supabase
    .from('system_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  return { data, error };
};

export const verifyCategoryOwnership = async (categoryId: string, clientId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('id', categoryId)
    .eq('client_id', clientId)
    .single();

  return !error && !!data;
};

