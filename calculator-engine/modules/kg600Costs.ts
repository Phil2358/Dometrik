import {
  DEFAULT_QUALITY_ID,
  KG600_EXTRA_BATHROOM_FURNISHING_SLICE_BASE_COST,
  KG600_EXTRA_WC_FURNISHING_SLICE_BASE_COST,
  KG600_GENERAL_FURNITURE_PER_BEDROOM_INCREMENT,
  KG600_KITCHEN_PACKAGE_BASE_COST,
  KG600_WARDROBE_PACKAGE_BASE_COST,
  QUALITY_LEVELS,
  type QualityId,
  getKitchenAreaFactor,
  getSuggestedGeneralFurniture,
} from "../../constants/construction"

interface Kg600CostsInput {
  buildingArea: number
  qualityId: QualityId
  bedroomCount: number
  kitchenCount?: number
  customKitchenUnitCost?: number | null
  generalFurniture?: number | null
  bathroomDelta?: number
  wcDelta?: number
}

export function calculateKg600Costs(input: Kg600CostsInput) {
  const quality =
    QUALITY_LEVELS.find((entry: any) => entry.id === input.qualityId) ??
    QUALITY_LEVELS.find((entry: any) => entry.id === DEFAULT_QUALITY_ID) ??
    QUALITY_LEVELS[0]
  const qualityPackageMultiplier = quality.benchmarkFactor
  const totalWardrobeCount = Math.max(0, input.bedroomCount)
  const includedWardrobes = totalWardrobeCount
  const kitchenAreaFactor = getKitchenAreaFactor(input.buildingArea)
  const suggestedKitchenUnitCost = Math.round(
    KG600_KITCHEN_PACKAGE_BASE_COST * kitchenAreaFactor * qualityPackageMultiplier
  )
  const suggestedGeneralFurniture = getSuggestedGeneralFurniture(
    input.buildingArea,
    totalWardrobeCount
  )
  const kitchenUnitCost = input.customKitchenUnitCost ?? suggestedKitchenUnitCost
  const wardrobeUnitCost = Math.round(
    KG600_WARDROBE_PACKAGE_BASE_COST * qualityPackageMultiplier
  )
  const generalFurnitureBedroomIncrement =
    Math.max(0, totalWardrobeCount - 1) * KG600_GENERAL_FURNITURE_PER_BEDROOM_INCREMENT
  const generalFurnitureCost =
    input.generalFurniture ?? suggestedGeneralFurniture
  const extraBathroomFurnishingSliceCost =
    Math.max(0, input.bathroomDelta ?? 0) *
    Math.round(KG600_EXTRA_BATHROOM_FURNISHING_SLICE_BASE_COST * qualityPackageMultiplier)
  const extraWcFurnishingSliceCost =
    Math.max(0, input.wcDelta ?? 0) *
    Math.round(KG600_EXTRA_WC_FURNISHING_SLICE_BASE_COST * qualityPackageMultiplier)
  const kitchenPackageCost = (input.kitchenCount ?? 0) * kitchenUnitCost
  const wardrobePackageCost = totalWardrobeCount * wardrobeUnitCost
  const bathroomWcFurnishingSliceCost =
    extraBathroomFurnishingSliceCost + extraWcFurnishingSliceCost
  const kg600SpecialFurnishingsCost =
    kitchenPackageCost + wardrobePackageCost + bathroomWcFurnishingSliceCost
  const kg600GeneralFurnishingsCost = generalFurnitureCost
  const kg600Cost = kg600GeneralFurnishingsCost + kg600SpecialFurnishingsCost

  return {
    qualityPackageMultiplier,
    includedWardrobes,
    totalWardrobeCount,
    kitchenAreaFactor,
    suggestedKitchenUnitCost,
    suggestedGeneralFurniture,
    kitchenUnitCost,
    wardrobeUnitCost,
    generalFurnitureBedroomIncrement,
    generalFurnitureCost,
    extraBathroomFurnishingSliceCost,
    extraWcFurnishingSliceCost,
    kitchenPackageCost,
    wardrobePackageCost,
    bathroomWcFurnishingSliceCost,
    kg600SpecialFurnishingsCost,
    kg600GeneralFurnishingsCost,
    kg600SubgroupCosts: {
      subgroup610Cost: kg600GeneralFurnishingsCost,
      subgroup620Cost: kg600SpecialFurnishingsCost,
    },
    kg600Cost,
  }
}
