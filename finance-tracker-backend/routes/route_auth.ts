import {Router} from 'express'
import { handleAuth } from '../controllers/controller_auth';

const router = Router();

router.post('/', handleAuth)

export default router