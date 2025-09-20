import { supabase } from "../config/supabase";

export type CategoryPayload = {
    client_id: string;
    name: string;
    type: 'income' | 'expense' | 'transfer';
    color?: string;
    icon?: string;
    parent_id?: string;
    is_default?: boolean;
};

export const addingCategory = async (category_payload: CategoryPayload) => {
    const {
        client_id,
        name,
        type,
        color = '#64748b',
        icon,
        parent_id,
        is_default = false,
    } = category_payload;

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

    return { data, error };
};


export const getSystemCategories = async()=>{
    // console.log("hello");
    const { data, error } = await supabase
    .from('system_categories')
    .select('*')

    return {data, error}

}
