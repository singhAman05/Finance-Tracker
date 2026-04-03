import { Router } from "express";
import { verifyToken } from "../middleware/jwt";
import { handleClearHistory, handleExportUserData, handleGetSettings, handleUpdateSettings } from "../controllers/controller_settings";

const router = Router();

router.get('/', verifyToken, handleGetSettings);
router.put('/', verifyToken, handleUpdateSettings);
router.get('/export', verifyToken, handleExportUserData);
router.delete('/history', verifyToken, handleClearHistory);

export default router;
