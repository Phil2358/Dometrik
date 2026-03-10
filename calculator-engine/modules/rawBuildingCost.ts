import {
  QUALITY_LEVELS,
  LOCATIONS,
  getSizeCorrectionFactor
} from "../../constants/construction"

interface RawBuildingCostInput {
  livingArea: number
  effectiveArea: number
  locationId: string
  qualityId: string
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
    qualities[0]

  const baseCostPerSqm =
    input.customCostPerSqm ?? quality.baseCostPerSqm

  const costPerSqm =
    Math.round(baseCostPerSqm * location.multiplier)

  const sizeCorrectionFactor =
    getSizeCorrectionFactor(input.livingArea)

  const correctedCostPerSqm =
    Math.round(costPerSqm * sizeCorrectionFactor)

  const rawBuildingCost =
    Math.round(input.effectiveArea * correctedCostPerSqm)

  return {
    baseCostPerSqm,
    costPerSqm,
    sizeCorrectionFactor,
    correctedCostPerSqm,
    rawBuildingCost
  }

}