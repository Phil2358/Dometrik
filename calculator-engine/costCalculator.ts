import { ProjectInput, ProjectCostBreakdown } from "./types"
import { calculateStructureCost } from "./modules/structureCost"
import { calculatePermitFees } from "./modules/permitFees"

export function calculateProjectCost(input: ProjectInput): ProjectCostBreakdown {

  const structureCost = calculateStructureCost(input)
  const permitFees = calculatePermitFees(input)

  const totalCost =
    structureCost +
    permitFees

  return {
    KG300: structureCost,
    KG700: permitFees,
    totalCost
  }

}