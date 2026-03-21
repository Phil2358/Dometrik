"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateKg100Costs = calculateKg100Costs;
const DEFAULT_LAND_ACQUISITION_PERCENTAGE = 0.06;
function calculateKg100Costs(input) {
    var _a, _b, _c;
    const landValue = Math.max(0, (_a = input.landValue) !== null && _a !== void 0 ? _a : 0);
    const landAcquisitionCostsMode = (_b = input.landAcquisitionCostsMode) !== null && _b !== void 0 ? _b : "auto";
    const incidentalLandAcquisitionCosts = landAcquisitionCostsMode === "auto"
        ? landValue * DEFAULT_LAND_ACQUISITION_PERCENTAGE
        : Math.max(0, (_c = input.landAcquisitionCosts) !== null && _c !== void 0 ? _c : 0);
    return {
        landValue,
        incidentalLandAcquisitionCosts,
        landAcquisitionCostsMode,
        landAcquisitionRatePercent: DEFAULT_LAND_ACQUISITION_PERCENTAGE * 100,
        kg100Total: landValue + incidentalLandAcquisitionCosts,
        subgroupCosts: {
            subgroup110Cost: landValue,
            subgroup120Cost: incidentalLandAcquisitionCosts,
            subgroup130Cost: 0,
        },
    };
}
