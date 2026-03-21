"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProjectCost = calculateProjectCost;
const buildingArea_1 = require("./modules/buildingArea");
const rawBuildingCost_1 = require("./modules/rawBuildingCost");
const basementBaseCosts_1 = require("./modules/basementBaseCosts");
const categoryCosts_1 = require("./modules/categoryCosts");
const kg200Costs_1 = require("./modules/kg200Costs");
const kg400Costs_1 = require("./modules/kg400Costs");
const poolCosts_1 = require("./modules/poolCosts");
const landscapingCosts_1 = require("./modules/landscapingCosts");
const permitCosts_1 = require("./modules/permitCosts");
const kg600Costs_1 = require("./modules/kg600Costs");
const contractorMarginCosts_1 = require("./modules/contractorMarginCosts");
const contingencyCosts_1 = require("./modules/contingencyCosts");
const efkaCosts_1 = require("./modules/efkaCosts");
const vatCosts_1 = require("./modules/vatCosts");
const kg100Costs_1 = require("./modules/kg100Costs");
const kg300SubgroupCosts_1 = require("./modules/kg300SubgroupCosts");
const kg300Modifiers_1 = require("./modules/kg300Modifiers");
const basementKg300Modifiers_1 = require("./modules/basementKg300Modifiers");
const kg500Subgroups_1 = require("./modules/kg500Subgroups");
const kg700Subgroups_1 = require("./modules/kg700Subgroups");
const buildProjectCostBreakdown_1 = require("./buildProjectCostBreakdown");
const construction_1 = require("../constants/construction");
function addCostsById(left, right) {
    const categoryIds = new Set([...Object.keys(left), ...Object.keys(right)]);
    return Array.from(categoryIds).reduce((sum, categoryId) => {
        var _a, _b;
        sum[categoryId] = ((_a = left[categoryId]) !== null && _a !== void 0 ? _a : 0) + ((_b = right[categoryId]) !== null && _b !== void 0 ? _b : 0);
        return sum;
    }, {});
}
function addKg300SubgroupCosts(left, right) {
    return {
        subgroup310Cost: left.subgroup310Cost + right.subgroup310Cost,
        subgroup320Cost: left.subgroup320Cost + right.subgroup320Cost,
        subgroup330Cost: left.subgroup330Cost + right.subgroup330Cost,
        subgroup340Cost: left.subgroup340Cost + right.subgroup340Cost,
        subgroup350Cost: left.subgroup350Cost + right.subgroup350Cost,
        subgroup360Cost: left.subgroup360Cost + right.subgroup360Cost,
        subgroup370Cost: left.subgroup370Cost + right.subgroup370Cost,
        subgroup380Cost: left.subgroup380Cost + right.subgroup380Cost,
        subgroup390Cost: left.subgroup390Cost + right.subgroup390Cost,
    };
}
function calculateProjectCost(input) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const totalBasementArea = ((_a = input.storageBasementArea) !== null && _a !== void 0 ? _a : 0) +
        ((_b = input.parkingBasementArea) !== null && _b !== void 0 ? _b : 0) +
        ((_c = input.habitableBasementArea) !== null && _c !== void 0 ? _c : 0);
    const resolvedBasementArea = totalBasementArea > 0
        ? totalBasementArea
        : ((_d = input.basementArea) !== null && _d !== void 0 ? _d : 0);
    const qualityId = (0, construction_1.normalizeQualityId)(input.qualityId);
    // -----------------------------------------
    // Building area
    // -----------------------------------------
    const buildingArea = (0, buildingArea_1.calculateBuildingArea)({
        mainArea: input.mainArea,
        terraceArea: input.terraceArea,
        balconyArea: input.balconyArea,
        basementArea: input.basementArea,
        basementTypeId: input.basementTypeId,
        storageBasementArea: input.storageBasementArea,
        parkingBasementArea: input.parkingBasementArea,
        habitableBasementArea: input.habitableBasementArea
    });
    // -----------------------------------------
    // Raw building cost
    // -----------------------------------------
    const buildingCost = (0, rawBuildingCost_1.calculateRawBuildingCost)({
        buildingArea,
        locationId: input.locationId,
        qualityId,
        correctedBenchmarkOverridePerSqm: input.benchmarkOverridePerSqm
    });
    const benchmarkPreviewPerQuality = construction_1.QUALITY_LEVELS.reduce((previews, entry) => {
        previews[entry.id] = (0, rawBuildingCost_1.calculateRawBuildingCost)({
            buildingArea,
            locationId: input.locationId,
            qualityId: entry.id,
        }).correctedCostPerSqm;
        return previews;
    }, {});
    const baseBuildingAreaBenchmarkContribution = buildingCost.baseConstructionCost;
    const coveredTerracesBenchmarkContribution = Math.round(input.terraceArea * buildingCost.correctedCostPerSqm * 0.50);
    const balconyAreaBenchmarkContribution = Math.round(input.balconyArea * buildingCost.correctedCostPerSqm * 0.30);
    const totalBenchmarkContributionBeforeGroupAllocation = baseBuildingAreaBenchmarkContribution +
        coveredTerracesBenchmarkContribution +
        balconyAreaBenchmarkContribution;
    const basementBaseCosts = (0, basementBaseCosts_1.calculateBasementBaseCosts)({
        correctedBenchmarkRate: buildingCost.correctedCostPerSqm,
        qualityId,
        basementArea: input.basementArea,
        basementTypeId: input.basementTypeId,
        storageBasementArea: input.storageBasementArea,
        parkingBasementArea: input.parkingBasementArea,
        habitableBasementArea: input.habitableBasementArea,
    });
    // -----------------------------------------
    // Category costs (DIN276 groups)
    // -----------------------------------------
    const residentialProgramBaseline = (0, construction_1.getResidentialProgramBaseline)(input.mainArea);
    const bedroomCount = (_e = input.bedroomCount) !== null && _e !== void 0 ? _e : residentialProgramBaseline.bedrooms;
    const bathrooms = (_f = input.bathrooms) !== null && _f !== void 0 ? _f : residentialProgramBaseline.bathrooms;
    const wcs = (_g = input.wcs) !== null && _g !== void 0 ? _g : residentialProgramBaseline.wcs;
    const recommendedKitchens = 1;
    const kitchenCount = (_h = input.kitchenCount) !== null && _h !== void 0 ? _h : recommendedKitchens;
    const bathroomDelta = bathrooms - residentialProgramBaseline.bathrooms;
    const wcDelta = wcs - residentialProgramBaseline.wcs;
    const bedroomDelta = bedroomCount - residentialProgramBaseline.bedrooms;
    const resolvedAccessibilityId = (_k = (_j = input.siteAccessibilityId) !== null && _j !== void 0 ? _j : input.accessibilityId) !== null && _k !== void 0 ? _k : "normal";
    const siteAccessibility = (_l = construction_1.SITE_ACCESSIBILITY_OPTIONS.find((option) => option.id === resolvedAccessibilityId)) !== null && _l !== void 0 ? _l : construction_1.SITE_ACCESSIBILITY_OPTIONS[0];
    const siteAccessibilityFactor = siteAccessibility.siteAccessibilityFactor;
    const basementKg300ModifierResult = (0, basementKg300Modifiers_1.calculateBasementKg300Modifiers)({
        kg300SubgroupCosts: basementBaseCosts.basementKg300SubgroupCosts,
        siteConditionId: input.siteConditionId,
        groundwaterConditionId: input.groundwaterConditionId,
        siteAccessibilityFactor,
    });
    const basementKg300Total = basementKg300ModifierResult.kg300Total;
    const basementKg300ModifierCost = basementKg300Total - basementBaseCosts.basementBucket300;
    const basementBaseCost = basementBaseCosts.basementBucket400 + basementKg300Total;
    // -----------------------------------------
    // Permit costs
    // -----------------------------------------
    const permitCosts = (0, permitCosts_1.calculatePermitCosts)({
        buildingArea,
        qualityId
    });
    const kg600Costs = (0, kg600Costs_1.calculateKg600Costs)({
        buildingArea,
        qualityId,
        bedroomCount,
        kitchenCount,
        customKitchenUnitCost: input.customKitchenUnitCost,
        generalFurniture: input.generalFurniture,
        bathrooms,
        wcs,
    });
    // -----------------------------------------
    // Site costs
    // -----------------------------------------
    const kg200Costs = (0, kg200Costs_1.calculateKg200Costs)({
        buildingArea,
        landscapingArea: input.landscapingArea,
        siteConditionId: input.siteConditionId,
        accessibilityId: resolvedAccessibilityId,
        utilityConnectionId: input.utilityConnectionId,
        customUtilityCost: input.customUtilityCost
    });
    const level1BenchmarkAllocation = (0, categoryCosts_1.calculateLevel1BenchmarkAllocation)({
        benchmarkTotal: totalBenchmarkContributionBeforeGroupAllocation,
        siteExcavationBaseCost: kg200Costs.siteExcavationBaseCost,
        qualityId,
    });
    // -----------------------------------------
    // Category costs (DIN276 groups)
    // -----------------------------------------
    const kg400Costs = (0, kg400Costs_1.calculateKg400Costs)({
        benchmarkBucket400: level1BenchmarkAllocation.benchmarkBucket400,
        mainArea: input.mainArea,
        qualityId,
        bedroomDelta,
        bathroomDelta,
        wcDelta,
        dataSecurityPackageLevel: input.dataSecurityPackageLevel,
        dataSecurityPackageSelection: input.dataSecurityPackageSelection,
        dataSecurityManualQuote: input.dataSecurityManualQuote,
        automationPackageLevel: input.automationPackageLevel,
        automationPackageSelection: input.automationPackageSelection,
        automationManualQuote: input.automationManualQuote,
        habitableBasementArea: input.habitableBasementArea,
        hvacSelections: input.hvacSelections,
    });
    const categoryCosts = (0, categoryCosts_1.calculateCategoryCosts)({
        benchmarkBucket300: level1BenchmarkAllocation.benchmarkBucket300
    });
    const kg300AllocationResult = (0, kg300SubgroupCosts_1.calculateDetailedKg300SubgroupCosts)({
        kg300Cost: categoryCosts.kg300Total,
        qualityId,
    });
    const kg300ModifierResult = (0, kg300Modifiers_1.calculateKg300Modifiers)({
        kg300SubgroupCosts: kg300AllocationResult.kg300SubgroupCosts,
        siteConditionId: input.siteConditionId,
        groundwaterConditionId: input.groundwaterConditionId,
        siteAccessibilityFactor,
    });
    const kg300Total = kg300ModifierResult.kg300Total;
    const kg300SubgroupCosts = kg300ModifierResult.kg300SubgroupCosts;
    const mergedKg300SubgroupCosts = addKg300SubgroupCosts(kg300SubgroupCosts, basementKg300ModifierResult.kg300SubgroupCosts);
    const mergedKg300Total = kg300Total + basementKg300Total;
    const mergedKg400CategoryCostsById = addCostsById(kg400Costs.categoryCostsById, basementBaseCosts.basementKg400CategoryCostsById);
    const mergedKg400Total = Object.values(mergedKg400CategoryCostsById).reduce((sum, cost) => sum + cost, 0);
    // -----------------------------------------
    // Pool
    // -----------------------------------------
    const poolCosts = (0, poolCosts_1.calculatePoolCosts)({
        includePool: input.includePool,
        poolSizeId: input.poolSizeId,
        poolCustomArea: input.poolCustomArea,
        poolDepth: (_m = input.poolCustomDepth) !== null && _m !== void 0 ? _m : input.poolDepth,
        poolQualityId: input.poolQualityId,
        poolTypeId: input.poolTypeId,
        siteConditionId: input.siteConditionId
    });
    // -----------------------------------------
    // Landscaping
    // -----------------------------------------
    const landscapingCosts = (0, landscapingCosts_1.calculateLandscapingCosts)({
        landscapingArea: input.landscapingArea,
        siteConditionId: input.siteConditionId
    });
    const kg500SubgroupResult = (0, kg500Subgroups_1.calculateKg500Subgroups)({
        landscapingCost: landscapingCosts.landscapingCost,
        landscapingArea: input.landscapingArea,
        poolCost: poolCosts.poolCost,
        includePool: input.includePool,
        poolArea: poolCosts.poolArea,
        poolQualityId: input.poolQualityId,
        poolTypeId: input.poolTypeId,
        siteConditionId: input.siteConditionId,
    });
    const kg700SubgroupResult = (0, kg700Subgroups_1.calculateKg700Subgroups)({
        permitFee: permitCosts.permitFee,
    });
    // -----------------------------------------
    // Total project cost
    // -----------------------------------------
    const kg100Costs = (0, kg100Costs_1.calculateKg100Costs)({
        landValue: input.landValue,
        landAcquisitionCosts: input.landAcquisitionCosts,
        landAcquisitionCostsMode: input.landAcquisitionCostsMode,
    });
    const kg500Total = kg500SubgroupResult.kg500Total;
    const kg700Total = kg700SubgroupResult.kg700Total;
    const constructionSubtotal = mergedKg300Total + mergedKg400Total + kg600Costs.kg600Cost;
    const contingencyCosts = (0, contingencyCosts_1.calculateContingencyCosts)({
        constructionSubtotal,
        qualityId,
        manualContingencyPercent: input.manualContingencyPercent,
        manualContingencyCost: input.manualContingencyCost,
    });
    const contractorMarginCosts = (0, contractorMarginCosts_1.calculateContractorMarginCosts)({
        constructionSubtotal,
        contractorPercent: (_o = input.contractorPercent) !== null && _o !== void 0 ? _o : 0,
    });
    const efkaCosts = (0, efkaCosts_1.calculateEfkaCosts)({
        buildingArea,
        manualCost: input.efkaInsuranceManualCost,
    });
    const coreProjectTotal = kg200Costs.kg200Total
        + constructionSubtotal
        + kg500Total
        + kg700Total
        + contingencyCosts.contingencyCost
        + contractorMarginCosts.contractorCost;
    const group100Total = kg100Costs.kg100Total;
    const dinSubtotal = group100Total
        + kg200Costs.kg200Total
        + constructionSubtotal
        + kg500Total
        + kg700Total;
    const nonDinAdditionsSubtotal = contractorMarginCosts.contractorCost
        + contingencyCosts.contingencyCost
        + efkaCosts.appliedCost;
    const preVatTotal = dinSubtotal + nonDinAdditionsSubtotal;
    const vatCosts = (0, vatCosts_1.calculateVatCosts)({
        baseAmount: preVatTotal,
        vatPercent: (_p = input.vatPercent) !== null && _p !== void 0 ? _p : 24,
    });
    const estimatedRangeLow = Math.round(preVatTotal * 0.88);
    const estimatedRangeHigh = Math.round(preVatTotal * 1.12);
    const breakdownGroups = (0, buildProjectCostBreakdown_1.buildProjectCostBreakdown)({
        investmentTotal: preVatTotal,
        landValue: kg100Costs.landValue,
        landAcquisitionCosts: kg100Costs.incidentalLandAcquisitionCosts,
        landAcquisitionCostsMode: kg100Costs.landAcquisitionCostsMode,
        landAcquisitionRatePercent: kg100Costs.landAcquisitionRatePercent,
        kg200Total: kg200Costs.kg200Total,
        siteExcavationCost: kg200Costs.siteExcavationCost,
        utilityGroup220Cost: kg200Costs.group220Cost,
        utilityGroup230Cost: kg200Costs.group230Cost,
        kg300Total: mergedKg300Total,
        kg300SubgroupCosts: mergedKg300SubgroupCosts,
        kg400Total: mergedKg400Total,
        kg400CategoryCostsById: mergedKg400CategoryCostsById,
        kg500Subgroups: kg500SubgroupResult.kg500Subgroups,
        hvacSelections: input.hvacSelections,
        siteConditionId: input.siteConditionId,
        kg600Cost: kg600Costs.kg600Cost,
        kg600SubgroupCosts: kg600Costs.kg600SubgroupCosts,
        bedroomPackageCost: kg600Costs.bedroomPackageCost,
        areaBased610Cost: kg600Costs.areaBased610Cost,
        kitchenFurnitureCost: kg600Costs.kitchenFurnitureCost,
        bathroomWcFurnishingSliceCost: kg600Costs.bathroomWcFurnishingSliceCost,
        kg700Subgroups: kg700SubgroupResult.kg700Subgroups,
    });
    // -----------------------------------------
    // Return result
    // -----------------------------------------
    return {
        totalCost: preVatTotal,
        coreProjectTotal,
        group100Total,
        dinSubtotal,
        nonDinAdditionsSubtotal,
        preVatTotal,
        vat: vatCosts.vatAmount,
        vatAmount: vatCosts.vatAmount,
        finalTotal: vatCosts.totalIncludingVat,
        totalCostInclVat: vatCosts.totalIncludingVat,
        vatPercent: vatCosts.vatPercent,
        estimatedRangeLow,
        estimatedRangeHigh,
        constructionSubtotal,
        buildingArea,
        baseCostPerSqm: buildingCost.baseCostPerSqm,
        locationAdjustedBaseCostPerSqm: buildingCost.costPerSqm,
        sizeCorrectionFactor: buildingCost.sizeCorrectionFactor,
        sizeAdjustedCostPerSqm: buildingCost.sizeAdjustedCostPerSqm,
        correctedCostPerSqm: buildingCost.correctedCostPerSqm,
        benchmarkPreviewPerQuality,
        residentialProgramBaseline,
        recommendedBedrooms: residentialProgramBaseline.bedrooms,
        recommendedBathrooms: residentialProgramBaseline.bathrooms,
        recommendedWcs: residentialProgramBaseline.wcs,
        recommendedKitchens,
        bedroomCount,
        bathrooms,
        wcs,
        kitchenCount,
        bedroomDelta,
        bathroomDelta,
        wcDelta,
        contractorMargin: contractorMarginCosts.contractorCost,
        contractorCost: contractorMarginCosts.contractorCost,
        contingency: contingencyCosts.contingencyCost,
        contingencyCost: contingencyCosts.contingencyCost,
        contingencyRecommendedPercent: contingencyCosts.recommendedPercent,
        appliedContingencyPercent: contingencyCosts.appliedPercentValue,
        recommendedContingencyCost: contingencyCosts.recommendedCost,
        contingencyManualOverrideActive: contingencyCosts.manualOverrideActive,
        efka: efkaCosts.appliedCost,
        efkaCost: efkaCosts.appliedCost,
        efkaInsuranceAmount: efkaCosts.appliedCost,
        efkaInsuranceAutoCost: efkaCosts.automaticCost,
        efkaInsuranceManualOverrideActive: efkaCosts.manualOverrideActive,
        kg100Total: kg100Costs.kg100Total,
        kg200Total: kg200Costs.kg200Total,
        kg300Total: mergedKg300Total,
        kg400Total: mergedKg400Total,
        kg500Total,
        kg700Total,
        kg600Cost: kg600Costs.kg600Cost,
        baseBuildingAreaBenchmarkContribution,
        coveredTerracesBenchmarkContribution,
        balconyAreaBenchmarkContribution,
        totalBenchmarkContributionBeforeGroupAllocation,
        rawBuildingCost: buildingCost.rawBuildingCost,
        basementBenchmarkRate: basementBaseCosts.basementBenchmarkRate,
        basementBaseCost,
        basementBucket300: basementBaseCosts.basementBucket300,
        basementBucket400: basementBaseCosts.basementBucket400,
        basementKg300Total,
        basementKg300ModifierCost,
        basementKg300CategoryCostsById: basementBaseCosts.basementKg300CategoryCostsById,
        basementKg400CategoryCostsById: basementBaseCosts.basementKg400CategoryCostsById,
        basementKg300BaseSubgroupCosts: basementBaseCosts.basementKg300SubgroupCosts,
        basementKg300SubgroupCosts: basementKg300ModifierResult.kg300SubgroupCosts,
        basementKg300ModifierDetails: basementKg300ModifierResult.modifierDetails,
        storageTechnicalBasementCost: basementBaseCosts.storageTechnicalBasementCost,
        parkingBasementCost: basementBaseCosts.parkingBasementCost,
        habitableBasementCost: basementBaseCosts.habitableBasementCost,
        basementCostItems: basementBaseCosts.breakdownItems,
        kg300SubgroupCosts: mergedKg300SubgroupCosts,
        kg300ModifierDetails: kg300ModifierResult.modifierDetails,
        kg600SubgroupCosts: kg600Costs.kg600SubgroupCosts,
        kg500Subgroups: kg500SubgroupResult.kg500Subgroups,
        kg700Subgroups: kg700SubgroupResult.kg700Subgroups,
        suggestedKitchenUnitCost: kg600Costs.suggestedKitchenUnitCost,
        suggestedGeneralFurniture: kg600Costs.suggestedGeneralFurniture,
        bedroomPackageCost: kg600Costs.bedroomPackageCost,
        areaBased610Cost: kg600Costs.areaBased610Cost,
        kitchenFurnitureCost: kg600Costs.kitchenFurnitureCost,
        kg610AutoTotal: kg600Costs.kg610AutoTotal,
        kg610Total: kg600Costs.kg610Total,
        kitchenUnitCost: kg600Costs.kitchenUnitCost,
        kitchenPackageCost: kg600Costs.kitchenPackageCost,
        wardrobePackageCost: kg600Costs.wardrobePackageCost,
        bathroomWcFurnishingSliceCost: kg600Costs.bathroomWcFurnishingSliceCost,
        includedWardrobes: kg600Costs.includedWardrobes,
        totalWardrobeCount: kg600Costs.totalWardrobeCount,
        kg100SubgroupCosts: kg100Costs.subgroupCosts,
        permitFee: kg700Total,
        landscapingCost: landscapingCosts.landscapingCost,
        poolCost: poolCosts.poolCost,
        poolArea: poolCosts.poolArea,
        hvacOptionCosts: kg400Costs.hvacOptionCosts,
        hvacExtrasCost: kg400Costs.hvacExtrasCost,
        packageCosts: kg400Costs.packageCosts,
        siteCost: kg200Costs.kg200Total,
        utilityConnectionCost: kg200Costs.utilityConnectionCost,
        utilityGroup220Cost: kg200Costs.group220Cost,
        utilityGroup230Cost: kg200Costs.group230Cost,
        siteExcavationCost: kg200Costs.siteExcavationCost,
        landAcquisitionAmount: kg100Costs.incidentalLandAcquisitionCosts,
        landAcquisitionRatePercent: kg100Costs.landAcquisitionRatePercent,
        breakdownGroups,
    };
}
