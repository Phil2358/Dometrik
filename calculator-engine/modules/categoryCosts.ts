import {
  BASE_GROUP_SHARE_KG300,
  COST_CATEGORIES,
  KG300_CATEGORY_IDS,
  KG400_CATEGORY_IDS,
  KG600_CATEGORY_IDS,
  LOCATIONS,
  PREMIUM_BENCHMARK_BASE_COST_PER_SQM
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
  locationId: string
  qualityId: string
  sizeCorrectionFactor: number
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
    subgroup330Share: 0.54,
    subgroup340Share: 0.26,
    subgroup360Share: 0.15,
    subgroup390Share: 0.05
  },
  premium: {
    subgroup330Share: 0.60,
    subgroup340Share: 0.21,
    subgroup360Share: 0.14,
    subgroup390Share: 0.05
  },
  luxury: {
    subgroup330Share: 0.67,
    subgroup340Share: 0.15,
    subgroup360Share: 0.13,
    subgroup390Share: 0.05
  }
}

export function calculateKg300SubgroupCosts(input: Kg300SubgroupCostsInput): Kg300SubgroupCosts {
  const location =
    LOCATIONS.find((entry: any) => entry.id === input.locationId) ??
    LOCATIONS[0]

  const premiumBenchmarkCorrectedCostPerSqm =
    Math.round(PREMIUM_BENCHMARK_BASE_COST_PER_SQM * input.sizeCorrectionFactor)

  const premiumBenchmarkFinalCostPerSqm =
    Math.round(premiumBenchmarkCorrectedCostPerSqm * location.multiplier)

  const premiumBaseKG300 =
    Math.round(input.effectiveArea * premiumBenchmarkFinalCostPerSqm * BASE_GROUP_SHARE_KG300)

  const subgroup310Cost = Math.round(premiumBaseKG300 * 0.08)
  const subgroup320Cost = Math.round(premiumBaseKG300 * 0.14)
  const subgroup350Cost = Math.round(premiumBaseKG300 * 0.20)
  const fixedCore = subgroup310Cost + subgroup320Cost + subgroup350Cost
  const flexibleKG300 = Math.max(0, input.kg300Total - fixedCore)

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
    subgroup310Cost,
    subgroup320Cost,
    subgroup330Cost,
    subgroup340Cost,
    subgroup350Cost,
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
