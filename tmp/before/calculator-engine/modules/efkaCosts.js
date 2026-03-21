"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateEfkaCosts = calculateEfkaCosts;
const EFKA_REFERENCE_COST = 19000;
const EFKA_REFERENCE_AREA = 130;
function calculateEfkaCosts(input) {
    var _a;
    const automaticCost = Math.round(input.buildingArea * (EFKA_REFERENCE_COST / EFKA_REFERENCE_AREA));
    const manualCost = (_a = input.manualCost) !== null && _a !== void 0 ? _a : null;
    return {
        automaticCost,
        appliedCost: manualCost !== null && manualCost !== void 0 ? manualCost : automaticCost,
        manualOverrideActive: manualCost !== null,
    };
}
