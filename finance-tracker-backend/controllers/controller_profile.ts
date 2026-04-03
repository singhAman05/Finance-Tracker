import { Request, Response } from "express";
import { updatingProfile } from "../services/service_profile";
import { validateEmail, validatePhone } from "../utils/validationUtils";

export const handleProfile = async (req: Request, res: Response) => {
    const { full_name, email, phone, profession, profile_complete } = req.body;

    // --- #6: Extract client_id from JWT (scope update to authenticated user) ---
    const user = (req as any).user?.payload;
    if (!user?.id) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    const client_id = user.id;

    if (!full_name || !email || !phone || !profession) {
        res.status(400).json({ success: false, message: "All fields are required" });
        return;
    }

    const phoneValidation = await validatePhone(phone);
    if (!phoneValidation.valid) {
        res.status(400).json({ success: false, message: phoneValidation.message });
        return;
    }

    const emailValidation = await validateEmail(email);
    if (!emailValidation.valid) {
        res.status(400).json({ success: false, message: emailValidation.message });
        return;
    }

    try {
        const result = await updatingProfile(client_id, {
            full_name,
            email,
            phone,
            profession,
            profile_complete
        });

        if (result.error) {
            console.error("Profile update error:", result.error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
            return;
        }

        res.status(201).json({ message: "Profile Updated Successfully", user: result.data });
    } catch (err) {
        console.error("Profile update failed:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
