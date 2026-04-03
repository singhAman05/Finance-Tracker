import { Request, Response } from 'express';
import { loginWithPhone, loginWithGoogle } from "../services/service_auth"
import { validatePhone } from '../utils/validationUtils';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const handleAuth = async (req: Request, res: Response) => {
    try {
        const { phone } = req.body;
        const isvalid = await validatePhone(phone)
        if (!isvalid.valid) {
            res.status(400).json({
                success: false,
                message: isvalid.message
            })
            return;
        }

        const authData = await loginWithPhone(phone);

        res.status(200).json({
            message: "Authentication successful",
            user: authData.user,
            token: authData.token
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Authentication failed";
        const statusCode = message.includes('create') ? 500 : 401;
        res.status(statusCode).json({ success: false, message });
    }
};

// --- #7: Google Auth now validates ID token server-side ---
export const handleGoogleAuth = async (req: Request, res: Response) => {
    try {
        const { idToken, name } = req.body;

        let verifiedEmail: string;
        let verifiedName: string;

        if (!idToken) {
            res.status(400).json({ success: false, message: "Google ID token is required" });
            return;
        }

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(401).json({ success: false, message: "Invalid Google ID token" });
            return;
        }
        verifiedEmail = payload.email;
        verifiedName = payload.name || name || "";

        const authData = await loginWithGoogle(verifiedEmail, verifiedName);

        res.status(200).json({
            message: "Google Authentication successful",
            user: authData.user,
            token: authData.token
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Google Authentication failed";
        const statusCode = message.includes('create') ? 500 : 401;
        res.status(statusCode).json({ success: false, message });
    }
}
