import { SITE_CONDITIONS, GROUNDWATER_CONDITIONS, SITE_ACCESSIBILITY_OPTIONS, UTILITY_CONNECTION_OPTIONS, clampSitePreparationMultiplier, getBasementExcavationCost, getPlotSizeFactor, getUtilityConnectionGroupCosts } from "../../constants/construction";
export function calculateSiteCosts(input) {
    var _a, _b, _c, _d, _e;
    const siteConditions = [...SITE_CONDITIONS];
    const groundwaterConditions = [...GROUNDWATER_CONDITIONS];
    const accessibilityOptions = [...SITE_ACCESSIBILITY_OPTIONS];
    const utilityOptions = [...UTILITY_CONNECTION_OPTIONS];
    const siteCondition = (_a = siteConditions.find((s) => s.id === input.siteConditionId)) !== null && _a !== void 0 ? _a : siteConditions[0];
    const groundwater = (_b = groundwaterConditions.find((g) => g.id === input.groundwaterConditionId)) !== null && _b !== void 0 ? _b : groundwaterConditions[0];
    const utility = (_c = utilityOptions.find((u) => u.id === input.utilityConnectionId)) !== null && _c !== void 0 ? _c : utilityOptions[0];
    const accessibility = (_d = accessibilityOptions.find((a) => a.id === input.accessibilityId)) !== null && _d !== void 0 ? _d : accessibilityOptions[0];
    const sitePreparationMultiplier = clampSitePreparationMultiplier(getPlotSizeFactor(input.plotSize) *
        siteCondition.sitePreparationFactor *
        accessibility.sitePreparationFactor);
    // basement excavation
    const basementExcavationCost = getBasementExcavationCost(input.basementArea, siteCondition, groundwater);
    // utilities
    const utilityConnectionCost = utility.id === "custom"
        ? ((_e = input.customUtilityCost) !== null && _e !== void 0 ? _e : 0)
        : utility.cost;
    const utilityGroupCosts = getUtilityConnectionGroupCosts(input.utilityConnectionId, utilityConnectionCost);
    // logistics / access
    const group240Cost = 0;
    const accessibilityCost = 0;
    const group250Cost = accessibilityCost;
    const kg200Adjustments = utilityConnectionCost
        + group240Cost
        + group250Cost;
    const kg200Total = input.kg200Base +
        kg200Adjustments;
    return {
        siteExcavationCost: Math.round(input.kg200Base * sitePreparationMultiplier),
        basementExcavationCost: Math.round(basementExcavationCost),
        utilityConnectionCost: Math.round(utilityConnectionCost),
        group220Cost: utilityGroupCosts.group220Cost,
        group230Cost: utilityGroupCosts.group230Cost,
        group240Cost,
        accessibilityCost,
        group250Cost,
        kg200Total: Math.round(kg200Total)
    };
}
