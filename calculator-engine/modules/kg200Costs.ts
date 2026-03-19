import {
  SITE_CONDITIONS,
  GROUNDWATER_CONDITIONS,
  SITE_ACCESSIBILITY_OPTIONS,
  UTILITY_CONNECTION_OPTIONS,
  getBasementExcavationCost,
  getUtilityConnectionGroupCosts
} from "../../constants/construction"

interface Kg200CostsInput {
  effectiveArea: number
  landscapingArea?: number | null
  basementArea: number

  siteConditionId: string
  groundwaterConditionId: string
  accessibilityId: string

  utilityConnectionId: string
  customUtilityCost?: number | null
}

const SUBGROUP_210_MINIMUM_BASE_COST = 300

const SUBGROUP_210_ACCESS_SURCHARGES: Record<string, number> = {
  normal: 0,
  limited: 250,
  difficult: 600,
  very_difficult: 1000,
}

const SUBGROUP_210_SITE_CONDITION_RATES: Record<string, number> = {
  flat_normal: 0,
  flat_rocky: 0.10,
  inclined_normal: 0.20,
  inclined_rocky: 0.35,
  inclined_sandy: 0.50,
}

export function calculateSiteExcavationBaseCost(input: {
  effectiveArea: number
  landscapingArea?: number | null
}) {
  const landscapingArea = Math.max(0, input.landscapingArea ?? 0)
  const sitePrepBaseArea = Math.max(0, input.effectiveArea) + landscapingArea

  return Math.max(
    SUBGROUP_210_MINIMUM_BASE_COST,
    Math.round(sitePrepBaseArea)
  )
}

export function calculateKg200Costs(input: Kg200CostsInput) {

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

  const siteExcavationBaseCost =
    calculateSiteExcavationBaseCost({
      effectiveArea: input.effectiveArea,
      landscapingArea: input.landscapingArea,
    })
  const siteExcavationAccessExtra =
    SUBGROUP_210_ACCESS_SURCHARGES[accessibility.id] ?? 0
  const siteExcavationConditionExtra = Math.round(
    siteExcavationBaseCost * (SUBGROUP_210_SITE_CONDITION_RATES[siteCondition.id] ?? 0)
  )
  const siteExcavationCost =
    siteExcavationBaseCost +
    siteExcavationAccessExtra +
    siteExcavationConditionExtra

  const kg200Total =
    siteExcavationCost +
    utilityConnectionCost +
    group240Cost +
    group250Cost

  return {
    siteExcavationCost,
    siteExcavationBaseCost,
    siteExcavationAccessExtra,
    siteExcavationConditionExtra,
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
