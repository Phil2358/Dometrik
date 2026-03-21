import {
  LANDSCAPING_BASE_COST_PER_SQM_BY_QUALITY,
  SITE_CONDITIONS,
  type QualityId,
} from "../../constants/construction"

interface LandscapingCostsInput {
  landscapingArea: number
  siteConditionId: string
  qualityId: QualityId
}

export function calculateLandscapingCosts(input: LandscapingCostsInput) {
  const siteConditions = [...SITE_CONDITIONS]
  const siteCondition =
    siteConditions.find(s => s.id === input.siteConditionId) || siteConditions[0]
  const baseRatePerSqm =
    LANDSCAPING_BASE_COST_PER_SQM_BY_QUALITY[input.qualityId]

  if (!input.landscapingArea || input.landscapingArea <= 0) {
    return {
      baseRatePerSqm,
      baseCost: 0,
      siteConditionMultiplier: siteCondition.terrainMultiplier,
      siteConditionAdjustment: 0,
      landscapingCost: 0,
    }
  }

  const baseCost =
    input.landscapingArea * baseRatePerSqm

  const siteConditionMultiplier =
    siteCondition.terrainMultiplier

  const landscapingCost =
    Math.round(baseCost * siteConditionMultiplier)

  return {
    baseRatePerSqm,
    baseCost,
    siteConditionMultiplier,
    siteConditionAdjustment: landscapingCost - baseCost,
    landscapingCost,
  }

}
