import { Router } from 'express'
import { handleAuth, handleGoogleAuth } from '../controllers/controller_auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// --- #4: Rate limiting on auth endpoints ---
router.post('/phone', authLimiter, handleAuth)
router.post('/google-login', authLimiter, handleGoogleAuth)

export default router