import { Router } from 'express';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import unitRoutes from './unitRoutes';
import staticRoutes from './staticRoutes';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/units', unitRoutes);
router.use('/static', staticRoutes);

export default router;
