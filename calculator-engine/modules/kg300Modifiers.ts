import type { Kg300SubgroupCosts } from "./categoryCosts"

const SUBGROUP_310_SITE_CONDITION_RATES: Record<string, number> = {
  flat_normal: 0.00,
  flat_rocky: 0.08,
  inclined_normal: 0.06,
  inclined_rocky: 0.15,
  inclined_sandy: 0.18,
}

const SUBGROUP_310_GROUNDWATER_RATES: Record<string, number> = {
  normal: 0.00,
  moderate: 0.02,
  high: 0.05,
}

export interface Kg300ModifierDetails {
  subgroup310: {
    baseCost: number
    siteConditionRate: number
    siteConditionExtra: number
    groundwaterRate: number
    groundwaterExtra: number
    accessibilityRate: number
    accessibilityExtra: number
    finalCost: number
  }
}

interface Kg300ModifiersInput {
  kg300SubgroupCosts: Kg300SubgroupCosts
  siteConditionId: string
  groundwaterConditionId: string
  siteAccessibilityFactor?: number
}

export function calculateKg300Modifiers(input: Kg300ModifiersInput): {
  kg300Total: number
  kg300SubgroupCosts: Kg300SubgroupCosts
  modifierDetails: Kg300ModifierDetails
} {
  const baseSubgroup310Cost = input.kg300SubgroupCosts.subgroup310Cost
  const siteConditionRate310 =
    SUBGROUP_310_SITE_CONDITION_RATES[input.siteConditionId] ?? 0
  const siteConditionExtra310 = Math.round(baseSubgroup310Cost * siteConditionRate310)
  const subgroup310AfterSite = baseSubgroup310Cost + siteConditionExtra310

  const groundwaterRate310 =
    SUBGROUP_310_GROUNDWATER_RATES[input.groundwaterConditionId] ?? 0
  const groundwaterExtra310 = Math.round(subgroup310AfterSite * groundwaterRate310)
  const subgroup310AfterGroundwater = subgroup310AfterSite + groundwaterExtra310

  const resolvedSiteAccessibilityFactor = input.siteAccessibilityFactor ?? 1.00
  const accessibilityRate310 =
    Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.60
  const accessibilityExtra310 = Math.round(
    subgroup310AfterGroundwater * accessibilityRate310
  )
  const finalSubgroup310Cost =
    subgroup310AfterGroundwater + accessibilityExtra310

  const kg300SubgroupCosts: Kg300SubgroupCosts = {
    ...input.kg300SubgroupCosts,
    subgroup310Cost: finalSubgroup310Cost,
  }

  const kg300Total =
    kg300SubgroupCosts.subgroup310Cost +
    kg300SubgroupCosts.subgroup320Cost +
    kg300SubgroupCosts.subgroup330Cost +
    kg300SubgroupCosts.subgroup340Cost +
    kg300SubgroupCosts.subgroup350Cost +
    kg300SubgroupCosts.subgroup360Cost +
    kg300SubgroupCosts.subgroup370Cost +
    kg300SubgroupCosts.subgroup380Cost +
    kg300SubgroupCosts.subgroup390Cost

  return {
    kg300Total,
    kg300SubgroupCosts,
    modifierDetails: {
      subgroup310: {
        baseCost: baseSubgroup310Cost,
        siteConditionRate: siteConditionRate310,
        siteConditionExtra: siteConditionExtra310,
        groundwaterRate: groundwaterRate310,
        groundwaterExtra: groundwaterExtra310,
        accessibilityRate: accessibilityRate310,
        accessibilityExtra: accessibilityExtra310,
        finalCost: finalSubgroup310Cost,
      },
    },
  }
}
