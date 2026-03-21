import { Router } from "express";
import { verifyToken } from "../middleware/jwt";
import { handleGetSettings, handleUpdateSettings } from "../controllers/controller_settings";

const router = Router();

router.get('/', verifyToken, handleGetSettings);
router.put('/', verifyToken, handleUpdateSettings);

export default router;
