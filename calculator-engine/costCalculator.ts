import { ProjectInput, ProjectCostBreakdown } from "./types"
import { calculateStructureCost } from "./modules/structureCost"
import { calculatePermitFees } from "./modules/permitFees"
import { calculateSystemsCost } from "./modules/systemsCost"

export function calculateProjectCost(input: ProjectInput): ProjectCostBreakdown {

  const structureCost = calculateStructureCost(input)
  const systemsCost = calculateSystemsCost(input)
  const permitFees = calculatePermitFees(input)

  const totalCost =
    structureCost +
    systemsCost +
    permitFees

  return {
    KG300: structureCost,
    KG400: systemsCost,
    KG700: permitFees,
    totalCost
  }

}