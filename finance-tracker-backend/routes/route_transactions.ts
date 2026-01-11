import {Router} from 'express'
import { verifyToken } from '../middleware/jwt'
import { handleTransactionsFetch, handleTransactionsAdd, handleTransactionDelete } from '../controllers/controller_transactions';

const router = Router();

router.post('/add-transaction', verifyToken, handleTransactionsAdd);
router.get('/fetch-transactions', verifyToken, handleTransactionsFetch);
router.delete('/delete-transaction/:transaction_id', verifyToken, handleTransactionDelete);

export default router;