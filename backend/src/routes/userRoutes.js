// userRoutes.js

import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { deleteProfile, getProfile, updateProfile } from '../controllers/userController.js';

const router = express.Router();

// GET /api/users/me
router.get('/me', protect, getProfile);

// PUT /api/users/me
router.put('/me', protect, updateProfile);

// DELETE /api/users/me
router.delete('/me', protect, deleteProfile);

export default router;
