import { calculateProjectCost as engineCalculateProjectCost } from "./calculateProjectCost"
import { ProjectInput, ProjectCostBreakdown } from "./types"

export function calculateProjectCost(input: ProjectInput): ProjectCostBreakdown {

  const result = engineCalculateProjectCost(input)

  return {
    KG200: result.siteCosts.kg200Total,
    KG300: result.categories.kg300Total,
    KG400: result.categories.kg400Total + result.hvacExtras.hvacExtrasCost,
    KG500: result.pool.poolCost + result.landscaping.landscapingCost,
    KG600: result.categories.kg600Total,
    KG700: 0,
    totalCost: result.totalCost
  }

}