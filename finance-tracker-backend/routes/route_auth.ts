import {Router} from 'express'
import { handleAuth, handleGoogleAuth } from '../controllers/controller_auth';

const router = Router();

router.post('/phone', handleAuth)
router.post('/google-login', handleGoogleAuth)
export default router