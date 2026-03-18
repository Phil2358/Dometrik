import { calculateEffectiveArea } from "./modules/effectiveArea";
import { calculateRawBuildingCost } from "./modules/rawBuildingCost";
import { calculateCategoryCosts, calculateKg300SubgroupCosts, calculateWeightedBasementArea, getAdjustedKg300Share } from "./modules/categoryCosts";
import { calculateSiteCosts } from "./modules/siteCosts";
import { calculateBasementCosts } from "./modules/basementCosts";
import { calculateKg400Costs } from "./modules/kg400Costs";
import { calculatePoolCosts } from "./modules/poolCosts";
import { calculateLandscapingCosts } from "./modules/landscapingCosts";
import { calculatePermitCosts } from "./modules/permitCosts";
import { getResidentialProgramBaseline, SITE_ACCESSIBILITY_OPTIONS, } from "../constants/construction";
export function calculateProjectCost(input) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const totalBasementArea = ((_a = input.storageBasementArea) !== null && _a !== void 0 ? _a : 0) +
        ((_b = input.parkingBasementArea) !== null && _b !== void 0 ? _b : 0) +
        ((_c = input.habitableBasementArea) !== null && _c !== void 0 ? _c : 0);
    const resolvedBasementArea = totalBasementArea > 0
        ? totalBasementArea
        : ((_d = input.basementArea) !== null && _d !== void 0 ? _d : 0);
    // -----------------------------------------
    // Effective area
    // -----------------------------------------
    const effectiveArea = calculateEffectiveArea({
        mainArea: input.mainArea,
        terraceArea: input.terraceArea,
        balconyArea: input.balconyArea,
        basementArea: input.basementArea,
        basementTypeId: input.basementTypeId,
        storageBasementArea: input.storageBasementArea,
        parkingBasementArea: input.parkingBasementArea,
        habitableBasementArea: input.habitableBasementArea
    });
    const weightedBasementArea = calculateWeightedBasementArea({
        storageBasementArea: input.storageBasementArea,
        parkingBasementArea: input.parkingBasementArea,
        habitableBasementArea: input.habitableBasementArea
    });
    const weightedBasementRatio = weightedBasementArea / Math.max(input.mainArea, 1);
    // -----------------------------------------
    // Raw building cost
    // -----------------------------------------
    const buildingCost = calculateRawBuildingCost({
        livingArea: input.mainArea,
        effectiveArea,
        locationId: input.locationId,
        qualityId: input.qualityId,
        customCostPerSqm: input.customCostPerSqm
    });
    // -----------------------------------------
    // Category costs (DIN276 groups)
    // -----------------------------------------
    const residentialProgramBaseline = getResidentialProgramBaseline(input.mainArea);
    const bedroomCount = (_e = input.bedroomCount) !== null && _e !== void 0 ? _e : residentialProgramBaseline.bedrooms;
    const bathrooms = (_f = input.bathrooms) !== null && _f !== void 0 ? _f : residentialProgramBaseline.bathrooms;
    const wcs = (_g = input.wcs) !== null && _g !== void 0 ? _g : residentialProgramBaseline.wcs;
    const siteAccessibility = (_h = SITE_ACCESSIBILITY_OPTIONS.find((option) => option.id === input.accessibilityId)) !== null && _h !== void 0 ? _h : SITE_ACCESSIBILITY_OPTIONS[0];
    const kg400Costs = calculateKg400Costs({
        mainArea: input.mainArea,
        finalCostPerSqm: buildingCost.correctedCostPerSqm,
        qualityId: input.qualityId,
        siteAccessibilityFactor: siteAccessibility.sitePreparationFactor,
        bedroomDelta: bedroomCount - residentialProgramBaseline.bedrooms,
        bathroomDelta: bathrooms - residentialProgramBaseline.bathrooms,
        wcDelta: wcs - residentialProgramBaseline.wcs,
        habitableBasementArea: input.habitableBasementArea,
        hvacSelections: input.hvacSelections,
    });
    // -----------------------------------------
    // Category costs (DIN276 groups)
    // -----------------------------------------
    const categoryCosts = calculateCategoryCosts({
        kg300Base: Math.round(buildingCost.baseConstructionCost * getAdjustedKg300Share(weightedBasementRatio))
    });
    // -----------------------------------------
    // Permit costs
    // -----------------------------------------
    const permitCosts = calculatePermitCosts({
        effectiveArea,
        qualityId: input.qualityId
    });
    // -----------------------------------------
    // Site costs
    // -----------------------------------------
    const siteCosts = calculateSiteCosts({
        kg200Base: buildingCost.kg200Base,
        plotSize: input.plotSize,
        mainArea: input.mainArea,
        basementArea: resolvedBasementArea,
        siteConditionId: input.siteConditionId,
        groundwaterConditionId: input.groundwaterConditionId,
        accessibilityId: input.accessibilityId,
        utilityConnectionId: input.utilityConnectionId,
        customUtilityCost: input.customUtilityCost
    });
    // -----------------------------------------
    // Basement structural costs
    // -----------------------------------------
    const basementCosts = calculateBasementCosts({
        basementArea: input.basementArea,
        basementTypeId: input.basementTypeId,
        storageBasementArea: input.storageBasementArea,
        parkingBasementArea: input.parkingBasementArea,
        habitableBasementArea: input.habitableBasementArea,
        groundwaterConditionId: input.groundwaterConditionId,
        siteConditionIsRocky: input.siteConditionId === "rock"
    });
    const kg300Total = categoryCosts.kg300Total;
    const kg300SubgroupCosts = calculateKg300SubgroupCosts({
        kg300Total,
        effectiveArea,
        storageBasementArea: input.storageBasementArea,
        parkingBasementArea: input.parkingBasementArea,
        habitableBasementArea: input.habitableBasementArea,
        qualityId: input.qualityId,
        selectedFinalCostPerSqm: buildingCost.correctedCostPerSqm
    });
    // -----------------------------------------
    // Pool
    // -----------------------------------------
    const poolCosts = calculatePoolCosts({
        includePool: input.includePool,
        poolSizeId: input.poolSizeId,
        poolCustomArea: input.poolCustomArea,
        poolDepth: input.poolDepth,
        poolQualityId: input.poolQualityId,
        poolTypeId: input.poolTypeId,
        siteConditionId: input.siteConditionId
    });
    // -----------------------------------------
    // Landscaping
    // -----------------------------------------
    const landscapingCosts = calculateLandscapingCosts({
        landscapingArea: input.landscapingArea,
        siteConditionId: input.siteConditionId
    });
    // -----------------------------------------
    // Total project cost
    // -----------------------------------------
    const totalCost = categoryCosts.kg300Total
        + kg400Costs.kg400Total
        + siteCosts.kg200Total
        + poolCosts.poolCost
        + landscapingCosts.landscapingCost
        + permitCosts.permitFee;
    // -----------------------------------------
    // Return result
    // -----------------------------------------
    return {
        totalCost,
        rawBuildingCost: buildingCost.rawBuildingCost,
        kg300SubgroupCosts,
        permitFee: permitCosts.permitFee,
        landscapingCost: landscapingCosts.landscapingCost,
        poolCost: poolCosts.poolCost,
        hvacExtrasCost: kg400Costs.hvacExtrasCost,
        siteCost: siteCosts.kg200Total
    };
}
