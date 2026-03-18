import { calculateEffectiveArea } from "./modules/effectiveArea"
import { calculateRawBuildingCost } from "./modules/rawBuildingCost"
import {
  calculateCategoryCosts,
  calculateKg300SubgroupCosts,
  calculateWeightedBasementArea,
  getAdjustedKg300Share,
  getAdjustedKg400Share
} from "./modules/categoryCosts"
import { calculateSiteCosts } from "./modules/siteCosts"
import { calculateBasementCosts } from "./modules/basementCosts"
import { calculateHvacExtras } from "./modules/hvacExtras"
import { calculatePoolCosts } from "./modules/poolCosts"
import { calculateLandscapingCosts } from "./modules/landscapingCosts"
import { calculatePermitCosts } from "./modules/permitCosts"
import {
  KG400_AUTOMATION_PACKAGE_COSTS,
  KG400_DATA_SECURITY_BASELINE_ALLOWANCE
} from "../constants/construction"

interface ProjectCalculationInput {

  plotSize: number
  mainArea: number
  terraceArea: number
  balconyArea: number
  basementArea?: number
  basementTypeId?: string
  storageBasementArea?: number
  parkingBasementArea?: number
  habitableBasementArea?: number

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
  const totalBasementArea =
    (input.storageBasementArea ?? 0) +
    (input.parkingBasementArea ?? 0) +
    (input.habitableBasementArea ?? 0)

  const resolvedBasementArea =
    totalBasementArea > 0
      ? totalBasementArea
      : (input.basementArea ?? 0)

  // -----------------------------------------
  // Effective area
  // -----------------------------------------

  const effectiveArea =
    calculateEffectiveArea({
      mainArea: input.mainArea,
      terraceArea: input.terraceArea,
      balconyArea: input.balconyArea,
      basementArea: input.basementArea,
      basementTypeId: input.basementTypeId,
      storageBasementArea: input.storageBasementArea,
      parkingBasementArea: input.parkingBasementArea,
      habitableBasementArea: input.habitableBasementArea
    })

  const weightedBasementArea =
    calculateWeightedBasementArea({
      storageBasementArea: input.storageBasementArea,
      parkingBasementArea: input.parkingBasementArea,
      habitableBasementArea: input.habitableBasementArea
    })

  const weightedBasementRatio =
    weightedBasementArea / Math.max(input.mainArea, 1)


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

  const hvacCosts =
    calculateHvacExtras({
      effectiveArea,
      mainArea: input.mainArea,
      habitableBasementArea: input.habitableBasementArea,
      qualityId: input.qualityId,
      hvacSelections: input.hvacSelections
    })

  // 450 keeps only a minimal weak-current baseline unless future explicit extras are selected.
  const dataSecurityOptionalExtrasCost = 0
  // 480 is automation only via explicit optional packages; default is no package selected.
  const automationPackageId: keyof typeof KG400_AUTOMATION_PACKAGE_COSTS = "none"
  const automationPackageCost =
    KG400_AUTOMATION_PACKAGE_COSTS[automationPackageId]


  // -----------------------------------------
  // Category costs (DIN276 groups)
  // -----------------------------------------

  const categoryCosts =
    calculateCategoryCosts({
      kg300Base: Math.round(buildingCost.baseConstructionCost * getAdjustedKg300Share(weightedBasementRatio)),
      kg400Base: Math.round(buildingCost.baseConstructionCost * getAdjustedKg400Share(weightedBasementRatio)),
      kg400BaseByCategory: {
        plumbing: Math.round(
          input.mainArea
          * buildingCost.correctedCostPerSqm
          * getAdjustedKg400Share(weightedBasementRatio)
        )
      },
      kg400FixedCostByCategory: {
        data_security: KG400_DATA_SECURITY_BASELINE_ALLOWANCE + dataSecurityOptionalExtrasCost,
        automation: automationPackageCost
      },
      kg400AdjustmentsByCategory: hvacCosts.adjustmentsByCategory
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
      plotSize: input.plotSize,
      mainArea: input.mainArea,
      basementArea: resolvedBasementArea,
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
      storageBasementArea: input.storageBasementArea,
      parkingBasementArea: input.parkingBasementArea,
      habitableBasementArea: input.habitableBasementArea,
      groundwaterConditionId: input.groundwaterConditionId,
      siteConditionIsRocky: input.siteConditionId === "rock"
    })

  const kg300Total =
    categoryCosts.kg300Total

  const kg300SubgroupCosts =
    calculateKg300SubgroupCosts({
      kg300Total,
      effectiveArea,
      storageBasementArea: input.storageBasementArea,
      parkingBasementArea: input.parkingBasementArea,
      habitableBasementArea: input.habitableBasementArea,
      qualityId: input.qualityId,
      selectedFinalCostPerSqm: buildingCost.correctedCostPerSqm
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
    + poolCosts.poolCost
    + landscapingCosts.landscapingCost
    + permitCosts.permitFee


  // -----------------------------------------
  // Return result
  // -----------------------------------------

  return {

    totalCost,

    rawBuildingCost: buildingCost.rawBuildingCost,
    kg300SubgroupCosts,
    permitFee: permitCosts.permitFee,
    landscapingCost: landscapingCosts.landscapingCost,
    poolCost: poolCosts.poolCost,
    hvacExtrasCost: hvacCosts.hvacExtrasCost,
    siteCost: siteCosts.kg200Total

  }

}
