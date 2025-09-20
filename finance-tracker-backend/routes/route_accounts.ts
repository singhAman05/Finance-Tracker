import { Router } from "express";
import { verifyToken } from "../middleware/jwt";
import { handleAccountCreation, handleAccountFetch } from "../controllers/controller_accounts";

const router = Router();

router.post('/creating-account',verifyToken, handleAccountCreation);
router.get('/fetch-accounts', verifyToken, handleAccountFetch);
export default router