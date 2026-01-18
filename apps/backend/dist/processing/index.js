"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processingPipeline = exports.ProcessingPipeline = exports.MetricsCalculator = exports.PeakDetector = void 0;
__exportStar(require("./types"), exports);
var peak_detector_1 = require("./peak-detector");
Object.defineProperty(exports, "PeakDetector", { enumerable: true, get: function () { return peak_detector_1.PeakDetector; } });
var metrics_calculator_1 = require("./metrics-calculator");
Object.defineProperty(exports, "MetricsCalculator", { enumerable: true, get: function () { return metrics_calculator_1.MetricsCalculator; } });
var pipeline_1 = require("./pipeline");
Object.defineProperty(exports, "ProcessingPipeline", { enumerable: true, get: function () { return pipeline_1.ProcessingPipeline; } });
Object.defineProperty(exports, "processingPipeline", { enumerable: true, get: function () { return pipeline_1.processingPipeline; } });
//# sourceMappingURL=index.js.map