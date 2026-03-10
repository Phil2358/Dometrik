import {
  QUALITY_LEVELS,
  LOCATIONS,
  getSizeCorrectionFactor
} from "@/constants/construction"

interface RawBuildingCostInput {
  livingArea: number
  effectiveArea: number
  locationId: string
  qualityId: string
  customCostPerSqm?: number | null
}

export function calculateRawBuildingCost(input: RawBuildingCostInput) {

  const location =
    LOCATIONS.find(l => l.id === input.locationId)
    ?? LOCATIONS[0]

  const quality =
    QUALITY_LEVELS.find(q => q.id === input.qualityId)
    ?? QUALITY_LEVELS[0]

  const baseCostPerSqm =
    input.customCostPerSqm ?? quality.baseCostPerSqm

  const costPerSqm =
    Math.round(baseCostPerSqm * location.multiplier)

  const sizeCorrectionFactor =
    getSizeCorrectionFactor(input.livingArea)

  const correctedCostPerSqm =
    Math.round(costPerSqm * sizeCorrectionFactor)

  const rawBuildingCost =
    input.effectiveArea * correctedCostPerSqm

  return {
    baseCostPerSqm,
    costPerSqm,
    sizeCorrectionFactor,
    correctedCostPerSqm,
    rawBuildingCost
  }
}