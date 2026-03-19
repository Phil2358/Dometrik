import {
  SITE_CONDITIONS,
  SITE_ACCESSIBILITY_OPTIONS,
  UTILITY_CONNECTION_OPTIONS,
  getUtilityConnectionGroupCosts
} from "../../constants/construction"

interface Kg200CostsInput {
  buildingArea: number
  landscapingArea?: number | null

  siteConditionId: string
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
  buildingArea: number
  landscapingArea?: number | null
}) {
  const landscapingArea = Math.max(0, input.landscapingArea ?? 0)
  const sitePrepBaseArea = Math.max(0, input.buildingArea) + landscapingArea

  return Math.max(
    SUBGROUP_210_MINIMUM_BASE_COST,
    Math.round(sitePrepBaseArea)
  )
}

export function calculateKg200Costs(input: Kg200CostsInput) {
  const siteCondition =
    SITE_CONDITIONS.find((s: any) => s.id === input.siteConditionId)
    ?? SITE_CONDITIONS[0]

  const utility =
    UTILITY_CONNECTION_OPTIONS.find((u: any) => u.id === input.utilityConnectionId)
    ?? UTILITY_CONNECTION_OPTIONS[0]

  const accessibility =
    SITE_ACCESSIBILITY_OPTIONS.find((a: any) => a.id === input.accessibilityId)
    ?? SITE_ACCESSIBILITY_OPTIONS[0]

  const utilityConnectionCost =
    utility.id === "custom"
      ? (input.customUtilityCost ?? 0)
      : utility.cost

  const utilityGroupCosts =
    getUtilityConnectionGroupCosts(input.utilityConnectionId, utilityConnectionCost)

  const subgroup210BaseCost =
    calculateSiteExcavationBaseCost({
      buildingArea: input.buildingArea,
      landscapingArea: input.landscapingArea,
    })
  const subgroup210AccessExtra =
    SUBGROUP_210_ACCESS_SURCHARGES[accessibility.id] ?? 0
  const subgroup210SiteConditionExtra = Math.round(
    subgroup210BaseCost * (SUBGROUP_210_SITE_CONDITION_RATES[siteCondition.id] ?? 0)
  )
  const subgroup210Cost =
    subgroup210BaseCost +
    subgroup210AccessExtra +
    subgroup210SiteConditionExtra

  const subgroup220Cost = utilityGroupCosts.group220Cost
  const subgroup230Cost = utilityGroupCosts.group230Cost
  const group240Cost = 0
  const group250Cost = 0

  const kg200Total =
    subgroup210Cost +
    utilityConnectionCost +
    group240Cost +
    group250Cost

  return {
    siteExcavationCost: subgroup210Cost,
    siteExcavationBaseCost: subgroup210BaseCost,
    siteExcavationAccessExtra: subgroup210AccessExtra,
    siteExcavationConditionExtra: subgroup210SiteConditionExtra,
    utilityConnectionCost: Math.round(utilityConnectionCost),
    group220Cost: subgroup220Cost,
    group230Cost: subgroup230Cost,
    group240Cost,
    group250Cost,
    kg200Total: Math.round(kg200Total)
  }
}
