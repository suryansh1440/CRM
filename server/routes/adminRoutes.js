import express from 'express';
import { authAdmin, logoutAdmin, checkAuth } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authAdmin);
router.post('/logout', logoutAdmin);
router.get('/check', protect, checkAuth);

export default router;
