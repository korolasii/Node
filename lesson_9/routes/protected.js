import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: 'Доступ разрешен', user: req.user });
});

export default router;
