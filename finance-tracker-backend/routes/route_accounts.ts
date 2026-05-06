import { Router } from "express";
import { verifyToken } from "../middleware/jwt";
import { handleAccountCreation, handleAccountFetch, handleAccountDeletion, handleAccountUpdate, handleProcessRecurring, handleFetchRecurring } from "../controllers/controller_accounts";

const router = Router();

router.post('/creating-account', verifyToken, handleAccountCreation);
router.get('/fetch-accounts', verifyToken, handleAccountFetch);
router.patch('/update-account/:account_id', verifyToken, handleAccountUpdate);
router.delete('/delete-account/:account_id', verifyToken, handleAccountDeletion);
router.post('/process-recurring', verifyToken, handleProcessRecurring);
router.get('/recurring', verifyToken, handleFetchRecurring);
export default router;
