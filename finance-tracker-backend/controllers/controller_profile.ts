import { Request, Response } from "express";
import { updatingProfile } from "../services/service_profile";
import { validateEmail, validatePhone } from "../utils/validationUtils";

export const handleProfile = async (req: Request, res: Response) => {
    const { full_name, email, phone, profession, profile_complete } = req.body;
    if (!full_name || !email || !phone || !profession) {
        res.status(400).json({ message: "All fields are required" });
        return
    }

    const phoneValidation = await validatePhone(phone);
    if (!phoneValidation.valid) {
        res.status(400).json({ message: phoneValidation.message });
        return
    }

    const emailValidation = await validateEmail(email);
    if (!emailValidation.valid) {
        res.status(400).json({ message: emailValidation.message });
        return
    }
    try{
        const result = await updatingProfile({
            full_name,
            email,
            phone,
            profession,
            profile_complete
        })
        if(result.error){
            res.status(500).json({message : `Internal Sever Error`})
            return;
        }
        res.status(201).json({message: `Profile Updated Successfully`, user : result.data});

    }catch(err){
        console.log(`Profile update failed : ${err}`)
        res.status(500).json({message : `Internal Server Error`})
    }
};
