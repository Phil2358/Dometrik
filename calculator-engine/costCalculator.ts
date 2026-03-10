import { ProjectInput, ProjectCostBreakdown } from "./types"
import { calculateStructureCost } from "./modules/structureCost"

export function calculateProjectCost(input: ProjectInput): ProjectCostBreakdown {

  const structureCost = calculateStructureCost(input)

  const totalCost = structureCost

  return {
    KG300: structureCost,
    totalCost
  }

}