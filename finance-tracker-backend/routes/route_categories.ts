import { Router } from "express";
import { verifyToken } from "../middleware/jwt";
import { handleCategoryCreation, handleSystemCategoryfetch } from "../controllers/controller_categories";

const router = Router();

router.post('/creating-category', verifyToken, handleCategoryCreation);
router.get('/get-system-categories', verifyToken, handleSystemCategoryfetch)

export default router;