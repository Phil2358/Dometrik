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

const SUBGROUP_320_SITE_CONDITION_RATES: Record<string, number> = {
  flat_normal: 0.00,
  flat_rocky: 0.03,
  inclined_normal: 0.02,
  inclined_rocky: 0.08,
  inclined_sandy: 0.10,
}

const SUBGROUP_320_GROUNDWATER_RATES: Record<string, number> = {
  normal: 0.00,
  moderate: 0.06,
  high: 0.15,
}

const SUBGROUP_330_SITE_CONDITION_RATES: Record<string, number> = {
  flat_normal: 0.00,
  flat_rocky: 0.01,
  inclined_normal: 0.01,
  inclined_rocky: 0.03,
  inclined_sandy: 0.04,
}

const SUBGROUP_330_GROUNDWATER_RATES: Record<string, number> = {
  normal: 0.00,
  moderate: 0.00,
  high: 0.02,
}

const SUBGROUP_340_SITE_CONDITION_RATES: Record<string, number> = {
  flat_normal: 0.00,
  flat_rocky: 0.00,
  inclined_normal: 0.00,
  inclined_rocky: 0.00,
  inclined_sandy: 0.00,
}

const SUBGROUP_340_GROUNDWATER_RATES: Record<string, number> = {
  normal: 0.00,
  moderate: 0.00,
  high: 0.00,
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
  subgroup320: {
    baseCost: number
    siteConditionRate: number
    siteConditionExtra: number
    groundwaterRate: number
    groundwaterExtra: number
    accessibilityRate: number
    accessibilityExtra: number
    finalCost: number
  }
  subgroup330: {
    baseCost: number
    siteConditionRate: number
    siteConditionExtra: number
    groundwaterRate: number
    groundwaterExtra: number
    accessibilityRate: number
    accessibilityExtra: number
    finalCost: number
  }
  subgroup340: {
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

  const baseSubgroup320Cost = input.kg300SubgroupCosts.subgroup320Cost
  const siteConditionRate320 =
    SUBGROUP_320_SITE_CONDITION_RATES[input.siteConditionId] ?? 0
  const siteConditionExtra320 = Math.round(baseSubgroup320Cost * siteConditionRate320)
  const subgroup320AfterSite = baseSubgroup320Cost + siteConditionExtra320

  const groundwaterRate320 =
    SUBGROUP_320_GROUNDWATER_RATES[input.groundwaterConditionId] ?? 0
  const groundwaterExtra320 = Math.round(subgroup320AfterSite * groundwaterRate320)
  const subgroup320AfterGroundwater = subgroup320AfterSite + groundwaterExtra320

  const accessibilityRate320 =
    Math.max(0, resolvedSiteAccessibilityFactor - 1) * 1.00
  const accessibilityExtra320 = Math.round(
    subgroup320AfterGroundwater * accessibilityRate320
  )
  const finalSubgroup320Cost =
    subgroup320AfterGroundwater + accessibilityExtra320

  const baseSubgroup330Cost = input.kg300SubgroupCosts.subgroup330Cost
  const siteConditionRate330 =
    SUBGROUP_330_SITE_CONDITION_RATES[input.siteConditionId] ?? 0
  const siteConditionExtra330 = Math.round(baseSubgroup330Cost * siteConditionRate330)
  const subgroup330AfterSite = baseSubgroup330Cost + siteConditionExtra330

  const groundwaterRate330 =
    SUBGROUP_330_GROUNDWATER_RATES[input.groundwaterConditionId] ?? 0
  const groundwaterExtra330 = Math.round(subgroup330AfterSite * groundwaterRate330)
  const subgroup330AfterGroundwater = subgroup330AfterSite + groundwaterExtra330

  const accessibilityRate330 =
    Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.45
  const accessibilityExtra330 = Math.round(
    subgroup330AfterGroundwater * accessibilityRate330
  )
  const finalSubgroup330Cost =
    subgroup330AfterGroundwater + accessibilityExtra330

  const baseSubgroup340Cost = input.kg300SubgroupCosts.subgroup340Cost
  const siteConditionRate340 =
    SUBGROUP_340_SITE_CONDITION_RATES[input.siteConditionId] ?? 0
  const siteConditionExtra340 = Math.round(baseSubgroup340Cost * siteConditionRate340)
  const subgroup340AfterSite = baseSubgroup340Cost + siteConditionExtra340

  const groundwaterRate340 =
    SUBGROUP_340_GROUNDWATER_RATES[input.groundwaterConditionId] ?? 0
  const groundwaterExtra340 = Math.round(subgroup340AfterSite * groundwaterRate340)
  const subgroup340AfterGroundwater = subgroup340AfterSite + groundwaterExtra340

  const accessibilityRate340 =
    Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.25
  const accessibilityExtra340 = Math.round(
    subgroup340AfterGroundwater * accessibilityRate340
  )
  const finalSubgroup340Cost =
    subgroup340AfterGroundwater + accessibilityExtra340

  const kg300SubgroupCosts: Kg300SubgroupCosts = {
    ...input.kg300SubgroupCosts,
    subgroup310Cost: finalSubgroup310Cost,
    subgroup320Cost: finalSubgroup320Cost,
    subgroup330Cost: finalSubgroup330Cost,
    subgroup340Cost: finalSubgroup340Cost,
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
      subgroup320: {
        baseCost: baseSubgroup320Cost,
        siteConditionRate: siteConditionRate320,
        siteConditionExtra: siteConditionExtra320,
        groundwaterRate: groundwaterRate320,
        groundwaterExtra: groundwaterExtra320,
        accessibilityRate: accessibilityRate320,
        accessibilityExtra: accessibilityExtra320,
        finalCost: finalSubgroup320Cost,
      },
      subgroup330: {
        baseCost: baseSubgroup330Cost,
        siteConditionRate: siteConditionRate330,
        siteConditionExtra: siteConditionExtra330,
        groundwaterRate: groundwaterRate330,
        groundwaterExtra: groundwaterExtra330,
        accessibilityRate: accessibilityRate330,
        accessibilityExtra: accessibilityExtra330,
        finalCost: finalSubgroup330Cost,
      },
      subgroup340: {
        baseCost: baseSubgroup340Cost,
        siteConditionRate: siteConditionRate340,
        siteConditionExtra: siteConditionExtra340,
        groundwaterRate: groundwaterRate340,
        groundwaterExtra: groundwaterExtra340,
        accessibilityRate: accessibilityRate340,
        accessibilityExtra: accessibilityExtra340,
        finalCost: finalSubgroup340Cost,
      },
    },
  }
}
