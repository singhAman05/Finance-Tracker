import { Request, Response } from 'express';
import { loginWithPhone, loginWithGoogle } from "../services/service_auth"
import { validatePhone } from '../utils/validationUtils';

export const handleAuth = async (req: Request, res: Response) => {
    try {
        const { phone } = req.body;
        const isvalid = await validatePhone(phone)
        if(!isvalid.valid){
            res.status(400).json({
                message :isvalid.message
            })
            return;
        }

        const authData = await loginWithPhone(phone);

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

export const handleGoogleAuth = async (req: Request, res: Response) => {
    try{
        const { email, name } = req.body;
        const authData = await loginWithGoogle(email, name);

        res.status(200).json({
            message: "Google Authentication successful",
            user: authData.user,
            token: authData.token
        });
    } catch (err: any) {
        const statusCode = err.message.includes('create') ? 500 : 401;
        res.status(statusCode).json({ message: err.message || "Google Authentication failed" });
    }
}