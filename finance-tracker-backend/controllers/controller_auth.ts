import { Request, Response } from 'express';
import { loginOrRegister } from "../services/service_auth"
import { validatePhone } from '../utils/validationUtils';

export const handleAuth = async (req: Request, res: Response) => {
    try {
        const { phone } = req.body;
        const isvalid = await validatePhone(phone)
        if(!isvalid.valid){
            res.status(200).json({
                message :isvalid.message
            })
        }
        
        // Get user data and token
        const authData = await loginOrRegister(phone);
        
        res.status(200).json({
            message: "Authentication successful",
            user: authData.user,
            token: authData.token
        });
    } catch (err: any) {
        const statusCode = err.message.includes('create') ? 500 : 401;
        res.status(statusCode).json({ message: err.message || "Authentication failed" });
    }
};
