import {
  LANDSCAPING_BASE_COST_PER_SQM,
  SITE_CONDITIONS,
  getLandscapingSizeAdjustment
} from "@/constants/construction"

interface LandscapingCostsInput {
  landscapingArea: number
  siteConditionId: string
}

export function calculateLandscapingCosts(input: LandscapingCostsInput) {

  if (!input.landscapingArea || input.landscapingArea <= 0) {
    return {
      landscapingCost: 0
    }
  }

  const siteCondition =
    SITE_CONDITIONS.find(s => s.id === input.siteConditionId)
    ?? SITE_CONDITIONS[0]

  const baseCost =
    input.landscapingArea * LANDSCAPING_BASE_COST_PER_SQM

  const sizeAdjustment =
    getLandscapingSizeAdjustment(input.landscapingArea)

  const terrainMultiplier =
    siteCondition.terrainMultiplier

  const landscapingCost =
    baseCost *
    (1 + sizeAdjustment) *
    terrainMultiplier

  return {
    landscapingCost
  }
}