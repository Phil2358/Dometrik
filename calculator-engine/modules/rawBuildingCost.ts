import {
  DEFAULT_QUALITY_ID,
  QUALITY_LEVELS,
  LOCATIONS,
  BASE_GROUP_SHARE_KG300,
  BASE_GROUP_SHARE_KG400,
  type QualityId,
  getSizeCorrectionFactor
} from "../../constants/construction"

interface RawBuildingCostInput {
  buildingArea: number
  locationId: string
  qualityId: QualityId
  customCostPerSqm?: number | null
}

export function calculateRawBuildingCost(input: RawBuildingCostInput) {

  const locations = [...LOCATIONS]
  const qualities = [...QUALITY_LEVELS]

  const location =
    locations.find((l: any) => l.id === input.locationId) ??
    locations[0]

  const quality =
    qualities.find((q: any) => q.id === input.qualityId) ??
    qualities.find((q: any) => q.id === DEFAULT_QUALITY_ID) ??
    qualities[0]

  const baseCostPerSqm =
    input.customCostPerSqm ?? quality.baseCostPerSqm

  const sizeCorrectionFactor =
    getSizeCorrectionFactor(input.buildingArea)

  const sizeAdjustedCostPerSqm =
    Math.round(baseCostPerSqm * sizeCorrectionFactor)

  const costPerSqm =
    Math.round(baseCostPerSqm * location.multiplier)

  const correctedCostPerSqm =
    Math.round(sizeAdjustedCostPerSqm * location.multiplier)

  const rawBuildingCost =
    Math.round(input.buildingArea * correctedCostPerSqm)

  const kg300Base =
    Math.round(rawBuildingCost * BASE_GROUP_SHARE_KG300)

  const kg400Base =
    Math.round(rawBuildingCost * BASE_GROUP_SHARE_KG400)

  return {
    baseCostPerSqm,
    costPerSqm,
    sizeCorrectionFactor,
    sizeAdjustedCostPerSqm,
    correctedCostPerSqm,
    rawBuildingCost: kg300Base + kg400Base,
    baseConstructionCost: rawBuildingCost,
    kg300Base,
    kg400Base
  }

}
