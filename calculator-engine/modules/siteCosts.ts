import {
  SITE_CONDITIONS,
  GROUNDWATER_CONDITIONS,
  SITE_ACCESSIBILITY_OPTIONS,
  UTILITY_CONNECTION_OPTIONS,
  BASE_EXCAVATION_COST_PER_SQM,
  getBasementExcavationCost
} from "../../constants/construction"

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

  const siteConditions = [...SITE_CONDITIONS]
  const groundwaterConditions = [...GROUNDWATER_CONDITIONS]
  const accessibilityOptions = [...SITE_ACCESSIBILITY_OPTIONS]
  const utilityOptions = [...UTILITY_CONNECTION_OPTIONS]

  const siteCondition =
    siteConditions.find((s: any) => s.id === input.siteConditionId)
    ?? siteConditions[0]

  const groundwater =
    groundwaterConditions.find((g: any) => g.id === input.groundwaterConditionId)
    ?? groundwaterConditions[0]

  const accessibility =
    accessibilityOptions.find((a: any) => a.id === input.accessibilityId)
    ?? accessibilityOptions[0]

  const utility =
    utilityOptions.find((u: any) => u.id === input.utilityConnectionId)
    ?? utilityOptions[0]

  // main building excavation
  let siteExcavationCost =
    input.mainArea * 15 * BASE_EXCAVATION_COST_PER_SQM

  siteExcavationCost =
    siteExcavationCost * siteCondition.terrainMultiplier

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

  // logistics / access
  const accessibilityCost =
    accessibility.fixedCost

  const kg200Total =
    siteExcavationCost +
    basementExcavationCost +
    utilityConnectionCost +
    accessibilityCost

  return {
    siteExcavationCost: Math.round(siteExcavationCost),
    basementExcavationCost: Math.round(basementExcavationCost),
    utilityConnectionCost,
    accessibilityCost,
    kg200Total: Math.round(kg200Total)
  }

}