"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSiteExcavationBaseCost = calculateSiteExcavationBaseCost;
exports.calculateKg200Costs = calculateKg200Costs;
const construction_1 = require("../../constants/construction");
const SUBGROUP_210_MINIMUM_BASE_COST = 300;
const SUBGROUP_210_ACCESS_SURCHARGES = {
    normal: 0,
    limited: 250,
    difficult: 600,
    very_difficult: 1000,
};
const SUBGROUP_210_SITE_CONDITION_RATES = {
    flat_normal: 0,
    flat_rocky: 0.10,
    inclined_normal: 0.20,
    inclined_rocky: 0.35,
    inclined_sandy: 0.50,
};
function calculateSiteExcavationBaseCost(input) {
    var _a;
    const landscapingArea = Math.max(0, (_a = input.landscapingArea) !== null && _a !== void 0 ? _a : 0);
    const sitePrepBaseArea = Math.max(0, input.buildingArea) + landscapingArea;
    return Math.max(SUBGROUP_210_MINIMUM_BASE_COST, Math.round(sitePrepBaseArea));
}
function calculateKg200Costs(input) {
    var _a, _b, _c, _d, _e, _f;
    const siteCondition = (_a = construction_1.SITE_CONDITIONS.find((s) => s.id === input.siteConditionId)) !== null && _a !== void 0 ? _a : construction_1.SITE_CONDITIONS[0];
    const utility = (_b = construction_1.UTILITY_CONNECTION_OPTIONS.find((u) => u.id === input.utilityConnectionId)) !== null && _b !== void 0 ? _b : construction_1.UTILITY_CONNECTION_OPTIONS[0];
    const accessibility = (_c = construction_1.SITE_ACCESSIBILITY_OPTIONS.find((a) => a.id === input.accessibilityId)) !== null && _c !== void 0 ? _c : construction_1.SITE_ACCESSIBILITY_OPTIONS[0];
    const utilityConnectionCost = utility.id === "custom"
        ? ((_d = input.customUtilityCost) !== null && _d !== void 0 ? _d : 0)
        : utility.cost;
    const utilityGroupCosts = (0, construction_1.getUtilityConnectionGroupCosts)(input.utilityConnectionId, utilityConnectionCost);
    const subgroup210BaseCost = calculateSiteExcavationBaseCost({
        buildingArea: input.buildingArea,
        landscapingArea: input.landscapingArea,
    });
    const subgroup210AccessExtra = (_e = SUBGROUP_210_ACCESS_SURCHARGES[accessibility.id]) !== null && _e !== void 0 ? _e : 0;
    const subgroup210SiteConditionExtra = Math.round(subgroup210BaseCost * ((_f = SUBGROUP_210_SITE_CONDITION_RATES[siteCondition.id]) !== null && _f !== void 0 ? _f : 0));
    const subgroup210Cost = subgroup210BaseCost +
        subgroup210AccessExtra +
        subgroup210SiteConditionExtra;
    const subgroup220Cost = utilityGroupCosts.group220Cost;
    const subgroup230Cost = utilityGroupCosts.group230Cost;
    const group240Cost = 0;
    const group250Cost = 0;
    const kg200Total = subgroup210Cost +
        utilityConnectionCost +
        group240Cost +
        group250Cost;
    return {
        siteExcavationCost: subgroup210Cost,
        siteExcavationBaseCost: subgroup210BaseCost,
        siteExcavationAccessExtra: subgroup210AccessExtra,
        siteExcavationConditionExtra: subgroup210SiteConditionExtra,
        utilityConnectionCost: Math.round(utilityConnectionCost),
        group220Cost: subgroup220Cost,
        group230Cost: subgroup230Cost,
        group240Cost,
        group250Cost,
        kg200Total: Math.round(kg200Total)
    };
}
