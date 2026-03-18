import { QUALITY_LEVELS, LOCATIONS, BASE_GROUP_SHARE_KG200, BASE_GROUP_SHARE_KG300, BASE_GROUP_SHARE_KG400, getSizeCorrectionFactor } from "../../constants/construction";
export function calculateRawBuildingCost(input) {
    var _a, _b, _c;
    const locations = [...LOCATIONS];
    const qualities = [...QUALITY_LEVELS];
    const location = (_a = locations.find((l) => l.id === input.locationId)) !== null && _a !== void 0 ? _a : locations[0];
    const quality = (_b = qualities.find((q) => q.id === input.qualityId)) !== null && _b !== void 0 ? _b : qualities[0];
    const baseCostPerSqm = (_c = input.customCostPerSqm) !== null && _c !== void 0 ? _c : quality.baseCostPerSqm;
    const costPerSqm = Math.round(baseCostPerSqm * location.multiplier);
    const sizeCorrectionFactor = getSizeCorrectionFactor(input.livingArea);
    const correctedCostPerSqm = Math.round(costPerSqm * sizeCorrectionFactor);
    const rawBuildingCost = Math.round(input.effectiveArea * correctedCostPerSqm);
    const kg200Base = Math.round(rawBuildingCost * BASE_GROUP_SHARE_KG200);
    const kg300Base = Math.round(rawBuildingCost * BASE_GROUP_SHARE_KG300);
    const kg400Base = Math.round(rawBuildingCost * BASE_GROUP_SHARE_KG400);
    return {
        baseCostPerSqm,
        costPerSqm,
        sizeCorrectionFactor,
        correctedCostPerSqm,
        rawBuildingCost: kg300Base + kg400Base,
        baseConstructionCost: rawBuildingCost,
        kg200Base,
        kg300Base,
        kg400Base
    };
}
