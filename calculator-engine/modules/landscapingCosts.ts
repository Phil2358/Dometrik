import {
  LANDSCAPING_BASE_COST_PER_SQM,
  SITE_CONDITIONS,
} from "../../constants/construction"

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

  const siteConditions: any[] = [...SITE_CONDITIONS]

  const siteCondition =
    siteConditions.find(s => s.id === input.siteConditionId) || siteConditions[0]

  const baseCost =
    input.landscapingArea * LANDSCAPING_BASE_COST_PER_SQM

  const terrainMultiplier =
    siteCondition.terrainMultiplier

  const landscapingCost =
    baseCost * terrainMultiplier

  return {
    landscapingCost: Math.round(landscapingCost)
  }

}
