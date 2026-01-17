import { Router } from 'express';
import healthRoutes from './health.routes';
import breathingRoutes from './breathing.routes';

const router = Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/breathing', breathingRoutes);

export default router;

