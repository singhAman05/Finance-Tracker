import { Request, Response } from "express";
import { addingCategory, getSystemCategories } from "../services/service_categories";
import { validateCategory } from "../utils/validationUtils";

export const handleCategoryCreation = async (req: Request, res: Response) => {
    const user = (req as any).user.payload;
    const { name, type, color, icon, parent_id, is_default } = req.body;

    try {
        const isValid = await validateCategory(name, type);
        if (!isValid.valid) {
            res.status(400).json({ message: isValid.message });
            return;
        }

        const category_payload = {
            client_id: user.id,
            name: name.trim(),
            type,
            color,
            icon,
            parent_id,
            is_default,
        };

        const result = await addingCategory(category_payload);

        if (result.error) {
            console.error("DB insert error:", result.error);
            res.status(500).json({ message: "Internal Server Error" });
            return
        }

        res.status(201).json({
            message: "Category added successfully",
            category: result.data,
        });
        return;
    } catch (err) {
        console.error("Category addition failed:", err);
        res.status(500).json({ message: "Internal Server Error" });
        return
    }
};

export const handleSystemCategoryfetch = async(req : Request, res : Response)=>{
    try{
        // console.log("he;;o")
        const result = await getSystemCategories();

        if(result.data && result.data.length===0){
            res.status(404).json({message : `No System Categories`});
            return;
        }
        if(result.error){
            console.log(`Cannot Fetch System Categories from DB : ${result.error}`)
            res.status(405).json({message : `Cannot Fetch System Categories from DB`})
            return;
        }

        res.status(200).json({message : `System Categories fetched`, data : result.data})
    }catch(err){
        console.log(`System Category fetch failed : ${err}`);
        res.status(500).json({message: `Internal Server Error`});
        return;
    }
}
