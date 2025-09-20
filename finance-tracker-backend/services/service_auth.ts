import { supabase } from '../config/supabase';
import { tokenGenerator } from '../middleware/jwt';

export const loginOrRegister = async (phone : string) => {
    // checking if the user exists or not
    try{
        const {data : existingUser, error : fetchError} = await supabase.from('clients').select('*').eq('phone', phone).single()
        let user = existingUser;

        // creating new user
        if(!existingUser || fetchError){
            const {data : newUser, error: createError} = await supabase.from('clients').insert([{phone, profile_complete:false}]).select('*').single();

            user = newUser;

            if(createError || !newUser){
                throw new Error(`Failed to create User : ${createError}`)
            }
        }

        const token = await tokenGenerator({ 
            id: user.id, 
            phone: user.phone,
            profile_complete: user.profile_complete
        });

        // console.log(token);

        return {
            user: {
                id: user.id,
                phone: user.phone,
                email: user.email,
                full_name: user.full_name,
                profession: user.profession,
                profile_complete: user.profile_complete,
                created_at: user.created_at
            },
            token
        };

    }catch(err:any){
        console.log(err.message)
        throw new Error(err.message);
    }
};
