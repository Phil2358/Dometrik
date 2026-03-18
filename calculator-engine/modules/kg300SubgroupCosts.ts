import type { Kg300SubgroupCosts } from "./categoryCosts"

const KG300_BASE_FLEXIBLE_SHARES: Record<string, {
  subgroup330Share: number
  subgroup340Share: number
  subgroup350Share: number
  subgroup360Share: number
  subgroup390Share: number
}> = {
  standard: {
    subgroup330Share: 0.495,
    subgroup340Share: 0.243,
    subgroup350Share: 0.10,
    subgroup360Share: 0.117,
    subgroup390Share: 0.045,
  },
  premium: {
    subgroup330Share: 0.54,
    subgroup340Share: 0.216,
    subgroup350Share: 0.10,
    subgroup360Share: 0.099,
    subgroup390Share: 0.045,
  },
  luxury: {
    subgroup330Share: 0.567,
    subgroup340Share: 0.189,
    subgroup350Share: 0.10,
    subgroup360Share: 0.099,
    subgroup390Share: 0.045,
  },
}

const KG300_ACCESSIBILITY_WEIGHTS = {
  subgroup310: 0.60,
  subgroup320: 1.00,
  subgroup330: 0.45,
  subgroup340: 0.60,
  subgroup350: 0.60,
  subgroup360: 0.25,
  subgroup390: 0.20,
} as const

const BASE_SITE_CONDITION_FACTORS_310: Record<string, number> = {
  flat_normal: 1.00,
  flat_rocky: 1.08,
  inclined_normal: 1.06,
  inclined_rocky: 1.15,
  inclined_sandy: 1.18,
}

const BASE_SITE_CONDITION_FACTORS_320: Record<string, number> = {
  flat_normal: 1.00,
  flat_rocky: 1.03,
  inclined_normal: 1.02,
  inclined_rocky: 1.08,
  inclined_sandy: 1.10,
}

const BASE_GROUNDWATER_FACTORS_310: Record<string, number> = {
  normal: 1.00,
  moderate: 1.02,
  high: 1.05,
}

const BASE_GROUNDWATER_FACTORS_320: Record<string, number> = {
  normal: 1.00,
  moderate: 1.06,
  high: 1.15,
}

const BASEMENT_SITE_CONDITION_FACTORS: Record<string, number> = {
  flat_normal: 1.00,
  flat_rocky: 1.05,
  inclined_normal: 1.10,
  inclined_rocky: 1.12,
  inclined_sandy: 1.15,
}

const BASEMENT_GROUNDWATER_FACTORS: Record<string, number> = {
  normal: 1.00,
  moderate: 1.04,
  high: 1.10,
}

const BASEMENT_GROUNDWATER_FACTORS_320: Record<string, number> = {
  normal: 1.00,
  moderate: 1.08,
  high: 1.18,
}

interface Kg300SubgroupDetailsInput {
  basementArea: number
  premiumReferenceKg300Base: number
  noBasementKg300Base: number
  premiumReferenceFinalCostPerSqm: number
  kg300Cost: number
  siteConditionId: string
  groundwaterConditionId: string
  accessibilityExecutionDelta: number
  qualityId: string
}

export function calculateDetailedKg300SubgroupCosts(
  input: Kg300SubgroupDetailsInput
): { kg300Total: number; kg300SubgroupCosts: Kg300SubgroupCosts } {
  const rawBaseSubgroup310Cost = Math.round(input.premiumReferenceKg300Base * 0.02)
  const rawBaseSubgroup320Cost = Math.round(input.premiumReferenceKg300Base * 0.12)
  const structuralBaseSubgroup350Cost = Math.round(input.premiumReferenceKg300Base * 0.10)
  const baseSiteFactor310 = BASE_SITE_CONDITION_FACTORS_310[input.siteConditionId] ?? 1.00
  const baseSiteFactor320 = BASE_SITE_CONDITION_FACTORS_320[input.siteConditionId] ?? 1.00
  const baseGroundwaterFactor310 = BASE_GROUNDWATER_FACTORS_310[input.groundwaterConditionId] ?? 1.00
  const baseGroundwaterFactor320 = BASE_GROUNDWATER_FACTORS_320[input.groundwaterConditionId] ?? 1.00
  const adjustedBaseSubgroup310Cost = Math.round(
    rawBaseSubgroup310Cost * baseSiteFactor310 * baseGroundwaterFactor310
  )
  const adjustedBaseSubgroup320Cost = Math.round(
    rawBaseSubgroup320Cost * baseSiteFactor320 * baseGroundwaterFactor320
  )
  const baseStructuralAdjustment =
    (adjustedBaseSubgroup310Cost - rawBaseSubgroup310Cost) +
    (adjustedBaseSubgroup320Cost - rawBaseSubgroup320Cost)
  const kg300Total = input.kg300Cost + baseStructuralAdjustment
  const noBasementAdjustedKg300 = input.noBasementKg300Base + baseStructuralAdjustment
  const totalBasementDrivenKg300 = Math.max(0, kg300Total - noBasementAdjustedKg300)
  const basementSiteConditionFactor =
    input.basementArea > 0
      ? (BASEMENT_SITE_CONDITION_FACTORS[input.siteConditionId] ?? 1.00)
      : 1.00
  const basementGroundwaterFactor310 =
    input.basementArea > 0
      ? (BASEMENT_GROUNDWATER_FACTORS[input.groundwaterConditionId] ?? 1.00)
      : 1.00
  const basementGroundwaterFactor320 =
    input.basementArea > 0
      ? (BASEMENT_GROUNDWATER_FACTORS_320[input.groundwaterConditionId] ?? 1.00)
      : 1.00
  const basementFactor310 = input.basementArea > 0
    ? basementSiteConditionFactor * basementGroundwaterFactor310
    : 1.00
  const basementFactor320 = input.basementArea > 0
    ? basementSiteConditionFactor * basementGroundwaterFactor320
    : 1.00
  const rawBasementStructuralPool = input.basementArea > 0
    ? Math.min(
      totalBasementDrivenKg300,
      Math.round(input.basementArea * input.premiumReferenceFinalCostPerSqm * 0.10)
    )
    : 0
  const rawStructuralWeight310 = 0.25 * basementFactor310
  const rawStructuralWeight320 = 0.75 * basementFactor320
  const structuralWeightTotal = rawStructuralWeight310 + rawStructuralWeight320 || 1
  const subgroup310BasementStructural = Math.round(
    rawBasementStructuralPool * (rawStructuralWeight310 / structuralWeightTotal)
  )
  const subgroup320BasementStructural = Math.round(
    rawBasementStructuralPool - subgroup310BasementStructural
  )
  const basementTypePremiumPool = Math.max(0, totalBasementDrivenKg300 - rawBasementStructuralPool)

  const baseStructuralCore =
    adjustedBaseSubgroup310Cost +
    adjustedBaseSubgroup320Cost +
    structuralBaseSubgroup350Cost
  const baseFlexibleKg300 = Math.max(0, noBasementAdjustedKg300 - baseStructuralCore)

  const flexibleShares =
    KG300_BASE_FLEXIBLE_SHARES[input.qualityId] ??
    KG300_BASE_FLEXIBLE_SHARES.premium

  const subgroup330Cost = Math.round(baseFlexibleKg300 * flexibleShares.subgroup330Share)
  const subgroup340Cost = Math.round(baseFlexibleKg300 * flexibleShares.subgroup340Share)
  const subgroup350QualityCost = Math.round(baseFlexibleKg300 * flexibleShares.subgroup350Share)
  const subgroup360Cost = Math.round(baseFlexibleKg300 * flexibleShares.subgroup360Share)
  const subgroup390BaseCost = Math.round(
    baseFlexibleKg300
    - subgroup330Cost
    - subgroup340Cost
    - subgroup350QualityCost
    - subgroup360Cost
  )
  const basementTypePremium330 = Math.round(basementTypePremiumPool * 0.15)
  const basementTypePremium340 = Math.round(basementTypePremiumPool * 0.55)
  const basementTypePremium350 = Math.round(
    basementTypePremiumPool - basementTypePremium330 - basementTypePremium340
  )

  const subgroup310BaseCost = adjustedBaseSubgroup310Cost + subgroup310BasementStructural
  const subgroup320BaseCost = adjustedBaseSubgroup320Cost + subgroup320BasementStructural
  const subgroup330BaseCost = subgroup330Cost + basementTypePremium330
  const subgroup340BaseCost = subgroup340Cost + basementTypePremium340
  const subgroup350BaseCost =
    structuralBaseSubgroup350Cost + subgroup350QualityCost + basementTypePremium350
  const subgroup360BaseCost = subgroup360Cost

  const subgroup310AccessibilityCost = Math.round(
    subgroup310BaseCost * (1 + input.accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup310)
  )
  const subgroup320AccessibilityCost = Math.round(
    subgroup320BaseCost * (1 + input.accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup320)
  )
  const subgroup330AccessibilityCost = Math.round(
    subgroup330BaseCost * (1 + input.accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup330)
  )
  const subgroup340AccessibilityCost = Math.round(
    subgroup340BaseCost * (1 + input.accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup340)
  )
  const subgroup350AccessibilityCost = Math.round(
    subgroup350BaseCost * (1 + input.accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup350)
  )
  const subgroup360AccessibilityCost = Math.round(
    subgroup360BaseCost * (1 + input.accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup360)
  )
  const subgroup390AccessibilityCost = Math.round(
    subgroup390BaseCost * (1 + input.accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup390)
  )
  const rawKg300SubgroupTotal =
    subgroup310AccessibilityCost +
    subgroup320AccessibilityCost +
    subgroup330AccessibilityCost +
    subgroup340AccessibilityCost +
    subgroup350AccessibilityCost +
    subgroup360AccessibilityCost +
    subgroup390AccessibilityCost
  const kg300NormalizationFactor = rawKg300SubgroupTotal > 0
    ? kg300Total / rawKg300SubgroupTotal
    : 1

  const normalizedSubgroup310Cost = Math.round(subgroup310AccessibilityCost * kg300NormalizationFactor)
  const normalizedSubgroup320Cost = Math.round(subgroup320AccessibilityCost * kg300NormalizationFactor)
  const normalizedSubgroup330Cost = Math.round(subgroup330AccessibilityCost * kg300NormalizationFactor)
  const normalizedSubgroup340Cost = Math.round(subgroup340AccessibilityCost * kg300NormalizationFactor)
  const normalizedSubgroup350Cost = Math.round(subgroup350AccessibilityCost * kg300NormalizationFactor)
  const normalizedSubgroup360Cost = Math.round(subgroup360AccessibilityCost * kg300NormalizationFactor)
  const normalizedSubgroup390Cost =
    kg300Total
    - normalizedSubgroup310Cost
    - normalizedSubgroup320Cost
    - normalizedSubgroup330Cost
    - normalizedSubgroup340Cost
    - normalizedSubgroup350Cost
    - normalizedSubgroup360Cost

  return {
    kg300Total,
    kg300SubgroupCosts: {
      subgroup310Cost: normalizedSubgroup310Cost,
      subgroup320Cost: normalizedSubgroup320Cost,
      subgroup330Cost: normalizedSubgroup330Cost,
      subgroup340Cost: normalizedSubgroup340Cost,
      subgroup350Cost: normalizedSubgroup350Cost,
      subgroup360Cost: normalizedSubgroup360Cost,
      subgroup370Cost: 0,
      subgroup380Cost: 0,
      subgroup390Cost: normalizedSubgroup390Cost,
    },
  }
}
