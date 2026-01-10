import { Router } from "express";
import { verifyToken } from "../middleware/jwt";
import { handleAccountCreation, handleAccountFetch, handleAccountDeletion } from "../controllers/controller_accounts";

const router = Router();

router.post('/creating-account',verifyToken, handleAccountCreation);
router.get('/fetch-accounts', verifyToken, handleAccountFetch);
router.delete('/delete-account/:account_id', verifyToken, handleAccountDeletion);
export default router