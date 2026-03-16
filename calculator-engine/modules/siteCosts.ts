import {
  SITE_CONDITIONS,
  GROUNDWATER_CONDITIONS,
  SITE_ACCESSIBILITY_OPTIONS,
  UTILITY_CONNECTION_OPTIONS,
  BASE_EXCAVATION_COST_PER_SQM,
  getBasementExcavationCost,
  getUtilityConnectionGroupCosts
} from "../../constants/construction"

interface SiteCostsInput {
  kg200Base: number
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
  const baselineSiteCondition =
    siteConditions.find((s: any) => s.id === "flat_normal")
    ?? siteConditions[0]

  let siteExcavationCost =
    input.mainArea * 15 * BASE_EXCAVATION_COST_PER_SQM

  siteExcavationCost =
    siteExcavationCost * siteCondition.terrainMultiplier

  const baselineSiteExcavationCost =
    input.mainArea * 15 * BASE_EXCAVATION_COST_PER_SQM * baselineSiteCondition.terrainMultiplier

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

  const utilityGroupCosts =
    getUtilityConnectionGroupCosts(input.utilityConnectionId, utilityConnectionCost)

  // logistics / access
  const accessibilityCost =
    accessibility.fixedCost

  const kg200Adjustments =
      (siteExcavationCost - baselineSiteExcavationCost)
    + basementExcavationCost
    + utilityConnectionCost
    + accessibilityCost

  const kg200Total =
    input.kg200Base +
    kg200Adjustments

  return {
    siteExcavationCost: Math.round(input.kg200Base + (siteExcavationCost - baselineSiteExcavationCost)),
    basementExcavationCost: Math.round(basementExcavationCost),
    utilityConnectionCost: Math.round(utilityConnectionCost),
    group220Cost: utilityGroupCosts.group220Cost,
    group230Cost: utilityGroupCosts.group230Cost,
    accessibilityCost,
    kg200Total: Math.round(kg200Total)
  }

}
