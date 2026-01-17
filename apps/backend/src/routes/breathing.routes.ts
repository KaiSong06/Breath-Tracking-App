import { Router, Request, Response } from 'express';
import { breathingService } from '../services';
import { 
  deviceAuth, 
  validateBody, 
  validateQuery, 
  asyncHandler 
} from '../middleware';
import { 
  RawBreathSampleSchema, 
  HistoryQuerySchema,
  type ApiResponse,
  type RawSampleResponse,
  type LatestSampleResponse,
  type HistoryResponse,
} from '../types';

const router = Router();

/**
 * POST /api/v1/breathing/raw
 * Receive raw breath sample from device
 * Requires X-Device-Key header
 */
router.post(
  '/raw',
  deviceAuth,
  validateBody(RawBreathSampleSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { processed, alert } = await breathingService.processRawSample(req.body);

    const response: ApiResponse<RawSampleResponse> = {
      success: true,
      data: {
        received: true,
        processed,
        alertTriggered: alert !== null,
      },
      timestamp: Date.now(),
    };

    res.status(201).json(response);
  })
);

/**
 * GET /api/v1/breathing/latest
 * Get the latest processed breathing sample
 */
router.get(
  '/latest',
  asyncHandler(async (req: Request, res: Response) => {
    const deviceId = req.query.deviceId as string | undefined;
    const latest = await breathingService.getLatestSample(deviceId);

    const response: ApiResponse<LatestSampleResponse> = {
      success: true,
      data: latest,
      timestamp: Date.now(),
    };

    res.json(response);
  })
);

/**
 * GET /api/v1/breathing/history
 * Get historical breathing samples
 * Query params: from, to, limit, deviceId
 */
router.get(
  '/history',
  validateQuery(HistoryQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { from, to, limit, deviceId } = req.query as any;
    
    const { samples, total } = await breathingService.getHistory({
      from,
      to,
      limit,
      deviceId,
    });

    const response: ApiResponse<HistoryResponse> = {
      success: true,
      data: {
        samples,
        count: samples.length,
        hasMore: total > samples.length,
      },
      timestamp: Date.now(),
    };

    res.json(response);
  })
);

export default router;

