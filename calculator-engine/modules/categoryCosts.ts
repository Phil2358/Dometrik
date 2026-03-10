import {
  COST_CATEGORIES,
  KG300_CATEGORY_IDS,
  KG400_CATEGORY_IDS,
  KG600_CATEGORY_IDS
} from "@/constants/construction"

interface CategoryCostsInput {
  rawBuildingCost: number
}

export function calculateCategoryCosts(input: CategoryCostsInput) {

  const categoryCosts = COST_CATEGORIES.map(category => {
    const cost =
      (category.percentage / 100) * input.rawBuildingCost

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