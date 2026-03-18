import {
  KG600_EXTRA_BATHROOM_FURNISHING_SLICE_BASE_COST,
  KG600_EXTRA_WC_FURNISHING_SLICE_BASE_COST,
  KG600_GENERAL_FURNITURE_PER_BEDROOM_INCREMENT,
  KG600_KITCHEN_PACKAGE_BASE_COST,
  KG600_WARDROBE_PACKAGE_BASE_COST,
  QUALITY_LEVELS,
  getKitchenAreaFactor,
  getSuggestedGeneralFurnitureBaseAmount,
} from "../../constants/construction"

interface Kg600CostsInput {
  effectiveArea: number
  qualityId: string
  bedroomCount: number
  kitchenCount?: number
  customKitchenUnitCost?: number | null
  generalFurnitureBaseAmount?: number | null
  bathroomDelta?: number
  wcDelta?: number
}

export function calculateKg600Costs(input: Kg600CostsInput) {
  const quality =
    QUALITY_LEVELS.find((entry: any) => entry.id === input.qualityId) ??
    QUALITY_LEVELS[0]
  const qualityPackageMultiplier = quality.benchmarkFactor
  const totalWardrobeCount = Math.max(0, input.bedroomCount)
  const includedWardrobes = totalWardrobeCount
  const kitchenAreaFactor = getKitchenAreaFactor(input.effectiveArea)
  const suggestedKitchenUnitCost = Math.round(
    KG600_KITCHEN_PACKAGE_BASE_COST * kitchenAreaFactor * qualityPackageMultiplier
  )
  const suggestedGeneralFurnitureBaseAmount = getSuggestedGeneralFurnitureBaseAmount(
    input.effectiveArea,
    totalWardrobeCount
  )
  const kitchenUnitCost = input.customKitchenUnitCost ?? suggestedKitchenUnitCost
  const wardrobeUnitCost = Math.round(
    KG600_WARDROBE_PACKAGE_BASE_COST * qualityPackageMultiplier
  )
  const generalFurnitureBedroomIncrement =
    Math.max(0, totalWardrobeCount - 1) * KG600_GENERAL_FURNITURE_PER_BEDROOM_INCREMENT
  const generalFurniturePackageCost =
    input.generalFurnitureBaseAmount ?? suggestedGeneralFurnitureBaseAmount
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
  const kg600GeneralFurnishingsCost = generalFurniturePackageCost
  const kg600Cost = kg600GeneralFurnishingsCost + kg600SpecialFurnishingsCost

  return {
    qualityPackageMultiplier,
    includedWardrobes,
    totalWardrobeCount,
    kitchenAreaFactor,
    suggestedKitchenUnitCost,
    suggestedGeneralFurnitureBaseAmount,
    kitchenUnitCost,
    wardrobeUnitCost,
    generalFurnitureBedroomIncrement,
    generalFurniturePackageCost,
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
