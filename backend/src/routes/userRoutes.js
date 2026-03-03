// backend/src/routes/user.routes.js
// --------------------------------------------------
// PURPOSE:
// Defines user profile routes.
// --------------------------------------------------

import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getProfile, updateProfile } from '../controllers/userController.js';

const router = express.Router();

// GET /api/users/me
router.get('/me', protect, getProfile);

// PUT /api/users/me
router.put('/me', protect, updateProfile);

export default router;