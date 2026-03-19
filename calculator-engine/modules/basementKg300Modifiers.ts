import type { Kg300SubgroupCosts } from "./categoryCosts"

const SUBGROUP_310_SITE_CONDITION_RATES: Record<string, number> = {
  flat_normal: 0.00,
  flat_rocky: 0.12,
  inclined_normal: 0.10,
  inclined_rocky: 0.22,
  inclined_sandy: 0.28,
}

const SUBGROUP_310_GROUNDWATER_RATES: Record<string, number> = {
  normal: 0.00,
  moderate: 0.04,
  high: 0.10,
}

const SUBGROUP_320_SITE_CONDITION_RATES: Record<string, number> = {
  flat_normal: 0.00,
  flat_rocky: 0.05,
  inclined_normal: 0.04,
  inclined_rocky: 0.10,
  inclined_sandy: 0.12,
}

const SUBGROUP_320_GROUNDWATER_RATES: Record<string, number> = {
  normal: 0.00,
  moderate: 0.10,
  high: 0.22,
}

const SUBGROUP_330_SITE_CONDITION_RATES: Record<string, number> = {
  flat_normal: 0.00,
  flat_rocky: 0.02,
  inclined_normal: 0.02,
  inclined_rocky: 0.05,
  inclined_sandy: 0.06,
}

const SUBGROUP_330_GROUNDWATER_RATES: Record<string, number> = {
  normal: 0.00,
  moderate: 0.00,
  high: 0.03,
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

const SUBGROUP_350_SITE_CONDITION_RATES: Record<string, number> = {
  flat_normal: 0.00,
  flat_rocky: 0.00,
  inclined_normal: 0.01,
  inclined_rocky: 0.03,
  inclined_sandy: 0.04,
}

const SUBGROUP_350_GROUNDWATER_RATES: Record<string, number> = {
  normal: 0.00,
  moderate: 0.00,
  high: 0.00,
}

interface BasementKg300ModifierDetail {
  baseCost: number
  siteConditionRate: number
  siteConditionExtra: number
  groundwaterRate: number
  groundwaterExtra: number
  accessibilityRate: number
  accessibilityExtra: number
  finalCost: number
}

export interface BasementKg300ModifierDetails {
  subgroup310: BasementKg300ModifierDetail
  subgroup320: BasementKg300ModifierDetail
  subgroup330: BasementKg300ModifierDetail
  subgroup340: BasementKg300ModifierDetail
  subgroup350: BasementKg300ModifierDetail
}

interface BasementKg300ModifiersInput {
  kg300SubgroupCosts: Kg300SubgroupCosts
  siteConditionId: string
  groundwaterConditionId: string
  siteAccessibilityFactor?: number
}

function applySequentialSurcharges(input: {
  baseCost: number
  siteConditionRate: number
  groundwaterRate: number
  accessibilityRate: number
}): BasementKg300ModifierDetail {
  const siteConditionExtra = Math.round(input.baseCost * input.siteConditionRate)
  const subtotalAfterSite = input.baseCost + siteConditionExtra
  const groundwaterExtra = Math.round(subtotalAfterSite * input.groundwaterRate)
  const subtotalAfterGroundwater = subtotalAfterSite + groundwaterExtra
  const accessibilityExtra = Math.round(
    subtotalAfterGroundwater * input.accessibilityRate
  )
  const finalCost = subtotalAfterGroundwater + accessibilityExtra

  return {
    baseCost: input.baseCost,
    siteConditionRate: input.siteConditionRate,
    siteConditionExtra,
    groundwaterRate: input.groundwaterRate,
    groundwaterExtra,
    accessibilityRate: input.accessibilityRate,
    accessibilityExtra,
    finalCost,
  }
}

export function calculateBasementKg300Modifiers(input: BasementKg300ModifiersInput): {
  kg300Total: number
  kg300SubgroupCosts: Kg300SubgroupCosts
  modifierDetails: BasementKg300ModifierDetails
} {
  const resolvedSiteAccessibilityFactor = input.siteAccessibilityFactor ?? 1.00

  const subgroup310 = applySequentialSurcharges({
    baseCost: input.kg300SubgroupCosts.subgroup310Cost,
    siteConditionRate: SUBGROUP_310_SITE_CONDITION_RATES[input.siteConditionId] ?? 0,
    groundwaterRate: SUBGROUP_310_GROUNDWATER_RATES[input.groundwaterConditionId] ?? 0,
    accessibilityRate: Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.70,
  })

  const subgroup320 = applySequentialSurcharges({
    baseCost: input.kg300SubgroupCosts.subgroup320Cost,
    siteConditionRate: SUBGROUP_320_SITE_CONDITION_RATES[input.siteConditionId] ?? 0,
    groundwaterRate: SUBGROUP_320_GROUNDWATER_RATES[input.groundwaterConditionId] ?? 0,
    accessibilityRate: Math.max(0, resolvedSiteAccessibilityFactor - 1) * 1.10,
  })

  const subgroup330 = applySequentialSurcharges({
    baseCost: input.kg300SubgroupCosts.subgroup330Cost,
    siteConditionRate: SUBGROUP_330_SITE_CONDITION_RATES[input.siteConditionId] ?? 0,
    groundwaterRate: SUBGROUP_330_GROUNDWATER_RATES[input.groundwaterConditionId] ?? 0,
    accessibilityRate: Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.45,
  })

  const subgroup340 = applySequentialSurcharges({
    baseCost: input.kg300SubgroupCosts.subgroup340Cost,
    siteConditionRate: SUBGROUP_340_SITE_CONDITION_RATES[input.siteConditionId] ?? 0,
    groundwaterRate: SUBGROUP_340_GROUNDWATER_RATES[input.groundwaterConditionId] ?? 0,
    accessibilityRate: Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.20,
  })

  const subgroup350 = applySequentialSurcharges({
    baseCost: input.kg300SubgroupCosts.subgroup350Cost,
    siteConditionRate: SUBGROUP_350_SITE_CONDITION_RATES[input.siteConditionId] ?? 0,
    groundwaterRate: SUBGROUP_350_GROUNDWATER_RATES[input.groundwaterConditionId] ?? 0,
    accessibilityRate: Math.max(0, resolvedSiteAccessibilityFactor - 1) * 0.55,
  })

  const kg300SubgroupCosts: Kg300SubgroupCosts = {
    ...input.kg300SubgroupCosts,
    subgroup310Cost: subgroup310.finalCost,
    subgroup320Cost: subgroup320.finalCost,
    subgroup330Cost: subgroup330.finalCost,
    subgroup340Cost: subgroup340.finalCost,
    subgroup350Cost: subgroup350.finalCost,
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
      subgroup310,
      subgroup320,
      subgroup330,
      subgroup340,
      subgroup350,
    },
  }
}
