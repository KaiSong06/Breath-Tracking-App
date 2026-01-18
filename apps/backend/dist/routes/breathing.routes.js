"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_1 = require("../services");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
/**
 * POST /api/v1/breathing/raw
 * Receive raw breath sample from device
 * Requires X-Device-Key header
 */
router.post('/raw', middleware_1.deviceAuth, (0, middleware_1.validateBody)(types_1.RawBreathSampleSchema), (0, middleware_1.asyncHandler)(async (req, res) => {
    const { processed, alert } = await services_1.breathingService.processRawSample(req.body);
    const response = {
        success: true,
        data: {
            received: true,
            processed,
            alertTriggered: alert !== null,
        },
        timestamp: Date.now(),
    };
    res.status(201).json(response);
}));
/**
 * GET /api/v1/breathing/latest
 * Get the latest processed breathing sample
 */
router.get('/latest', (0, middleware_1.asyncHandler)(async (req, res) => {
    const deviceId = req.query.deviceId;
    const latest = await services_1.breathingService.getLatestSample(deviceId);
    const response = {
        success: true,
        data: latest,
        timestamp: Date.now(),
    };
    res.json(response);
}));
/**
 * GET /api/v1/breathing/history
 * Get historical breathing samples
 * Query params: from, to, limit, deviceId
 */
router.get('/history', (0, middleware_1.validateQuery)(types_1.HistoryQuerySchema), (0, middleware_1.asyncHandler)(async (req, res) => {
    const { from, to, limit, deviceId } = req.query;
    const { samples, total } = await services_1.breathingService.getHistory({
        from,
        to,
        limit,
        deviceId,
    });
    const response = {
        success: true,
        data: {
            samples,
            count: samples.length,
            hasMore: total > samples.length,
        },
        timestamp: Date.now(),
    };
    res.json(response);
}));
exports.default = router;
//# sourceMappingURL=breathing.routes.js.map