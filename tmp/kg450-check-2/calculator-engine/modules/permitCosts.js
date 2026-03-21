"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePermitCosts = calculatePermitCosts;
const construction_1 = require("../../constants/construction");
function calculatePermitCosts(input) {
    var _a;
    let permitFee = construction_1.PERMIT_DESIGN_BASELINE_FEE;
    if (input.buildingArea > construction_1.PERMIT_DESIGN_BASELINE_AREA_MAX) {
        const extraArea = input.buildingArea - construction_1.PERMIT_DESIGN_BASELINE_AREA_MAX;
        permitFee += extraArea * 20;
    }
    const qualityMultiplier = (_a = construction_1.PERMIT_DESIGN_QUALITY_MULTIPLIERS[input.qualityId]) !== null && _a !== void 0 ? _a : construction_1.PERMIT_DESIGN_QUALITY_MULTIPLIERS[construction_1.DEFAULT_QUALITY_ID];
    permitFee =
        permitFee * qualityMultiplier;
    return {
        permitFee: Math.round(permitFee)
    };
}
