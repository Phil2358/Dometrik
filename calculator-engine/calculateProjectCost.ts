import { calculateEffectiveArea } from "./modules/effectiveArea"
import { calculateRawBuildingCost } from "./modules/rawBuildingCost"
import { calculateCategoryCosts } from "./modules/categoryCosts"
import { calculateSiteCosts } from "./modules/siteCosts"
import { calculateBasementCosts } from "./modules/basementCosts"
import { calculateHvacExtras } from "./modules/hvacExtras"
import { calculatePoolCosts } from "./modules/poolCosts"
import { calculateLandscapingCosts } from "./modules/landscapingCosts"
import { calculatePermitCosts } from "./modules/permitCosts"

interface ProjectCalculationInput {

  mainArea: number
  terraceArea: number
  balconyArea: number
  basementArea: number
  basementTypeId: string

  locationId: string
  qualityId: string
  customCostPerSqm?: number | null

  siteConditionId: string
  groundwaterConditionId: string
  accessibilityId: string

  utilityConnectionId: string
  customUtilityCost?: number | null

  landscapingArea: number

  includePool: boolean
  poolSizeId: string
  poolCustomArea?: number | null
  poolDepth?: number | null
  poolQualityId: string
  poolTypeId: string

  hvacSelections: Record<string, boolean>
}

export function calculateProjectCost(input: ProjectCalculationInput) {

  // -----------------------------------------
  // Effective area
  // -----------------------------------------

  const effectiveArea =
    calculateEffectiveArea({
      mainArea: input.mainArea,
      terraceArea: input.terraceArea,
      balconyArea: input.balconyArea,
      basementArea: input.basementArea,
      basementTypeId: input.basementTypeId
    })


  // -----------------------------------------
  // Raw building cost
  // -----------------------------------------

  const buildingCost =
    calculateRawBuildingCost({
      livingArea: input.mainArea,
      effectiveArea,
      locationId: input.locationId,
      qualityId: input.qualityId,
      customCostPerSqm: input.customCostPerSqm
    })


  // -----------------------------------------
  // Category costs (DIN276 groups)
  // -----------------------------------------

  const categoryCosts =
    calculateCategoryCosts({
      kg300Base: buildingCost.kg300Base,
      kg400Base: buildingCost.kg400Base
    })


  // -----------------------------------------
  // Permit costs
  // -----------------------------------------

  const permitCosts =
    calculatePermitCosts({
      effectiveArea,
      qualityId: input.qualityId
    })


  // -----------------------------------------
  // Site costs
  // -----------------------------------------

  const siteCosts =
    calculateSiteCosts({
      kg200Base: buildingCost.kg200Base,
      mainArea: input.mainArea,
      basementArea: input.basementArea,
      siteConditionId: input.siteConditionId,
      groundwaterConditionId: input.groundwaterConditionId,
      accessibilityId: input.accessibilityId,
      utilityConnectionId: input.utilityConnectionId,
      customUtilityCost: input.customUtilityCost
    })


  // -----------------------------------------
  // Basement structural costs
  // -----------------------------------------

  const basementCosts =
    calculateBasementCosts({
      basementArea: input.basementArea,
      basementTypeId: input.basementTypeId,
      groundwaterConditionId: input.groundwaterConditionId,
      siteConditionIsRocky: input.siteConditionId === "rock"
    })


  // -----------------------------------------
  // HVAC extras
  // -----------------------------------------

  const hvacCosts =
    calculateHvacExtras({
      effectiveArea,
      hvacSelections: input.hvacSelections
    })


  // -----------------------------------------
  // Pool
  // -----------------------------------------

  const poolCosts =
    calculatePoolCosts({
      includePool: input.includePool,
      poolSizeId: input.poolSizeId,
      poolCustomArea: input.poolCustomArea,
      poolDepth: input.poolDepth,
      poolQualityId: input.poolQualityId,
      poolTypeId: input.poolTypeId,
      siteConditionId: input.siteConditionId
    })


  // -----------------------------------------
  // Landscaping
  // -----------------------------------------

  const landscapingCosts =
    calculateLandscapingCosts({
      landscapingArea: input.landscapingArea,
      siteConditionId: input.siteConditionId
    })


  // -----------------------------------------
  // Total project cost
  // -----------------------------------------

  const totalCost =
      categoryCosts.kg300Total
    + categoryCosts.kg400Total
    + siteCosts.kg200Total
    + basementCosts.basementStructureCost
    + hvacCosts.hvacExtrasCost
    + poolCosts.poolCost
    + landscapingCosts.landscapingCost
    + permitCosts.permitFee


  // -----------------------------------------
  // Return result
  // -----------------------------------------

  return {

    totalCost,

    rawBuildingCost: buildingCost.rawBuildingCost,
    permitFee: permitCosts.permitFee,
    landscapingCost: landscapingCosts.landscapingCost,
    poolCost: poolCosts.poolCost,
    hvacExtrasCost: hvacCosts.hvacExtrasCost,
    siteCost: siteCosts.kg200Total

  }

}
