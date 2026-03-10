import { ProjectInput } from "./types"
import { calculateStructureCost } from "./modules/structureCost"

export function calculateProjectCost(input: ProjectInput) {

  const structureCost = calculateStructureCost(input)

  const totalCost = structureCost

  return {
    structureCost,
    totalCost
  }

}