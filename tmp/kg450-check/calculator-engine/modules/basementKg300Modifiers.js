"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBasementKg300Modifiers = calculateBasementKg300Modifiers;
const SUBGROUP_310_SITE_CONDITION_RATES = {
    flat_normal: 0.00,
    flat_rocky: 0.12,
    inclined_normal: 0.10,
    inclined_rocky: 0.22,
    inclined_sandy: 0.28,
};
const SUBGROUP_310_GROUNDWATER_RATES = {
    normal: 0.00,
    moderate: 0.04,
    high: 0.10,
};
const SUBGROUP_320_SITE_CONDITION_RATES = {
    flat_normal: 0.00,
    flat_rocky: 0.05,
    inclined_normal: 0.04,
    inclined_rocky: 0.10,
    inclined_sandy: 0.12,
};
const SUBGROUP_320_GROUNDWATER_RATES = {
    normal: 0.00,
    moderate: 0.10,
    high: 0.22,
};
const SUBGROUP_330_SITE_CONDITION_RATES = {
    flat_normal: 0.00,
    flat_rocky: 0.02,
    inclined_normal: 0.02,
    inclined_rocky: 0.05,
    inclined_sandy: 0.06,
};
const SUBGROUP_330_GROUNDWATER_RATES = {
    normal: 0.00,
    moderate: 0.00,
    high: 0.03,
};
const SUBGROUP_340_SITE_CONDITION_RATES = {
    flat_normal: 0.00,
    flat_rocky: 0.00,
    inclined_normal: 0.00,
    inclined_rocky: 0.00,
    inclined_sandy: 0.00,
};
const SUBGROUP_340_GROUNDWATER_RATES = {
    normal: 0.00,
    moderate: 0.00,
    high: 0.00,
};
const SUBGROUP_350_SITE_CONDITION_RATES = {
    flat_normal: 0.00,
    flat_rocky: 0.00,
    inclined_normal: 0.01,
    inclined_rocky: 0.03,
    inclined_sandy: 0.04,
};
const SUBGROUP_350_GROUNDWATER_RATES = {
    normal: 0.00,
    moderate: 0.00,
    high: 0.00,
};
function applySequentialSurcharges(input) {
    const siteConditionExtra = Math.round(input.baseCost * input.siteConditionRate);
    const subtotalAfterSite = input.baseCost + siteConditionExtra;
    const groundwaterExtra = Math.round(subtotalAfterSite * input.groundwaterRate);
    const subtotalAfterGroundwater = subtotalAfterSite + groundwaterExtra;
    const accessibilityExtra = Math.round(subtotalAfterGroundwater * input.accessibilityRate);
    const finalCost = subtotalAfterGroundwater + accessibilityExtra;
    return {
        baseCost: input.baseCost,
        siteConditionRate: input.siteConditionRate,
        siteConditionExtra,
        groundwaterRate: input.groundwaterRate,
        groundwaterExtra,
        accessibilityRate: input.accessibilityRate,
        accessibilityExtra,
        finalCost,
    };
}
function calculateBasementKg300Modifiers(input) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const resolvedSiteAccessibilityFactor = (_a = input.siteAccessibilityFactor) !== null && _a !== void 0 ? _a : 1.00;
    const subgroup310 = applySequentialSurcharges({
        baseCost: input.kg300SubgroupCosts.subgroup310Cost,
        siteConditionRate: (_b = SUBGROUP_310_SITE_CONDITION_RATES[input.siteConditionId]) !== null && _b !== void 0 ? _b : 0,
        groundwaterRate: (_c = SUBGROUP_310_GROUNDWATER_RATES[input.groundwaterConditionId]) !== null && _c !== void 0 ? _c : 0,
        accessibilityRate: Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.70,
    });
    const subgroup320 = applySequentialSurcharges({
        baseCost: input.kg300SubgroupCosts.subgroup320Cost,
        siteConditionRate: (_d = SUBGROUP_320_SITE_CONDITION_RATES[input.siteConditionId]) !== null && _d !== void 0 ? _d : 0,
        groundwaterRate: (_e = SUBGROUP_320_GROUNDWATER_RATES[input.groundwaterConditionId]) !== null && _e !== void 0 ? _e : 0,
        accessibilityRate: Math.max(0, resolvedSiteAccessibilityFactor - 1) * 1.10,
    });
    const subgroup330 = applySequentialSurcharges({
        baseCost: input.kg300SubgroupCosts.subgroup330Cost,
        siteConditionRate: (_f = SUBGROUP_330_SITE_CONDITION_RATES[input.siteConditionId]) !== null && _f !== void 0 ? _f : 0,
        groundwaterRate: (_g = SUBGROUP_330_GROUNDWATER_RATES[input.groundwaterConditionId]) !== null && _g !== void 0 ? _g : 0,
        accessibilityRate: Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.45,
    });
    const subgroup340 = applySequentialSurcharges({
        baseCost: input.kg300SubgroupCosts.subgroup340Cost,
        siteConditionRate: (_h = SUBGROUP_340_SITE_CONDITION_RATES[input.siteConditionId]) !== null && _h !== void 0 ? _h : 0,
        groundwaterRate: (_j = SUBGROUP_340_GROUNDWATER_RATES[input.groundwaterConditionId]) !== null && _j !== void 0 ? _j : 0,
        accessibilityRate: Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.20,
    });
    const subgroup350 = applySequentialSurcharges({
        baseCost: input.kg300SubgroupCosts.subgroup350Cost,
        siteConditionRate: (_k = SUBGROUP_350_SITE_CONDITION_RATES[input.siteConditionId]) !== null && _k !== void 0 ? _k : 0,
        groundwaterRate: (_l = SUBGROUP_350_GROUNDWATER_RATES[input.groundwaterConditionId]) !== null && _l !== void 0 ? _l : 0,
        accessibilityRate: Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.55,
    });
    const kg300SubgroupCosts = Object.assign(Object.assign({}, input.kg300SubgroupCosts), { subgroup310Cost: subgroup310.finalCost, subgroup320Cost: subgroup320.finalCost, subgroup330Cost: subgroup330.finalCost, subgroup340Cost: subgroup340.finalCost, subgroup350Cost: subgroup350.finalCost });
    const kg300Total = kg300SubgroupCosts.subgroup310Cost +
        kg300SubgroupCosts.subgroup320Cost +
        kg300SubgroupCosts.subgroup330Cost +
        kg300SubgroupCosts.subgroup340Cost +
        kg300SubgroupCosts.subgroup350Cost +
        kg300SubgroupCosts.subgroup360Cost +
        kg300SubgroupCosts.subgroup370Cost +
        kg300SubgroupCosts.subgroup380Cost +
        kg300SubgroupCosts.subgroup390Cost;
    return {
        kg300Total,
        kg300SubgroupCosts,
        modifierDetails: {
            subgroup310,
            subgroup320,
            subgroup330,
            subgroup340,
            subgroup350,
        },
    };
}
