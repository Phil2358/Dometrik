"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateContingencyCosts = calculateContingencyCosts;
const construction_1 = require("../../constants/construction");
function calculateContingencyCosts(input) {
    var _a, _b, _c;
    const recommendedPercent = (_a = construction_1.CONTINGENCY_PERCENTAGES[input.qualityId]) !== null && _a !== void 0 ? _a : construction_1.CONTINGENCY_PERCENTAGES[construction_1.DEFAULT_QUALITY_ID];
    const manualPercent = (_b = input.manualContingencyPercent) !== null && _b !== void 0 ? _b : null;
    const manualCost = (_c = input.manualContingencyCost) !== null && _c !== void 0 ? _c : null;
    const appliedPercent = manualPercent !== null
        ? manualPercent / 100
        : (manualCost !== null && input.constructionSubtotal > 0
            ? manualCost / input.constructionSubtotal
            : recommendedPercent);
    return {
        recommendedPercent,
        recommendedCost: Math.round(input.constructionSubtotal * recommendedPercent),
        appliedPercent,
        appliedPercentValue: appliedPercent * 100,
        contingencyCost: Math.round(input.constructionSubtotal * appliedPercent),
        manualOverrideActive: manualPercent !== null || manualCost !== null,
    };
}
