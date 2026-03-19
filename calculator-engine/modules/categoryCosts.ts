import {
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

export function calculateKg300CategoryCostsById(benchmarkBucket300: number): Record<string, number> {
  return KG300_CATEGORY_IDS.reduce<Record<string, number>>((costsById, categoryId) => {
    const category = COST_CATEGORIES.find((item) => item.id === categoryId)
    const percentage = category?.percentage ?? 0

    costsById[categoryId] = Math.round(
      Math.max(0, benchmarkBucket300) * (percentage / 67)
    )

    return costsById
  }, {})
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

export function calculateCategoryCosts(input: CategoryCostsInput) {
  // KG400 source of truth lives in kg400Costs.ts.
  // This helper only owns the benchmark-driven KG300/KG600 category skeleton.
  const kg300CategoryCostsById = calculateKg300CategoryCostsById(input.benchmarkBucket300)
  const categoryCosts = COST_CATEGORIES.map(category => {
    const cost =
      category.din276 === 'KG 300'
        ? (kg300CategoryCostsById[category.id] ?? 0)
        : 0

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
