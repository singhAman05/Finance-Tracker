import {Router} from 'express'
import { verifyToken } from '../middleware/jwt'
import { handleTransactionsFetch, handleTransactionsAdd } from '../controllers/controller_transactions';

const router = Router();

router.post('/add-transaction', verifyToken, handleTransactionsAdd);
router.get('/fetch-transactions',verifyToken,handleTransactionsFetch)

export default router;