import { LANDSCAPING_BASE_COST_PER_SQM, SITE_CONDITIONS, getLandscapingSizeAdjustment } from "../../constants/construction";
export function calculateLandscapingCosts(input) {
    if (!input.landscapingArea || input.landscapingArea <= 0) {
        return {
            landscapingCost: 0
        };
    }
    const siteConditions = [...SITE_CONDITIONS];
    const siteCondition = siteConditions.find(s => s.id === input.siteConditionId) || siteConditions[0];
    const baseCost = input.landscapingArea * LANDSCAPING_BASE_COST_PER_SQM;
    const sizeAdjustment = getLandscapingSizeAdjustment(input.landscapingArea);
    const terrainMultiplier = siteCondition.terrainMultiplier;
    const landscapingCost = baseCost * (1 + sizeAdjustment) * terrainMultiplier;
    return {
        landscapingCost: Math.round(landscapingCost)
    };
}
