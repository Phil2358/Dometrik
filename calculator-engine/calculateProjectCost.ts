import { calculateEffectiveArea } from "./modules/effectiveArea"
import { calculateRawBuildingCost } from "./modules/rawBuildingCost"
import { calculateBasementBaseCosts } from "./modules/basementBaseCosts"
import {
  calculateCategoryCosts,
  calculateLevel1BenchmarkAllocation,
} from "./modules/categoryCosts"
import { calculateKg200Costs, calculateSiteExcavationBaseCost } from "./modules/kg200Costs"
import { calculateKg400Costs } from "./modules/kg400Costs"
import { calculatePoolCosts } from "./modules/poolCosts"
import { calculateLandscapingCosts } from "./modules/landscapingCosts"
import { calculatePermitCosts } from "./modules/permitCosts"
import { calculateKg600Costs } from "./modules/kg600Costs"
import { calculateContractorMarginCosts } from "./modules/contractorMarginCosts"
import { calculateContingencyCosts } from "./modules/contingencyCosts"
import { calculateEfkaCosts } from "./modules/efkaCosts"
import { calculateVatCosts } from "./modules/vatCosts"
import { calculateKg100Costs } from "./modules/kg100Costs"
import { calculateDetailedKg300SubgroupCosts } from "./modules/kg300SubgroupCosts"
import { calculateKg300Modifiers } from "./modules/kg300Modifiers"
import { calculateBasementKg300Modifiers } from "./modules/basementKg300Modifiers"
import { buildProjectCostBreakdown, type ProjectBreakdownGroup } from "./buildProjectCostBreakdown"
import {
  type AutomationPackageLevel,
  type CompatibleQualityId,
  type DataSecurityPackageLevel,
  type Kg400PackageSelection,
  normalizeQualityId,
  getResidentialProgramBaseline,
  SITE_ACCESSIBILITY_OPTIONS,
} from "../constants/construction"

export interface ProjectCalculationInput {

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
  qualityId: CompatibleQualityId | string
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
  landAcquisitionCostsMode?: "auto" | "manual"
  hvacSelections: Record<string, boolean>
}

export interface ProjectCostResult {
  totalCost: number
  coreProjectTotal: number
  group100Total: number
  dinSubtotal: number
  nonDinAdditionsSubtotal: number
  preVatTotal: number
  vat: number
  vatAmount: number
  finalTotal: number
  totalCostInclVat: number
  vatPercent: number
  constructionSubtotal: number
  contractorMargin: number
  contractorCost: number
  contingency: number
  contingencyCost: number
  contingencyRecommendedPercent: number
  appliedContingencyPercent: number
  recommendedContingencyCost: number
  contingencyManualOverrideActive: boolean
  efka: number
  efkaCost: number
  efkaInsuranceAmount: number
  efkaInsuranceAutoCost: number
  efkaInsuranceManualOverrideActive: boolean
  kg100Total: number
  kg200Total: number
  kg300Total: number
  kg400Total: number
  kg500Total: number
  kg600Cost: number
  coveredTerracesBaseCost: number
  balconyAreaBaseCost: number
  rawBuildingCost: number
  basementBenchmarkRate: number
  basementBaseCost: number
  basementBucket300: number
  basementBucket400: number
  basementKg300Total: number
  basementKg300ModifierCost: number
  basementKg300BaseSubgroupCosts: ReturnType<typeof calculateBasementBaseCosts>["basementKg300SubgroupCosts"]
  basementKg300SubgroupCosts: ReturnType<typeof calculateBasementKg300Modifiers>["kg300SubgroupCosts"]
  basementKg300ModifierDetails: ReturnType<typeof calculateBasementKg300Modifiers>["modifierDetails"]
  storageTechnicalBasementCost: number
  parkingBasementCost: number
  habitableBasementCost: number
  basementCostItems: ReturnType<typeof calculateBasementBaseCosts>["breakdownItems"]
  kg300SubgroupCosts: ReturnType<typeof calculateKg300Modifiers>["kg300SubgroupCosts"]
  kg300ModifierDetails: ReturnType<typeof calculateKg300Modifiers>["modifierDetails"]
  kg600SubgroupCosts: ReturnType<typeof calculateKg600Costs>["kg600SubgroupCosts"]
  permitFee: number
  landscapingCost: number
  poolCost: number
  hvacExtrasCost: number
  siteCost: number
  utilityConnectionCost: number
  utilityGroup220Cost: number
  utilityGroup230Cost: number
  siteExcavationCost: number
  kg100SubgroupCosts: ReturnType<typeof calculateKg100Costs>["subgroupCosts"]
  breakdownGroups: ProjectBreakdownGroup[]
}

export function calculateProjectCost(input: ProjectCalculationInput): ProjectCostResult {
  const totalBasementArea =
    (input.storageBasementArea ?? 0) +
    (input.parkingBasementArea ?? 0) +
    (input.habitableBasementArea ?? 0)

  const resolvedBasementArea =
    totalBasementArea > 0
      ? totalBasementArea
      : (input.basementArea ?? 0)
  const qualityId = normalizeQualityId(input.qualityId)

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

  // -----------------------------------------
  // Raw building cost
  // -----------------------------------------

  const buildingCost =
    calculateRawBuildingCost({
      livingArea: input.mainArea,
      effectiveArea,
      locationId: input.locationId,
      qualityId,
      customCostPerSqm: input.customCostPerSqm
    })
  const coveredTerracesBaseCost = Math.round(
    input.terraceArea * buildingCost.correctedCostPerSqm * 0.50
  )
  const balconyAreaBaseCost = Math.round(
    input.balconyArea * buildingCost.correctedCostPerSqm * 0.30
  )
  const areaAddOnCosts = coveredTerracesBaseCost + balconyAreaBaseCost
  const basementBaseCosts =
    calculateBasementBaseCosts({
      correctedBenchmarkRate: buildingCost.correctedCostPerSqm,
      qualityId,
      basementArea: input.basementArea,
      basementTypeId: input.basementTypeId,
      storageBasementArea: input.storageBasementArea,
      parkingBasementArea: input.parkingBasementArea,
      habitableBasementArea: input.habitableBasementArea,
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
  const siteAccessibilityFactor = siteAccessibility.siteAccessibilityFactor
  const basementKg300ModifierResult =
    calculateBasementKg300Modifiers({
      kg300SubgroupCosts: basementBaseCosts.basementKg300SubgroupCosts,
      siteConditionId: input.siteConditionId,
      groundwaterConditionId: input.groundwaterConditionId,
      siteAccessibilityFactor,
    })
  const basementKg300Total = basementKg300ModifierResult.kg300Total
  const basementKg300ModifierCost =
    basementKg300Total - basementBaseCosts.basementBucket300
  const basementBaseCost =
    basementBaseCosts.basementBucket400 + basementKg300Total

  // -----------------------------------------
  // Permit costs
  // -----------------------------------------

  const permitCosts =
    calculatePermitCosts({
      effectiveArea,
      qualityId
    })

  const kg600Costs =
    calculateKg600Costs({
      effectiveArea,
      qualityId,
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

  const kg200Costs =
    calculateKg200Costs({
      effectiveArea,
      landscapingArea: input.landscapingArea,
      siteConditionId: input.siteConditionId,
      accessibilityId: resolvedAccessibilityId,
      utilityConnectionId: input.utilityConnectionId,
      customUtilityCost: input.customUtilityCost
    })
  const level1BenchmarkAllocation =
    calculateLevel1BenchmarkAllocation({
      benchmarkTotal: buildingCost.baseConstructionCost,
      siteExcavationBaseCost: kg200Costs.siteExcavationBaseCost,
      wardrobePackageCost: kg600Costs.wardrobePackageCost,
      qualityId,
    })


  // -----------------------------------------
  // Category costs (DIN276 groups)
  // -----------------------------------------

  const kg400Costs =
    calculateKg400Costs({
      benchmarkBucket400: level1BenchmarkAllocation.benchmarkBucket400,
      mainArea: input.mainArea,
      qualityId,
      siteAccessibilityFactor,
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
  const kg300BenchmarkArea = input.mainArea
  const kg300BenchmarkConstructionCost =
    Math.round(kg300BenchmarkArea * buildingCost.correctedCostPerSqm)
  const kg300BenchmarkSiteExcavationBaseCost =
    calculateSiteExcavationBaseCost({
      effectiveArea: kg300BenchmarkArea,
      landscapingArea: input.landscapingArea,
    })
  const kg300Level1Allocation =
    calculateLevel1BenchmarkAllocation({
      benchmarkTotal: kg300BenchmarkConstructionCost,
      siteExcavationBaseCost: kg300BenchmarkSiteExcavationBaseCost,
      wardrobePackageCost: kg600Costs.wardrobePackageCost,
      qualityId,
    })
  const categoryCosts =
    calculateCategoryCosts({
      benchmarkBucket300: kg300Level1Allocation.benchmarkBucket300
    })
  const kg300AllocationResult =
    calculateDetailedKg300SubgroupCosts({
      kg300Cost: categoryCosts.kg300Total,
      qualityId,
    })
  const kg300ModifierResult =
    calculateKg300Modifiers({
      kg300SubgroupCosts: kg300AllocationResult.kg300SubgroupCosts,
      siteConditionId: input.siteConditionId,
      groundwaterConditionId: input.groundwaterConditionId,
      siteAccessibilityFactor,
    })
  const kg300Total = kg300ModifierResult.kg300Total
  const kg300SubgroupCosts = kg300ModifierResult.kg300SubgroupCosts


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

  const kg100Costs =
    calculateKg100Costs({
      landValue: input.landValue,
      landAcquisitionCosts: input.landAcquisitionCosts,
      landAcquisitionCostsMode: input.landAcquisitionCostsMode,
    })

  const kg500Total =
    poolCosts.poolCost + landscapingCosts.landscapingCost

  const constructionSubtotal =
    kg300Total + kg400Costs.kg400Total + kg600Costs.kg600Cost

  const contingencyCosts =
    calculateContingencyCosts({
      constructionSubtotal,
      qualityId,
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
      kg200Costs.kg200Total
    + constructionSubtotal
    + areaAddOnCosts
    + basementBaseCost
    + kg500Total
    + permitCosts.permitFee
    + contingencyCosts.contingencyCost
    + contractorMarginCosts.contractorCost

  const group100Total = kg100Costs.kg100Total

  const dinSubtotal =
      group100Total
    + kg200Costs.kg200Total
    + constructionSubtotal
    + kg500Total
    + permitCosts.permitFee

  const nonDinAdditionsSubtotal =
      areaAddOnCosts
    + basementBaseCost
    + contractorMarginCosts.contractorCost
    + contingencyCosts.contingencyCost
    + efkaCosts.appliedCost

  const preVatTotal =
    dinSubtotal + nonDinAdditionsSubtotal

  const vatCosts =
    calculateVatCosts({
      baseAmount: preVatTotal,
      vatPercent: input.vatPercent ?? 24,
    })

  const breakdownGroups =
    buildProjectCostBreakdown({
      investmentTotal: preVatTotal,
      landValue: kg100Costs.landValue,
      landAcquisitionCosts: kg100Costs.incidentalLandAcquisitionCosts,
      landAcquisitionCostsMode: kg100Costs.landAcquisitionCostsMode,
      kg200Total: kg200Costs.kg200Total,
      siteExcavationCost: kg200Costs.siteExcavationCost,
      utilityGroup220Cost: kg200Costs.group220Cost,
      utilityGroup230Cost: kg200Costs.group230Cost,
      kg300Total,
      kg300SubgroupCosts,
      kg400Total: kg400Costs.kg400Total,
      kg400CategoryCostsById: kg400Costs.categoryCostsById,
      kg500Total,
      landscapingCost: landscapingCosts.landscapingCost,
      landscapingArea: input.landscapingArea,
      poolCost: poolCosts.poolCost,
      includePool: input.includePool,
      poolArea: poolCosts.poolArea,
      poolQualityId: input.poolQualityId,
      poolTypeId: input.poolTypeId,
      hvacSelections: input.hvacSelections,
      siteConditionId: input.siteConditionId,
      kg600Cost: kg600Costs.kg600Cost,
      kg600SubgroupCosts: kg600Costs.kg600SubgroupCosts,
      bathroomWcFurnishingSliceCost: kg600Costs.bathroomWcFurnishingSliceCost,
      permitDesignFee: permitCosts.permitFee,
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
    kg100Total: kg100Costs.kg100Total,
    kg200Total: kg200Costs.kg200Total,
    kg300Total,
    kg400Total: kg400Costs.kg400Total,
    kg500Total,
    kg600Cost: kg600Costs.kg600Cost,
    coveredTerracesBaseCost,
    balconyAreaBaseCost,

    rawBuildingCost: buildingCost.rawBuildingCost,
    basementBenchmarkRate: basementBaseCosts.basementBenchmarkRate,
    basementBaseCost,
    basementBucket300: basementBaseCosts.basementBucket300,
    basementBucket400: basementBaseCosts.basementBucket400,
    basementKg300Total,
    basementKg300ModifierCost,
    basementKg300BaseSubgroupCosts: basementBaseCosts.basementKg300SubgroupCosts,
    basementKg300SubgroupCosts: basementKg300ModifierResult.kg300SubgroupCosts,
    basementKg300ModifierDetails: basementKg300ModifierResult.modifierDetails,
    storageTechnicalBasementCost: basementBaseCosts.storageTechnicalBasementCost,
    parkingBasementCost: basementBaseCosts.parkingBasementCost,
    habitableBasementCost: basementBaseCosts.habitableBasementCost,
    basementCostItems: basementBaseCosts.breakdownItems,
    kg300SubgroupCosts,
    kg300ModifierDetails: kg300ModifierResult.modifierDetails,
    kg600SubgroupCosts: kg600Costs.kg600SubgroupCosts,
    kg100SubgroupCosts: kg100Costs.subgroupCosts,
    permitFee: permitCosts.permitFee,
    landscapingCost: landscapingCosts.landscapingCost,
    poolCost: poolCosts.poolCost,
    hvacExtrasCost: kg400Costs.hvacExtrasCost,
    siteCost: kg200Costs.kg200Total,
    utilityConnectionCost: kg200Costs.utilityConnectionCost,
    utilityGroup220Cost: kg200Costs.group220Cost,
    utilityGroup230Cost: kg200Costs.group230Cost,
    siteExcavationCost: kg200Costs.siteExcavationCost,
    breakdownGroups,

  }

}
