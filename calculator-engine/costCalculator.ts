import { ProjectInput, ProjectCostBreakdown } from "./types"
import { calculateStructureCost } from "./modules/structureCost"
import { calculatePermitFees } from "./modules/permitFees"
import { calculateSystemsCost } from "./modules/systemsCost"
import { calculateExternalWorksCost } from "./modules/externalWorksCost"
import { calculateContingencyCost } from "./modules/contingencyCost"

export function calculateProjectCost(input: ProjectInput): ProjectCostBreakdown {

  const structureCost = calculateStructureCost(input)
  const systemsCost = calculateSystemsCost(input)
  const externalWorksCost = calculateExternalWorksCost(input)
  const permitFees = calculatePermitFees(input)

  const constructionSubtotal =
    structureCost +
    systemsCost +
    externalWorksCost

  const contingencyCost =
    calculateContingencyCost(
      constructionSubtotal,
      input.qualityLevel
    )

  const totalCost =
    constructionSubtotal +
    permitFees +
    contingencyCost

  return {
    KG300: structureCost,
    KG400: systemsCost,
    KG500: externalWorksCost,
    KG700: permitFees,
    totalCost
  }

}