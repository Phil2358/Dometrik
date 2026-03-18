import { BASEMENT_TYPES, BASE_GROUP_SHARE_KG300, COST_CATEGORIES, KG300_CATEGORY_IDS, KG600_CATEGORY_IDS } from "../../constants/construction";
const KG300_FLEXIBLE_SUBGROUP_SHARES = {
    standard: {
        subgroup330Share: 0.55,
        subgroup340Share: 0.27,
        subgroup360Share: 0.13,
        subgroup390Share: 0.05
    },
    premium: {
        subgroup330Share: 0.60,
        subgroup340Share: 0.24,
        subgroup360Share: 0.11,
        subgroup390Share: 0.05
    },
    luxury: {
        subgroup330Share: 0.63,
        subgroup340Share: 0.21,
        subgroup360Share: 0.11,
        subgroup390Share: 0.05
    }
};
export function calculateWeightedBasementArea(input) {
    var _a, _b, _c, _d, _e, _f;
    const storageBasementType = (_a = BASEMENT_TYPES.find((entry) => entry.id === "storage")) !== null && _a !== void 0 ? _a : BASEMENT_TYPES[0];
    const parkingBasementType = (_b = BASEMENT_TYPES.find((entry) => entry.id === "parking")) !== null && _b !== void 0 ? _b : BASEMENT_TYPES[0];
    const habitableBasementType = (_c = BASEMENT_TYPES.find((entry) => entry.id === "habitable")) !== null && _c !== void 0 ? _c : BASEMENT_TYPES[0];
    return ((_d = input.storageBasementArea) !== null && _d !== void 0 ? _d : 0) * storageBasementType.costFactor
        + ((_e = input.parkingBasementArea) !== null && _e !== void 0 ? _e : 0) * parkingBasementType.costFactor
        + ((_f = input.habitableBasementArea) !== null && _f !== void 0 ? _f : 0) * habitableBasementType.costFactor;
}
export function getAdjustedKg300Share(weightedBasementRatio) {
    if (weightedBasementRatio <= 0)
        return BASE_GROUP_SHARE_KG300;
    if (weightedBasementRatio <= 0.15)
        return 0.655;
    if (weightedBasementRatio <= 0.30)
        return 0.67;
    return 0.685;
}
export function calculateKg300SubgroupCosts(input) {
    var _a;
    const weightedBasementArea = calculateWeightedBasementArea({
        storageBasementArea: input.storageBasementArea,
        parkingBasementArea: input.parkingBasementArea,
        habitableBasementArea: input.habitableBasementArea
    });
    const noBasementEffectiveArea = Math.max(0, input.effectiveArea - weightedBasementArea);
    const noBasementConstructionCost = noBasementEffectiveArea * input.selectedFinalCostPerSqm;
    const baseKg300NonBasement = Math.round(noBasementConstructionCost * BASE_GROUP_SHARE_KG300);
    const kg300BasementIncrement = Math.max(0, input.kg300Total - baseKg300NonBasement);
    const baseSubgroup310Cost = Math.round(baseKg300NonBasement * 0.06);
    const baseSubgroup320Cost = Math.round(baseKg300NonBasement * 0.12);
    const baseSubgroup350Cost = Math.round(baseKg300NonBasement * 0.20);
    const subgroup310Increment = Math.round(kg300BasementIncrement * 0.30);
    const subgroup320Increment = Math.round(kg300BasementIncrement * 0.35);
    const subgroup350Increment = Math.round(kg300BasementIncrement * 0.20);
    const subgroup330Increment = Math.round(kg300BasementIncrement * 0.10);
    const subgroup340Increment = Math.round(kg300BasementIncrement
        - subgroup310Increment
        - subgroup320Increment
        - subgroup350Increment
        - subgroup330Increment);
    const baseStructuralCore = baseSubgroup310Cost + baseSubgroup320Cost + baseSubgroup350Cost;
    const flexibleKG300 = Math.max(0, baseKg300NonBasement - baseStructuralCore);
    const flexibleShares = (_a = KG300_FLEXIBLE_SUBGROUP_SHARES[input.qualityId]) !== null && _a !== void 0 ? _a : KG300_FLEXIBLE_SUBGROUP_SHARES.premium;
    const subgroup330Cost = Math.round(flexibleKG300 * flexibleShares.subgroup330Share);
    const subgroup340Cost = Math.round(flexibleKG300 * flexibleShares.subgroup340Share);
    const subgroup360Cost = Math.round(flexibleKG300 * flexibleShares.subgroup360Share);
    const subgroup390Cost = Math.round(flexibleKG300
        - subgroup330Cost
        - subgroup340Cost
        - subgroup360Cost);
    return {
        subgroup310Cost: baseSubgroup310Cost + subgroup310Increment,
        subgroup320Cost: baseSubgroup320Cost + subgroup320Increment,
        subgroup330Cost: subgroup330Cost + subgroup330Increment,
        subgroup340Cost: subgroup340Cost + subgroup340Increment,
        subgroup350Cost: baseSubgroup350Cost + subgroup350Increment,
        subgroup360Cost,
        subgroup370Cost: 0,
        subgroup380Cost: 0,
        subgroup390Cost
    };
}
export function calculateCategoryCosts(input) {
    // KG400 source of truth lives in kg400Costs.ts.
    // This helper only owns the benchmark-driven KG300/KG600 category skeleton.
    const categoryCosts = COST_CATEGORIES.map(category => {
        const groupBase = category.din276 === 'KG 300'
            ? input.kg300Base
            : 0;
        const groupPercentage = category.din276 === 'KG 300'
            ? category.percentage / 67
            : 0;
        let cost = groupPercentage * groupBase;
        return {
            id: category.id,
            din276: category.din276,
            name: category.name,
            percentage: category.percentage,
            cost: Math.round(cost)
        };
    });
    const kg300Total = categoryCosts
        .filter(c => KG300_CATEGORY_IDS.includes(c.id))
        .reduce((sum, c) => sum + c.cost, 0);
    const kg600Total = categoryCosts
        .filter(c => KG600_CATEGORY_IDS.includes(c.id))
        .reduce((sum, c) => sum + c.cost, 0);
    return {
        categoryCosts,
        kg300Total,
        kg400Total: 0,
        kg600Total
    };
}
