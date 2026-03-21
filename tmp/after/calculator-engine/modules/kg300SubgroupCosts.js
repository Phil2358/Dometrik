"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDetailedKg300SubgroupCosts = calculateDetailedKg300SubgroupCosts;
const construction_1 = require("../../constants/construction");
const KG300_BASE_FLEXIBLE_SHARES = {
    economy: {
        subgroup330Share: 0.495,
        subgroup340Share: 0.243,
        subgroup350Share: 0.10,
        subgroup360Share: 0.117,
        subgroup390Share: 0.045,
    },
    midRange: {
        subgroup330Share: 0.54,
        subgroup340Share: 0.216,
        subgroup350Share: 0.10,
        subgroup360Share: 0.099,
        subgroup390Share: 0.045,
    },
    luxury: {
        subgroup330Share: 0.567,
        subgroup340Share: 0.189,
        subgroup350Share: 0.10,
        subgroup360Share: 0.099,
        subgroup390Share: 0.045,
    },
};
function calculateDetailedKg300SubgroupCosts(input) {
    var _a;
    const kg300Total = Math.max(0, input.kg300Cost);
    const subgroup310BaseCost = Math.round(kg300Total * 0.02);
    const subgroup320BaseCost = Math.round(kg300Total * 0.12);
    const subgroup350StructuralBaseCost = Math.round(kg300Total * 0.10);
    const flexibleKg300 = Math.max(0, kg300Total - subgroup310BaseCost - subgroup320BaseCost - subgroup350StructuralBaseCost);
    const flexibleShares = (_a = KG300_BASE_FLEXIBLE_SHARES[input.qualityId]) !== null && _a !== void 0 ? _a : KG300_BASE_FLEXIBLE_SHARES[construction_1.DEFAULT_QUALITY_ID];
    const subgroup330Cost = Math.round(flexibleKg300 * flexibleShares.subgroup330Share);
    const subgroup340Cost = Math.round(flexibleKg300 * flexibleShares.subgroup340Share);
    const subgroup350FlexibleCost = Math.round(flexibleKg300 * flexibleShares.subgroup350Share);
    const subgroup350Cost = subgroup350StructuralBaseCost + subgroup350FlexibleCost;
    const subgroup360Cost = Math.round(flexibleKg300 * flexibleShares.subgroup360Share);
    const subgroup390Cost = kg300Total
        - subgroup310BaseCost
        - subgroup320BaseCost
        - subgroup330Cost
        - subgroup340Cost
        - subgroup350Cost
        - subgroup360Cost;
    return {
        kg300Total,
        kg300SubgroupCosts: {
            subgroup310Cost: subgroup310BaseCost,
            subgroup320Cost: subgroup320BaseCost,
            subgroup330Cost,
            subgroup340Cost,
            subgroup350Cost,
            subgroup360Cost,
            subgroup370Cost: 0,
            subgroup380Cost: 0,
            subgroup390Cost,
        },
    };
}
