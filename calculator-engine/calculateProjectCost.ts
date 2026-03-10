import { calculateEffectiveArea } from "./modules/effectiveArea"
import { calculateRawBuildingCost } from "./modules/rawBuildingCost"
import { calculateCategoryCosts } from "./modules/categoryCosts"
import { calculateSiteCosts } from "./modules/siteCosts"
import { calculateBasementCosts } from "./modules/basementCosts"
import { calculateHvacExtras } from "./modules/hvacExtras"
import { calculatePoolCosts } from "./modules/poolCosts"
import { calculateLandscapingCosts } from "./modules/landscapingCosts"

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

  const effectiveArea =
    calculateEffectiveArea({
      mainArea: input.mainArea,
      terraceArea: input.terraceArea,
      balconyArea: input.balconyArea,
      basementArea: input.basementArea,
      basementTypeId: input.basementTypeId
    })

  const buildingCost =
    calculateRawBuildingCost({
      livingArea: input.mainArea,
      effectiveArea,
      locationId: input.locationId,
      qualityId: input.qualityId,
      customCostPerSqm: input.customCostPerSqm
    })

  const categories =
    calculateCategoryCosts({
      rawBuildingCost: buildingCost.rawBuildingCost
    })

  const siteCosts =
    calculateSiteCosts({
      mainArea: input.mainArea,
      basementArea: input.basementArea,
      siteConditionId: input.siteConditionId,
      groundwaterConditionId: input.groundwaterConditionId,
      accessibilityId: input.accessibilityId,
      utilityConnectionId: input.utilityConnectionId,
      customUtilityCost: input.customUtilityCost
    })

  const basementCosts =
    calculateBasementCosts({
      basementArea: input.basementArea,
      basementTypeId: input.basementTypeId,
      groundwaterConditionId: input.groundwaterConditionId,
      siteConditionIsRocky: input.siteConditionId.includes("rocky")
    })

  const hvacExtras =
    calculateHvacExtras({
      effectiveArea,
      hvacSelections: input.hvacSelections
    })

  const pool =
    calculatePoolCosts({
      includePool: input.includePool,
      poolSizeId: input.poolSizeId,
      poolCustomArea: input.poolCustomArea,
      poolDepth: input.poolDepth,
      poolQualityId: input.poolQualityId,
      poolTypeId: input.poolTypeId,
      siteConditionId: input.siteConditionId
    })

  const landscaping =
    calculateLandscapingCosts({
      landscapingArea: input.landscapingArea,
      siteConditionId: input.siteConditionId
    })

  const totalCost =
    buildingCost.rawBuildingCost +
    siteCosts.kg200Total +
    basementCosts.basementStructureCost +
    hvacExtras.hvacExtrasCost +
    pool.poolCost +
    landscaping.landscapingCost

  return {
    effectiveArea,
    buildingCost,
    categories,
    siteCosts,
    basementCosts,
    hvacExtras,
    pool,
    landscaping,
    totalCost
  }
}