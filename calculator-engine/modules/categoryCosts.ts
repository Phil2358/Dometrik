import {
  BASEMENT_TYPES,
  BASE_GROUP_SHARE_KG300,
  COST_CATEGORIES,
  DEFAULT_QUALITY_ID,
  KG300_CATEGORY_IDS,
  KG600_CATEGORY_IDS,
  LEVEL_1_BENCHMARK_RAW_SHARES,
  type QualityId,
} from "../../constants/construction"

interface CategoryCostsInput {
  benchmarkBucket300: number
}

interface Level1BenchmarkAllocationInput {
  benchmarkTotal: number
  siteExcavationBaseCost: number
  wardrobePackageCost: number
  qualityId: QualityId
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
  qualityId: QualityId
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

const KG300_FLEXIBLE_SUBGROUP_SHARES: Record<QualityId, Kg300SubgroupShareSet> = {
  economy: {
    subgroup330Share: 0.55,
    subgroup340Share: 0.27,
    subgroup360Share: 0.13,
    subgroup390Share: 0.05
  },
  midRange: {
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

export function calculateLevel1BenchmarkAllocation(input: Level1BenchmarkAllocationInput) {
  const rawShares =
    LEVEL_1_BENCHMARK_RAW_SHARES[input.qualityId]
    ?? LEVEL_1_BENCHMARK_RAW_SHARES[DEFAULT_QUALITY_ID]
  const fixedBenchmarkIncluded =
    Math.max(0, input.siteExcavationBaseCost) + Math.max(0, input.wardrobePackageCost)
  const remainingBenchmarkPool =
    Math.max(0, Math.round(input.benchmarkTotal) - fixedBenchmarkIncluded)
  const rawShareTotal = rawShares.kg300 + rawShares.kg400 || 1
  const benchmarkBucket300 = Math.round(
    remainingBenchmarkPool * (rawShares.kg300 / rawShareTotal)
  )
  const benchmarkBucket400 =
    Math.max(0, remainingBenchmarkPool - benchmarkBucket300)

  return {
    fixedBenchmarkIncluded,
    remainingBenchmarkPool,
    benchmarkBucket300,
    benchmarkBucket400,
  }
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
    KG300_FLEXIBLE_SUBGROUP_SHARES[DEFAULT_QUALITY_ID]

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
  // KG400 source of truth lives in kg400Costs.ts.
  // This helper only owns the benchmark-driven KG300/KG600 category skeleton.
  const categoryCosts = COST_CATEGORIES.map(category => {
    const groupBase =
      category.din276 === 'KG 300'
        ? input.benchmarkBucket300
        : 0

    const groupPercentage =
      category.din276 === 'KG 300'
        ? category.percentage / 67
        : 0

    let cost =
      groupPercentage * groupBase

    return {
      id: category.id,
      din276: category.din276,
      name: category.name,
      percentage: category.percentage,
      cost: Math.round(cost)
    }

  })

  const kg300Total = categoryCosts
    .filter(c => KG300_CATEGORY_IDS.includes(c.id as any))
    .reduce((sum, c) => sum + c.cost, 0)

  const kg600Total = categoryCosts
    .filter(c => KG600_CATEGORY_IDS.includes(c.id as any))
    .reduce((sum, c) => sum + c.cost, 0)

  return {
    categoryCosts,
    kg300Total,
    kg400Total: 0,
    kg600Total
  }

}
