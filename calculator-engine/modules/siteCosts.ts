import {
  SITE_CONDITIONS,
  GROUNDWATER_CONDITIONS,
  SITE_ACCESSIBILITY_OPTIONS,
  UTILITY_CONNECTION_OPTIONS,
  BASE_EXCAVATION_COST_PER_SQM,
  getBasementExcavationCost
} from "@/constants/construction"

interface SiteCostsInput {
  mainArea: number
  basementArea: number

  siteConditionId: string
  groundwaterConditionId: string
  accessibilityId: string

  utilityConnectionId: string
  customUtilityCost?: number | null
}

export function calculateSiteCosts(input: SiteCostsInput) {

  const siteCondition =
    SITE_CONDITIONS.find(s => s.id === input.siteConditionId)
    ?? SITE_CONDITIONS[0]

  const groundwater =
    GROUNDWATER_CONDITIONS.find(g => g.id === input.groundwaterConditionId)
    ?? GROUNDWATER_CONDITIONS[0]

  const accessibility =
    SITE_ACCESSIBILITY_OPTIONS.find(a => a.id === input.accessibilityId)
    ?? SITE_ACCESSIBILITY_OPTIONS[0]

  const utility =
    UTILITY_CONNECTION_OPTIONS.find(u => u.id === input.utilityConnectionId)
    ?? UTILITY_CONNECTION_OPTIONS[0]

  // main building excavation
  let siteExcavationCost =
    input.mainArea * 15 * BASE_EXCAVATION_COST_PER_SQM

  siteExcavationCost *= siteCondition.terrainMultiplier

  // basement excavation
  const basementExcavationCost =
    getBasementExcavationCost(
      input.basementArea,
      siteCondition,
      groundwater
    )

  // utilities
  const utilityConnectionCost =
    utility.id === "custom"
      ? (input.customUtilityCost ?? 0)
      : utility.cost

  // logistics
  const accessibilityCost =
    accessibility.fixedCost

  const kg200Total =
    siteExcavationCost +
    basementExcavationCost +
    utilityConnectionCost +
    accessibilityCost

  return {
    siteExcavationCost,
    basementExcavationCost,
    utilityConnectionCost,
    accessibilityCost,
    kg200Total
  }
}