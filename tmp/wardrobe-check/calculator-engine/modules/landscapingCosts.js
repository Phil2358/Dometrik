"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLandscapingCosts = calculateLandscapingCosts;
const construction_1 = require("../../constants/construction");
function calculateLandscapingCosts(input) {
    if (!input.landscapingArea || input.landscapingArea <= 0) {
        return {
            landscapingCost: 0
        };
    }
    const siteConditions = [...construction_1.SITE_CONDITIONS];
    const siteCondition = siteConditions.find(s => s.id === input.siteConditionId) || siteConditions[0];
    const baseCost = input.landscapingArea * construction_1.LANDSCAPING_BASE_COST_PER_SQM;
    const terrainMultiplier = siteCondition.terrainMultiplier;
    const landscapingCost = baseCost * terrainMultiplier;
    return {
        landscapingCost: Math.round(landscapingCost)
    };
}
