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
import { calculateKg600Costs } from "./modules/kg600Costs"
import { calculateContractorMarginCosts } from "./modules/contractorMarginCosts"
import { calculateContingencyCosts } from "./modules/contingencyCosts"
import { calculateEfkaCosts } from "./modules/efkaCosts"
import { calculateVatCosts } from "./modules/vatCosts"
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
  accessibilityId?: string
  siteAccessibilityId?: string

  utilityConnectionId: string
  customUtilityCost?: number | null

  landscapingArea: number

  includePool: boolean
  poolSizeId: string
  poolCustomArea?: number | null
  poolDepth?: number | null
  poolCustomDepth?: number | null
  poolQualityId: string
  poolTypeId: string

  bedroomCount?: number
  bathrooms?: number
  wcs?: number
  kitchenCount?: number
  customKitchenUnitCost?: number | null
  generalFurnitureBaseAmount?: number | null
  dataSecurityPackageLevel?: DataSecurityPackageLevel
  dataSecurityPackageSelection?: Kg400PackageSelection
  dataSecurityManualQuote?: number | null
  automationPackageLevel?: AutomationPackageLevel
  automationPackageSelection?: Kg400PackageSelection
  automationManualQuote?: number | null
  contractorPercent?: number
  vatPercent?: number
  efkaInsuranceManualCost?: number | null
  manualContingencyPercent?: number | null
  manualContingencyCost?: number | null
  landValue?: number
  landAcquisitionCosts?: number
  group100Total?: number
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
  const bathroomDelta = bathrooms - residentialProgramBaseline.bathrooms
  const wcDelta = wcs - residentialProgramBaseline.wcs
  const resolvedAccessibilityId =
    input.siteAccessibilityId ??
    input.accessibilityId ??
    "normal"
  const siteAccessibility =
    SITE_ACCESSIBILITY_OPTIONS.find((option) => option.id === resolvedAccessibilityId)
    ?? SITE_ACCESSIBILITY_OPTIONS[0]
  const kg400Costs =
    calculateKg400Costs({
      mainArea: input.mainArea,
      finalCostPerSqm: buildingCost.correctedCostPerSqm,
      qualityId: input.qualityId,
      siteAccessibilityFactor: siteAccessibility.sitePreparationFactor,
      bedroomDelta: bedroomCount - residentialProgramBaseline.bedrooms,
      bathroomDelta,
      wcDelta,
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

  const kg600Costs =
    calculateKg600Costs({
      effectiveArea,
      qualityId: input.qualityId,
      bedroomCount,
      kitchenCount: input.kitchenCount ?? 0,
      customKitchenUnitCost: input.customKitchenUnitCost,
      generalFurnitureBaseAmount: input.generalFurnitureBaseAmount,
      bathroomDelta,
      wcDelta,
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
      accessibilityId: resolvedAccessibilityId,
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
      poolDepth: input.poolCustomDepth ?? input.poolDepth,
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

  const kg500Total =
    poolCosts.poolCost + landscapingCosts.landscapingCost

  const constructionSubtotal =
    categoryCosts.kg300Total + kg400Costs.kg400Total + kg600Costs.kg600Cost

  const contingencyCosts =
    calculateContingencyCosts({
      constructionSubtotal,
      qualityId: input.qualityId,
      manualContingencyPercent: input.manualContingencyPercent,
      manualContingencyCost: input.manualContingencyCost,
    })

  const contractorMarginCosts =
    calculateContractorMarginCosts({
      constructionSubtotal,
      contractorPercent: input.contractorPercent ?? 0,
    })

  const efkaCosts =
    calculateEfkaCosts({
      effectiveArea,
      manualCost: input.efkaInsuranceManualCost,
    })

  const coreProjectTotal =
      siteCosts.kg200Total
    + constructionSubtotal
    + kg500Total
    + permitCosts.permitFee
    + contingencyCosts.contingencyCost
    + contractorMarginCosts.contractorCost

  const group100Total =
    input.group100Total ??
    ((input.landValue ?? 0) + (input.landAcquisitionCosts ?? 0))

  const dinSubtotal =
      group100Total
    + siteCosts.kg200Total
    + constructionSubtotal
    + kg500Total
    + permitCosts.permitFee

  const nonDinAdditionsSubtotal =
      contractorMarginCosts.contractorCost
    + contingencyCosts.contingencyCost
    + efkaCosts.appliedCost

  const preVatTotal =
    dinSubtotal + nonDinAdditionsSubtotal

  const vatCosts =
    calculateVatCosts({
      baseAmount: preVatTotal,
      vatPercent: input.vatPercent ?? 24,
    })


  // -----------------------------------------
  // Return result
  // -----------------------------------------

  return {

    totalCost: preVatTotal,
    coreProjectTotal,
    group100Total,
    dinSubtotal,
    nonDinAdditionsSubtotal,
    preVatTotal,
    vat: vatCosts.vatAmount,
    vatAmount: vatCosts.vatAmount,
    finalTotal: vatCosts.totalIncludingVat,
    totalCostInclVat: vatCosts.totalIncludingVat,
    vatPercent: vatCosts.vatPercent,
    constructionSubtotal,
    contractorMargin: contractorMarginCosts.contractorCost,
    contractorCost: contractorMarginCosts.contractorCost,
    contingency: contingencyCosts.contingencyCost,
    contingencyCost: contingencyCosts.contingencyCost,
    contingencyRecommendedPercent: contingencyCosts.recommendedPercent,
    appliedContingencyPercent: contingencyCosts.appliedPercentValue,
    recommendedContingencyCost: contingencyCosts.recommendedCost,
    contingencyManualOverrideActive: contingencyCosts.manualOverrideActive,
    efka: efkaCosts.appliedCost,
    efkaCost: efkaCosts.appliedCost,
    efkaInsuranceAmount: efkaCosts.appliedCost,
    efkaInsuranceAutoCost: efkaCosts.automaticCost,
    efkaInsuranceManualOverrideActive: efkaCosts.manualOverrideActive,
    kg200Total: siteCosts.kg200Total,
    kg300Total: categoryCosts.kg300Total,
    kg400Total: kg400Costs.kg400Total,
    kg500Total,
    kg600Cost: kg600Costs.kg600Cost,

    rawBuildingCost: buildingCost.rawBuildingCost,
    kg300SubgroupCosts,
    kg600SubgroupCosts: kg600Costs.kg600SubgroupCosts,
    permitFee: permitCosts.permitFee,
    landscapingCost: landscapingCosts.landscapingCost,
    poolCost: poolCosts.poolCost,
    hvacExtrasCost: kg400Costs.hvacExtrasCost,
    siteCost: siteCosts.kg200Total

  }

}
