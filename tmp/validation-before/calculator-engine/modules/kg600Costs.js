"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateKg600Costs = calculateKg600Costs;
const construction_1 = require("../../constants/construction");
function calculateKg600Costs(input) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const quality = (_b = (_a = construction_1.QUALITY_LEVELS.find((entry) => entry.id === input.qualityId)) !== null && _a !== void 0 ? _a : construction_1.QUALITY_LEVELS.find((entry) => entry.id === construction_1.DEFAULT_QUALITY_ID)) !== null && _b !== void 0 ? _b : construction_1.QUALITY_LEVELS[0];
    const qualityPackageMultiplier = quality.benchmarkFactor;
    const totalWardrobeCount = Math.max(0, input.bedroomCount);
    const includedWardrobes = totalWardrobeCount;
    const resolvedKitchenCount = Math.max(0, (_c = input.kitchenCount) !== null && _c !== void 0 ? _c : 0);
    const kitchenAreaFactor = (0, construction_1.getKitchenAreaFactor)(input.buildingArea);
    const suggestedKitchenUnitCost = Math.round(construction_1.KG600_KITCHEN_PACKAGE_BASE_COST * kitchenAreaFactor * qualityPackageMultiplier);
    const suggestedGeneralFurniture = (0, construction_1.getSuggestedGeneralFurniture)(input.buildingArea, input.qualityId, totalWardrobeCount, resolvedKitchenCount);
    const kitchenUnitCost = (_d = input.customKitchenUnitCost) !== null && _d !== void 0 ? _d : suggestedKitchenUnitCost;
    const wardrobeUnitCost = Math.round(construction_1.KG600_WARDROBE_PACKAGE_BASE_COST * qualityPackageMultiplier);
    const bedroomPackageCost = totalWardrobeCount * ((_e = construction_1.BEDROOM_PACKAGE_RATES[input.qualityId]) !== null && _e !== void 0 ? _e : construction_1.BEDROOM_PACKAGE_RATES[construction_1.DEFAULT_QUALITY_ID]);
    const areaBased610Cost = Math.max(0, input.buildingArea) * ((_f = construction_1.AREA_610_RATES[input.qualityId]) !== null && _f !== void 0 ? _f : construction_1.AREA_610_RATES[construction_1.DEFAULT_QUALITY_ID]);
    const kitchenFurnitureCost = resolvedKitchenCount * ((_g = construction_1.KITCHEN_FURNITURE_PACKAGE_RATES[input.qualityId]) !== null && _g !== void 0 ? _g : construction_1.KITCHEN_FURNITURE_PACKAGE_RATES[construction_1.DEFAULT_QUALITY_ID]);
    const kg610AutoTotal = Math.round(bedroomPackageCost + areaBased610Cost + kitchenFurnitureCost);
    const kg610Total = input.generalFurniture !== null && input.generalFurniture !== undefined
        ? Math.max(0, Math.round(input.generalFurniture))
        : kg610AutoTotal;
    const generalFurnitureCost = kg610Total;
    const extraBathroomFurnishingSliceCost = Math.max(0, (_h = input.bathrooms) !== null && _h !== void 0 ? _h : 0) *
        Math.round(construction_1.KG600_EXTRA_BATHROOM_FURNISHING_SLICE_BASE_COST * qualityPackageMultiplier);
    const extraWcFurnishingSliceCost = Math.max(0, (_j = input.wcs) !== null && _j !== void 0 ? _j : 0) *
        Math.round(construction_1.KG600_EXTRA_WC_FURNISHING_SLICE_BASE_COST * qualityPackageMultiplier);
    const kitchenPackageCost = resolvedKitchenCount * kitchenUnitCost;
    const wardrobePackageCost = totalWardrobeCount * wardrobeUnitCost;
    const bathroomWcFurnishingSliceCost = extraBathroomFurnishingSliceCost + extraWcFurnishingSliceCost;
    const kg600SpecialFurnishingsCost = kitchenPackageCost + wardrobePackageCost + bathroomWcFurnishingSliceCost;
    const kg600GeneralFurnishingsCost = generalFurnitureCost;
    const kg600Cost = kg600GeneralFurnishingsCost + kg600SpecialFurnishingsCost;
    return {
        qualityPackageMultiplier,
        includedWardrobes,
        totalWardrobeCount,
        kitchenAreaFactor,
        suggestedKitchenUnitCost,
        suggestedGeneralFurniture,
        kitchenUnitCost,
        wardrobeUnitCost,
        bedroomPackageCost,
        areaBased610Cost,
        kitchenFurnitureCost,
        kg610AutoTotal,
        kg610Total,
        generalFurnitureCost,
        extraBathroomFurnishingSliceCost,
        extraWcFurnishingSliceCost,
        kitchenPackageCost,
        wardrobePackageCost,
        bathroomWcFurnishingSliceCost,
        kg600SpecialFurnishingsCost,
        kg600GeneralFurnishingsCost,
        kg600SubgroupCosts: {
            subgroup610Cost: kg610Total,
            subgroup620Cost: kg600SpecialFurnishingsCost,
        },
        kg600Cost,
    };
}
