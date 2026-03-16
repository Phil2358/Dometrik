import {
  SITE_CONDITIONS,
  GROUNDWATER_CONDITIONS,
  SITE_ACCESSIBILITY_OPTIONS,
  UTILITY_CONNECTION_OPTIONS,
  BASE_EXCAVATION_COST_PER_SQM,
  clampSitePreparationMultiplier,
  getBasementExcavationCost,
  getPlotSizeFactor,
  getUtilityConnectionGroupCosts
} from "../../constants/construction"

interface SiteCostsInput {
  kg200Base: number
  plotSize: number
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

  const utility =
    utilityOptions.find((u: any) => u.id === input.utilityConnectionId)
    ?? utilityOptions[0]

  const accessibility =
    accessibilityOptions.find((a: any) => a.id === input.accessibilityId)
    ?? accessibilityOptions[0]

  const sitePreparationMultiplier =
    clampSitePreparationMultiplier(
      getPlotSizeFactor(input.plotSize) *
      siteCondition.sitePreparationFactor *
      accessibility.sitePreparationFactor
    )

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
  const group240Cost = 0
  const accessibilityCost = 0
  const group250Cost = accessibilityCost

  const kg200Adjustments =
      basementExcavationCost
    + utilityConnectionCost
    + group240Cost
    + group250Cost

  const kg200Total =
    input.kg200Base +
    kg200Adjustments

  return {
    siteExcavationCost: Math.round(input.kg200Base * sitePreparationMultiplier),
    basementExcavationCost: Math.round(basementExcavationCost),
    utilityConnectionCost: Math.round(utilityConnectionCost),
    group220Cost: utilityGroupCosts.group220Cost,
    group230Cost: utilityGroupCosts.group230Cost,
    group240Cost,
    accessibilityCost,
    group250Cost,
    kg200Total: Math.round(kg200Total)
  }

}
