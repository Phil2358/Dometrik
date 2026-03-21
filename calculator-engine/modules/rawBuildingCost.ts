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
  correctedBenchmarkOverridePerSqm?: number | null
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

  const defaultBaseCostPerSqm = quality.baseCostPerSqm

  const sizeCorrectionFactor =
    getSizeCorrectionFactor(input.buildingArea)

  const defaultSizeAdjustedCostPerSqm =
    Math.round(defaultBaseCostPerSqm * sizeCorrectionFactor)

  const defaultLocationAdjustedBaseCostPerSqm =
    Math.round(defaultBaseCostPerSqm * location.multiplier)

  const defaultCorrectedCostPerSqm =
    Math.round(defaultSizeAdjustedCostPerSqm * location.multiplier)
  const correctedBenchmarkOverridePerSqm =
    input.correctedBenchmarkOverridePerSqm === null || input.correctedBenchmarkOverridePerSqm === undefined
      ? null
      : Math.max(0, Math.round(input.correctedBenchmarkOverridePerSqm))

  const baseCostPerSqm =
    correctedBenchmarkOverridePerSqm ?? defaultBaseCostPerSqm

  const sizeAdjustedCostPerSqm =
    correctedBenchmarkOverridePerSqm ?? defaultSizeAdjustedCostPerSqm

  const costPerSqm =
    correctedBenchmarkOverridePerSqm ?? defaultLocationAdjustedBaseCostPerSqm

  const correctedCostPerSqm =
    correctedBenchmarkOverridePerSqm ?? defaultCorrectedCostPerSqm

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
