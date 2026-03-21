"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateKg300Modifiers = calculateKg300Modifiers;
const SUBGROUP_310_SITE_CONDITION_RATES = {
    flat_normal: 0.00,
    flat_rocky: 0.08,
    inclined_normal: 0.06,
    inclined_rocky: 0.15,
    inclined_sandy: 0.18,
};
const SUBGROUP_310_GROUNDWATER_RATES = {
    normal: 0.00,
    moderate: 0.02,
    high: 0.05,
};
const SUBGROUP_320_SITE_CONDITION_RATES = {
    flat_normal: 0.00,
    flat_rocky: 0.03,
    inclined_normal: 0.02,
    inclined_rocky: 0.08,
    inclined_sandy: 0.10,
};
const SUBGROUP_320_GROUNDWATER_RATES = {
    normal: 0.00,
    moderate: 0.06,
    high: 0.15,
};
const SUBGROUP_330_SITE_CONDITION_RATES = {
    flat_normal: 0.00,
    flat_rocky: 0.01,
    inclined_normal: 0.01,
    inclined_rocky: 0.03,
    inclined_sandy: 0.04,
};
const SUBGROUP_330_GROUNDWATER_RATES = {
    normal: 0.00,
    moderate: 0.00,
    high: 0.02,
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
    inclined_rocky: 0.02,
    inclined_sandy: 0.03,
};
const SUBGROUP_350_GROUNDWATER_RATES = {
    normal: 0.00,
    moderate: 0.00,
    high: 0.00,
};
const SUBGROUP_360_SITE_CONDITION_RATES = {
    flat_normal: 0.00,
    flat_rocky: 0.00,
    inclined_normal: 0.00,
    inclined_rocky: 0.00,
    inclined_sandy: 0.00,
};
const SUBGROUP_360_GROUNDWATER_RATES = {
    normal: 0.00,
    moderate: 0.00,
    high: 0.00,
};
function calculateKg300Modifiers(input) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    const baseSubgroup310Cost = input.kg300SubgroupCosts.subgroup310Cost;
    const siteConditionRate310 = (_a = SUBGROUP_310_SITE_CONDITION_RATES[input.siteConditionId]) !== null && _a !== void 0 ? _a : 0;
    const siteConditionExtra310 = Math.round(baseSubgroup310Cost * siteConditionRate310);
    const subgroup310AfterSite = baseSubgroup310Cost + siteConditionExtra310;
    const groundwaterRate310 = (_b = SUBGROUP_310_GROUNDWATER_RATES[input.groundwaterConditionId]) !== null && _b !== void 0 ? _b : 0;
    const groundwaterExtra310 = Math.round(subgroup310AfterSite * groundwaterRate310);
    const subgroup310AfterGroundwater = subgroup310AfterSite + groundwaterExtra310;
    const resolvedSiteAccessibilityFactor = (_c = input.siteAccessibilityFactor) !== null && _c !== void 0 ? _c : 1.00;
    const accessibilityRate310 = Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.60;
    const accessibilityExtra310 = Math.round(subgroup310AfterGroundwater * accessibilityRate310);
    const finalSubgroup310Cost = subgroup310AfterGroundwater + accessibilityExtra310;
    const baseSubgroup320Cost = input.kg300SubgroupCosts.subgroup320Cost;
    const siteConditionRate320 = (_d = SUBGROUP_320_SITE_CONDITION_RATES[input.siteConditionId]) !== null && _d !== void 0 ? _d : 0;
    const siteConditionExtra320 = Math.round(baseSubgroup320Cost * siteConditionRate320);
    const subgroup320AfterSite = baseSubgroup320Cost + siteConditionExtra320;
    const groundwaterRate320 = (_e = SUBGROUP_320_GROUNDWATER_RATES[input.groundwaterConditionId]) !== null && _e !== void 0 ? _e : 0;
    const groundwaterExtra320 = Math.round(subgroup320AfterSite * groundwaterRate320);
    const subgroup320AfterGroundwater = subgroup320AfterSite + groundwaterExtra320;
    const accessibilityRate320 = Math.max(0, resolvedSiteAccessibilityFactor - 1) * 1.00;
    const accessibilityExtra320 = Math.round(subgroup320AfterGroundwater * accessibilityRate320);
    const finalSubgroup320Cost = subgroup320AfterGroundwater + accessibilityExtra320;
    const baseSubgroup330Cost = input.kg300SubgroupCosts.subgroup330Cost;
    const siteConditionRate330 = (_f = SUBGROUP_330_SITE_CONDITION_RATES[input.siteConditionId]) !== null && _f !== void 0 ? _f : 0;
    const siteConditionExtra330 = Math.round(baseSubgroup330Cost * siteConditionRate330);
    const subgroup330AfterSite = baseSubgroup330Cost + siteConditionExtra330;
    const groundwaterRate330 = (_g = SUBGROUP_330_GROUNDWATER_RATES[input.groundwaterConditionId]) !== null && _g !== void 0 ? _g : 0;
    const groundwaterExtra330 = Math.round(subgroup330AfterSite * groundwaterRate330);
    const subgroup330AfterGroundwater = subgroup330AfterSite + groundwaterExtra330;
    const accessibilityRate330 = Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.45;
    const accessibilityExtra330 = Math.round(subgroup330AfterGroundwater * accessibilityRate330);
    const finalSubgroup330Cost = subgroup330AfterGroundwater + accessibilityExtra330;
    const baseSubgroup340Cost = input.kg300SubgroupCosts.subgroup340Cost;
    const siteConditionRate340 = (_h = SUBGROUP_340_SITE_CONDITION_RATES[input.siteConditionId]) !== null && _h !== void 0 ? _h : 0;
    const siteConditionExtra340 = Math.round(baseSubgroup340Cost * siteConditionRate340);
    const subgroup340AfterSite = baseSubgroup340Cost + siteConditionExtra340;
    const groundwaterRate340 = (_j = SUBGROUP_340_GROUNDWATER_RATES[input.groundwaterConditionId]) !== null && _j !== void 0 ? _j : 0;
    const groundwaterExtra340 = Math.round(subgroup340AfterSite * groundwaterRate340);
    const subgroup340AfterGroundwater = subgroup340AfterSite + groundwaterExtra340;
    const accessibilityRate340 = Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.25;
    const accessibilityExtra340 = Math.round(subgroup340AfterGroundwater * accessibilityRate340);
    const finalSubgroup340Cost = subgroup340AfterGroundwater + accessibilityExtra340;
    const baseSubgroup350Cost = input.kg300SubgroupCosts.subgroup350Cost;
    const siteConditionRate350 = (_k = SUBGROUP_350_SITE_CONDITION_RATES[input.siteConditionId]) !== null && _k !== void 0 ? _k : 0;
    const siteConditionExtra350 = Math.round(baseSubgroup350Cost * siteConditionRate350);
    const subgroup350AfterSite = baseSubgroup350Cost + siteConditionExtra350;
    const groundwaterRate350 = (_l = SUBGROUP_350_GROUNDWATER_RATES[input.groundwaterConditionId]) !== null && _l !== void 0 ? _l : 0;
    const groundwaterExtra350 = Math.round(subgroup350AfterSite * groundwaterRate350);
    const subgroup350AfterGroundwater = subgroup350AfterSite + groundwaterExtra350;
    const accessibilityRate350 = Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.60;
    const accessibilityExtra350 = Math.round(subgroup350AfterGroundwater * accessibilityRate350);
    const finalSubgroup350Cost = subgroup350AfterGroundwater + accessibilityExtra350;
    const baseSubgroup360Cost = input.kg300SubgroupCosts.subgroup360Cost;
    const siteConditionRate360 = (_m = SUBGROUP_360_SITE_CONDITION_RATES[input.siteConditionId]) !== null && _m !== void 0 ? _m : 0;
    const siteConditionExtra360 = Math.round(baseSubgroup360Cost * siteConditionRate360);
    const subgroup360AfterSite = baseSubgroup360Cost + siteConditionExtra360;
    const groundwaterRate360 = (_o = SUBGROUP_360_GROUNDWATER_RATES[input.groundwaterConditionId]) !== null && _o !== void 0 ? _o : 0;
    const groundwaterExtra360 = Math.round(subgroup360AfterSite * groundwaterRate360);
    const subgroup360AfterGroundwater = subgroup360AfterSite + groundwaterExtra360;
    const accessibilityRate360 = Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.20;
    const accessibilityExtra360 = Math.round(subgroup360AfterGroundwater * accessibilityRate360);
    const finalSubgroup360Cost = subgroup360AfterGroundwater + accessibilityExtra360;
    const kg300SubgroupCosts = Object.assign(Object.assign({}, input.kg300SubgroupCosts), { subgroup310Cost: finalSubgroup310Cost, subgroup320Cost: finalSubgroup320Cost, subgroup330Cost: finalSubgroup330Cost, subgroup340Cost: finalSubgroup340Cost, subgroup350Cost: finalSubgroup350Cost, subgroup360Cost: finalSubgroup360Cost });
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
            subgroup310: {
                baseCost: baseSubgroup310Cost,
                siteConditionRate: siteConditionRate310,
                siteConditionExtra: siteConditionExtra310,
                groundwaterRate: groundwaterRate310,
                groundwaterExtra: groundwaterExtra310,
                accessibilityRate: accessibilityRate310,
                accessibilityExtra: accessibilityExtra310,
                finalCost: finalSubgroup310Cost,
            },
            subgroup320: {
                baseCost: baseSubgroup320Cost,
                siteConditionRate: siteConditionRate320,
                siteConditionExtra: siteConditionExtra320,
                groundwaterRate: groundwaterRate320,
                groundwaterExtra: groundwaterExtra320,
                accessibilityRate: accessibilityRate320,
                accessibilityExtra: accessibilityExtra320,
                finalCost: finalSubgroup320Cost,
            },
            subgroup330: {
                baseCost: baseSubgroup330Cost,
                siteConditionRate: siteConditionRate330,
                siteConditionExtra: siteConditionExtra330,
                groundwaterRate: groundwaterRate330,
                groundwaterExtra: groundwaterExtra330,
                accessibilityRate: accessibilityRate330,
                accessibilityExtra: accessibilityExtra330,
                finalCost: finalSubgroup330Cost,
            },
            subgroup340: {
                baseCost: baseSubgroup340Cost,
                siteConditionRate: siteConditionRate340,
                siteConditionExtra: siteConditionExtra340,
                groundwaterRate: groundwaterRate340,
                groundwaterExtra: groundwaterExtra340,
                accessibilityRate: accessibilityRate340,
                accessibilityExtra: accessibilityExtra340,
                finalCost: finalSubgroup340Cost,
            },
            subgroup350: {
                baseCost: baseSubgroup350Cost,
                siteConditionRate: siteConditionRate350,
                siteConditionExtra: siteConditionExtra350,
                groundwaterRate: groundwaterRate350,
                groundwaterExtra: groundwaterExtra350,
                accessibilityRate: accessibilityRate350,
                accessibilityExtra: accessibilityExtra350,
                finalCost: finalSubgroup350Cost,
            },
            subgroup360: {
                baseCost: baseSubgroup360Cost,
                siteConditionRate: siteConditionRate360,
                siteConditionExtra: siteConditionExtra360,
                groundwaterRate: groundwaterRate360,
                groundwaterExtra: groundwaterExtra360,
                accessibilityRate: accessibilityRate360,
                accessibilityExtra: accessibilityExtra360,
                finalCost: finalSubgroup360Cost,
            },
        },
    };
}
