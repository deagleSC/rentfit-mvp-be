import { Router } from 'express';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import unitRoutes from './unitRoutes';
import staticRoutes from './staticRoutes';
import tenancyRoutes from './tenancyRoutes';
import uploadRoutes from './uploadRoutes';
import agreementRoutes from './agreementRoutes';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/units', unitRoutes);
router.use('/static', staticRoutes);
router.use('/tenancies', tenancyRoutes);
router.use('/upload', uploadRoutes);
router.use('/agreements', agreementRoutes);

export default router;
