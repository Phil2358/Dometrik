import {
  BASEMENT_TYPES,
  BASE_GROUP_SHARE_KG400,
  BASE_GROUP_SHARE_KG300,
  COST_CATEGORIES,
  KG300_CATEGORY_IDS,
  KG400_CATEGORY_IDS,
  KG600_CATEGORY_IDS
} from "../../constants/construction"

interface CategoryCostsInput {
  kg300Base: number
  kg400Base: number
}

interface Kg300SubgroupShareSet {
  subgroup330Share: number
  subgroup340Share: number
  subgroup360Share: number
  subgroup390Share: number
}

interface Kg300SubgroupCostsInput {
  kg300Total: number
  effectiveArea: number
  storageBasementArea?: number
  parkingBasementArea?: number
  habitableBasementArea?: number
  qualityId: string
  selectedFinalCostPerSqm: number
}

export interface Kg300SubgroupCosts {
  subgroup310Cost: number
  subgroup320Cost: number
  subgroup330Cost: number
  subgroup340Cost: number
  subgroup350Cost: number
  subgroup360Cost: number
  subgroup370Cost: number
  subgroup380Cost: number
  subgroup390Cost: number
}

const KG300_FLEXIBLE_SUBGROUP_SHARES: Record<string, Kg300SubgroupShareSet> = {
  standard: {
    subgroup330Share: 0.55,
    subgroup340Share: 0.27,
    subgroup360Share: 0.13,
    subgroup390Share: 0.05
  },
  premium: {
    subgroup330Share: 0.60,
    subgroup340Share: 0.24,
    subgroup360Share: 0.11,
    subgroup390Share: 0.05
  },
  luxury: {
    subgroup330Share: 0.63,
    subgroup340Share: 0.21,
    subgroup360Share: 0.11,
    subgroup390Share: 0.05
  }
}

const KG300_PLUS_KG400_BASE_SHARE = BASE_GROUP_SHARE_KG300 + BASE_GROUP_SHARE_KG400

export function calculateWeightedBasementArea(input: {
  storageBasementArea?: number
  parkingBasementArea?: number
  habitableBasementArea?: number
}): number {
  const storageBasementType =
    BASEMENT_TYPES.find((entry: any) => entry.id === "storage") ??
    BASEMENT_TYPES[0]
  const parkingBasementType =
    BASEMENT_TYPES.find((entry: any) => entry.id === "parking") ??
    BASEMENT_TYPES[0]
  const habitableBasementType =
    BASEMENT_TYPES.find((entry: any) => entry.id === "habitable") ??
    BASEMENT_TYPES[0]

  return (input.storageBasementArea ?? 0) * storageBasementType.costFactor
    + (input.parkingBasementArea ?? 0) * parkingBasementType.costFactor
    + (input.habitableBasementArea ?? 0) * habitableBasementType.costFactor
}

export function getAdjustedKg300Share(weightedBasementRatio: number): number {
  if (weightedBasementRatio <= 0) return BASE_GROUP_SHARE_KG300
  if (weightedBasementRatio <= 0.15) return 0.655
  if (weightedBasementRatio <= 0.30) return 0.67
  return 0.685
}

export function getAdjustedKg400Share(weightedBasementRatio: number): number {
  return KG300_PLUS_KG400_BASE_SHARE - getAdjustedKg300Share(weightedBasementRatio)
}

export function calculateKg300SubgroupCosts(input: Kg300SubgroupCostsInput): Kg300SubgroupCosts {
  const weightedBasementArea =
    calculateWeightedBasementArea({
      storageBasementArea: input.storageBasementArea,
      parkingBasementArea: input.parkingBasementArea,
      habitableBasementArea: input.habitableBasementArea
    })
  const noBasementEffectiveArea =
    Math.max(0, input.effectiveArea - weightedBasementArea)
  const noBasementConstructionCost =
    noBasementEffectiveArea * input.selectedFinalCostPerSqm
  const baseKg300NonBasement =
    Math.round(noBasementConstructionCost * BASE_GROUP_SHARE_KG300)
  const kg300BasementIncrement =
    Math.max(0, input.kg300Total - baseKg300NonBasement)

  const baseSubgroup310Cost = Math.round(baseKg300NonBasement * 0.06)
  const baseSubgroup320Cost = Math.round(baseKg300NonBasement * 0.12)
  const baseSubgroup350Cost = Math.round(baseKg300NonBasement * 0.20)

  const subgroup310Increment = Math.round(kg300BasementIncrement * 0.30)
  const subgroup320Increment = Math.round(kg300BasementIncrement * 0.35)
  const subgroup350Increment = Math.round(kg300BasementIncrement * 0.20)
  const subgroup330Increment = Math.round(kg300BasementIncrement * 0.10)
  const subgroup340Increment =
    Math.round(
      kg300BasementIncrement
      - subgroup310Increment
      - subgroup320Increment
      - subgroup350Increment
      - subgroup330Increment
    )

  const baseStructuralCore = baseSubgroup310Cost + baseSubgroup320Cost + baseSubgroup350Cost
  const flexibleKG300 = Math.max(0, baseKg300NonBasement - baseStructuralCore)

  const flexibleShares =
    KG300_FLEXIBLE_SUBGROUP_SHARES[input.qualityId] ??
    KG300_FLEXIBLE_SUBGROUP_SHARES.premium

  const subgroup330Cost = Math.round(flexibleKG300 * flexibleShares.subgroup330Share)
  const subgroup340Cost = Math.round(flexibleKG300 * flexibleShares.subgroup340Share)
  const subgroup360Cost = Math.round(flexibleKG300 * flexibleShares.subgroup360Share)
  const subgroup390Cost =
    Math.round(
      flexibleKG300
      - subgroup330Cost
      - subgroup340Cost
      - subgroup360Cost
    )

  return {
    subgroup310Cost: baseSubgroup310Cost + subgroup310Increment,
    subgroup320Cost: baseSubgroup320Cost + subgroup320Increment,
    subgroup330Cost: subgroup330Cost + subgroup330Increment,
    subgroup340Cost: subgroup340Cost + subgroup340Increment,
    subgroup350Cost: baseSubgroup350Cost + subgroup350Increment,
    subgroup360Cost,
    subgroup370Cost: 0,
    subgroup380Cost: 0,
    subgroup390Cost
  }
}

export function calculateCategoryCosts(input: CategoryCostsInput) {

  const categoryCosts = COST_CATEGORIES.map(category => {
    const groupBase =
      category.din276 === 'KG 300'
        ? input.kg300Base
        : category.din276 === 'KG 400'
          ? input.kg400Base
          : 0

    const groupPercentage =
      category.din276 === 'KG 300'
        ? category.percentage / 67
        : category.din276 === 'KG 400'
          ? category.percentage / 24
          : 0

    const cost =
      groupPercentage * groupBase

    return {
      id: category.id,
      din276: category.din276,
      name: category.name,
      percentage: category.percentage,
      cost
    }

  })

  const kg300Total = categoryCosts
    .filter(c => KG300_CATEGORY_IDS.includes(c.id as any))
    .reduce((sum, c) => sum + c.cost, 0)

  const kg400Total = categoryCosts
    .filter(c => KG400_CATEGORY_IDS.includes(c.id as any))
    .reduce((sum, c) => sum + c.cost, 0)

  const kg600Total = categoryCosts
    .filter(c => KG600_CATEGORY_IDS.includes(c.id as any))
    .reduce((sum, c) => sum + c.cost, 0)

  return {
    categoryCosts,
    kg300Total,
    kg400Total,
    kg600Total
  }

}
