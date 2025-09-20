import { Router } from "express";
import { verifyToken } from "../middleware/jwt";
import { handleProfile } from "../controllers/controller_profile";

const router = Router();

router.post('/complete_profile', verifyToken, handleProfile);

export default router