import { calculateEffectiveArea } from "./modules/effectiveArea"
import { calculateRawBuildingCost } from "./modules/rawBuildingCost"
import {
  calculateCategoryCosts,
  calculateKg300SubgroupCosts,
  calculateWeightedBasementArea,
  getAdjustedKg300Share
} from "./modules/categoryCosts"
import { calculateSiteCosts } from "./modules/siteCosts"
import { calculateBasementCosts } from "./modules/basementCosts"
import { calculateKg400Costs } from "./modules/kg400Costs"
import { calculatePoolCosts } from "./modules/poolCosts"
import { calculateLandscapingCosts } from "./modules/landscapingCosts"
import { calculatePermitCosts } from "./modules/permitCosts"
import {
  type AutomationPackageLevel,
  type DataSecurityPackageLevel,
  type Kg400PackageSelection,
  getResidentialProgramBaseline,
  SITE_ACCESSIBILITY_OPTIONS,
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

  bedroomCount?: number
  bathrooms?: number
  wcs?: number
  dataSecurityPackageLevel?: DataSecurityPackageLevel
  dataSecurityPackageSelection?: Kg400PackageSelection
  dataSecurityManualQuote?: number | null
  automationPackageLevel?: AutomationPackageLevel
  automationPackageSelection?: Kg400PackageSelection
  automationManualQuote?: number | null
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

  const residentialProgramBaseline =
    getResidentialProgramBaseline(input.mainArea)
  const bedroomCount = input.bedroomCount ?? residentialProgramBaseline.bedrooms
  const bathrooms = input.bathrooms ?? residentialProgramBaseline.bathrooms
  const wcs = input.wcs ?? residentialProgramBaseline.wcs
  const siteAccessibility =
    SITE_ACCESSIBILITY_OPTIONS.find((option) => option.id === input.accessibilityId)
    ?? SITE_ACCESSIBILITY_OPTIONS[0]
  const kg400Costs =
    calculateKg400Costs({
      mainArea: input.mainArea,
      finalCostPerSqm: buildingCost.correctedCostPerSqm,
      qualityId: input.qualityId,
      siteAccessibilityFactor: siteAccessibility.sitePreparationFactor,
      bedroomDelta: bedroomCount - residentialProgramBaseline.bedrooms,
      bathroomDelta: bathrooms - residentialProgramBaseline.bathrooms,
      wcDelta: wcs - residentialProgramBaseline.wcs,
      dataSecurityPackageLevel: input.dataSecurityPackageLevel,
      dataSecurityPackageSelection: input.dataSecurityPackageSelection,
      dataSecurityManualQuote: input.dataSecurityManualQuote,
      automationPackageLevel: input.automationPackageLevel,
      automationPackageSelection: input.automationPackageSelection,
      automationManualQuote: input.automationManualQuote,
      habitableBasementArea: input.habitableBasementArea,
      hvacSelections: input.hvacSelections,
    })


  // -----------------------------------------
  // Category costs (DIN276 groups)
  // -----------------------------------------

  const categoryCosts =
    calculateCategoryCosts({
      kg300Base: Math.round(buildingCost.baseConstructionCost * getAdjustedKg300Share(weightedBasementRatio))
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
    + kg400Costs.kg400Total
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
    hvacExtrasCost: kg400Costs.hvacExtrasCost,
    siteCost: siteCosts.kg200Total

  }

}
