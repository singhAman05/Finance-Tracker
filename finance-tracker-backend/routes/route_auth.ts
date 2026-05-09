import { Router } from 'express'
import { handleAuth, handleGoogleAuth, handleLogout, handleMe } from '../controllers/controller_auth';
import { authLimiter } from '../middleware/rateLimiter';
import { verifyToken } from '../middleware/jwt';

const router = Router();

// --- #4: Rate limiting on auth endpoints ---
router.post('/phone', authLimiter, handleAuth)
router.post('/google-login', authLimiter, handleGoogleAuth)
router.post('/logout', handleLogout)
router.get('/me', verifyToken, handleMe)

export default router