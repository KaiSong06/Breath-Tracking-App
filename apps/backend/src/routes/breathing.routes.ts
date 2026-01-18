import { Router, Request, Response } from 'express';
import { breathingService } from '../services';
import { 
  validateBody, 
  validateQuery, 
  asyncHandler 
} from '../middleware';
import { 
  HardwareBreathSampleSchema, 
  HistoryQuerySchema,
  type ApiResponse,
  type RawSampleResponse,
  type LatestSampleResponse,
  type HistoryResponse,
  type RawBreathSample,
} from '../types';

const router = Router();

/**
 * POST /api/v1/breathing/raw
 * Receive raw breath sample from hardware device
 * Accepts simplified payload: { raw: number, voltage: number }
 * Device ID and timestamp are added server-side
 */
router.post(
  '/raw',
  validateBody(HardwareBreathSampleSchema),
  asyncHandler(async (req: Request, res: Response) => {
    // Transform hardware payload to internal format
    const internalSample: RawBreathSample = {
      deviceId: 'rpi-breath-sensor',
      timestamp: Math.floor(Date.now() / 1000),
      rawValue: req.body.raw,
    };

    const { processed, alert } = await breathingService.processRawSample(internalSample);

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

