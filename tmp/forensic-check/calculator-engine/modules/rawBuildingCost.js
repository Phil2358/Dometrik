"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRawBuildingCost = calculateRawBuildingCost;
const construction_1 = require("../../constants/construction");
function calculateRawBuildingCost(input) {
    var _a, _b, _c;
    const locations = [...construction_1.LOCATIONS];
    const qualities = [...construction_1.QUALITY_LEVELS];
    const location = (_a = locations.find((l) => l.id === input.locationId)) !== null && _a !== void 0 ? _a : locations[0];
    const quality = (_c = (_b = qualities.find((q) => q.id === input.qualityId)) !== null && _b !== void 0 ? _b : qualities.find((q) => q.id === construction_1.DEFAULT_QUALITY_ID)) !== null && _c !== void 0 ? _c : qualities[0];
    const defaultBaseCostPerSqm = quality.baseCostPerSqm;
    const sizeCorrectionFactor = (0, construction_1.getSizeCorrectionFactor)(input.buildingArea);
    const defaultSizeAdjustedCostPerSqm = Math.round(defaultBaseCostPerSqm * sizeCorrectionFactor);
    const defaultLocationAdjustedBaseCostPerSqm = Math.round(defaultBaseCostPerSqm * location.multiplier);
    const defaultCorrectedCostPerSqm = Math.round(defaultSizeAdjustedCostPerSqm * location.multiplier);
    const correctedBenchmarkOverridePerSqm = input.correctedBenchmarkOverridePerSqm === null || input.correctedBenchmarkOverridePerSqm === undefined
        ? null
        : Math.max(0, Math.round(input.correctedBenchmarkOverridePerSqm));
    const baseCostPerSqm = correctedBenchmarkOverridePerSqm !== null && correctedBenchmarkOverridePerSqm !== void 0 ? correctedBenchmarkOverridePerSqm : defaultBaseCostPerSqm;
    const sizeAdjustedCostPerSqm = correctedBenchmarkOverridePerSqm !== null && correctedBenchmarkOverridePerSqm !== void 0 ? correctedBenchmarkOverridePerSqm : defaultSizeAdjustedCostPerSqm;
    const costPerSqm = correctedBenchmarkOverridePerSqm !== null && correctedBenchmarkOverridePerSqm !== void 0 ? correctedBenchmarkOverridePerSqm : defaultLocationAdjustedBaseCostPerSqm;
    const correctedCostPerSqm = correctedBenchmarkOverridePerSqm !== null && correctedBenchmarkOverridePerSqm !== void 0 ? correctedBenchmarkOverridePerSqm : defaultCorrectedCostPerSqm;
    const rawBuildingCost = Math.round(input.buildingArea * correctedCostPerSqm);
    const kg300Base = Math.round(rawBuildingCost * construction_1.BASE_GROUP_SHARE_KG300);
    const kg400Base = Math.round(rawBuildingCost * construction_1.BASE_GROUP_SHARE_KG400);
    return {
        baseCostPerSqm,
        costPerSqm,
        sizeCorrectionFactor,
        sizeAdjustedCostPerSqm,
        correctedCostPerSqm,
        rawBuildingCost: kg300Base + kg400Base,
        baseConstructionCost: rawBuildingCost,
        kg300Base,
        kg400Base
    };
}
