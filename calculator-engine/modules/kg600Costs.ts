import {
  AREA_610_RATES,
  BEDROOM_PACKAGE_RATES,
  DEFAULT_QUALITY_ID,
  KG600_EXTRA_BATHROOM_FURNISHING_SLICE_BASE_COST,
  KG600_EXTRA_WC_FURNISHING_SLICE_BASE_COST,
  KG600_KITCHEN_PACKAGE_BASE_COST,
  KG600_WARDROBE_PACKAGE_BASE_COST,
  KITCHEN_FURNITURE_PACKAGE_RATES,
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
  bathrooms?: number
  wcs?: number
}

export function calculateKg600Costs(input: Kg600CostsInput) {
  const quality =
    QUALITY_LEVELS.find((entry: any) => entry.id === input.qualityId) ??
    QUALITY_LEVELS.find((entry: any) => entry.id === DEFAULT_QUALITY_ID) ??
    QUALITY_LEVELS[0]
  const qualityPackageMultiplier = quality.benchmarkFactor
  const totalWardrobeCount = Math.max(0, input.bedroomCount)
  const includedWardrobes = totalWardrobeCount
  const resolvedKitchenCount = Math.max(0, input.kitchenCount ?? 0)
  const kitchenAreaFactor = getKitchenAreaFactor(input.buildingArea)
  const suggestedKitchenUnitCost = Math.round(
    KG600_KITCHEN_PACKAGE_BASE_COST * kitchenAreaFactor * qualityPackageMultiplier
  )
  const suggestedGeneralFurniture = getSuggestedGeneralFurniture(
    input.buildingArea,
    input.qualityId,
    totalWardrobeCount,
    resolvedKitchenCount,
  )
  const kitchenUnitCost = input.customKitchenUnitCost ?? suggestedKitchenUnitCost
  const wardrobeUnitCost = Math.round(
    KG600_WARDROBE_PACKAGE_BASE_COST * qualityPackageMultiplier
  )
  const bedroomPackageCost =
    totalWardrobeCount * (BEDROOM_PACKAGE_RATES[input.qualityId] ?? BEDROOM_PACKAGE_RATES[DEFAULT_QUALITY_ID])
  const areaBased610Cost =
    Math.max(0, input.buildingArea) * (AREA_610_RATES[input.qualityId] ?? AREA_610_RATES[DEFAULT_QUALITY_ID])
  const kitchenFurnitureCost =
    resolvedKitchenCount * (
      KITCHEN_FURNITURE_PACKAGE_RATES[input.qualityId]
      ?? KITCHEN_FURNITURE_PACKAGE_RATES[DEFAULT_QUALITY_ID]
    )
  const kg610AutoTotal = Math.round(
    bedroomPackageCost + areaBased610Cost + kitchenFurnitureCost
  )
  const kg610Total =
    input.generalFurniture !== null && input.generalFurniture !== undefined
      ? Math.max(0, Math.round(input.generalFurniture))
      : kg610AutoTotal
  const generalFurnitureCost = kg610Total
  const extraBathroomFurnishingSliceCost =
    Math.max(0, input.bathrooms ?? 0) *
    Math.round(KG600_EXTRA_BATHROOM_FURNISHING_SLICE_BASE_COST * qualityPackageMultiplier)
  const extraWcFurnishingSliceCost =
    Math.max(0, input.wcs ?? 0) *
    Math.round(KG600_EXTRA_WC_FURNISHING_SLICE_BASE_COST * qualityPackageMultiplier)
  const kitchenPackageCost = resolvedKitchenCount * kitchenUnitCost
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
  }
}
