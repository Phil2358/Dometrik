import { calculateBuildingArea } from "./modules/buildingArea"
import { calculateRawBuildingCost } from "./modules/rawBuildingCost"
import { calculateBasementBaseCosts } from "./modules/basementBaseCosts"
import {
  calculateCategoryCosts,
  calculateLevel1BenchmarkAllocation,
} from "./modules/categoryCosts"
import { calculateKg200Costs } from "./modules/kg200Costs"
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
import { calculateKg500Subgroups } from "./modules/kg500Subgroups"
import { calculateKg700Subgroups } from "./modules/kg700Subgroups"
import { calculateRoomCountAddons } from "./modules/roomCountAddons"
import { buildProjectCostBreakdown, type ProjectBreakdownGroup } from "./buildProjectCostBreakdown"
import {
  type AutomationPackageLevel,
  type CompatibleQualityId,
  type DataSecurityPackageLevel,
  type Kg400PackageSelection,
  normalizeQualityId,
  getResidentialProgramBaseline,
  SITE_ACCESSIBILITY_OPTIONS,
  QUALITY_LEVELS,
  type QualityId,
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
  benchmarkOverridePerSqm?: number | null

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
  generalFurniture?: number | null
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
  estimatedRangeLow: number
  estimatedRangeHigh: number
  constructionSubtotal: number
  buildingArea: number
  baseCostPerSqm: number
  locationAdjustedBaseCostPerSqm: number
  sizeCorrectionFactor: number
  sizeAdjustedCostPerSqm: number
  correctedCostPerSqm: number
  benchmarkEffectiveArea: number
  benchmarkPreviewPerQuality: Record<QualityId, number>
  residentialProgramBaseline: ReturnType<typeof getResidentialProgramBaseline>
  recommendedBedrooms: number
  recommendedBathrooms: number
  recommendedWcs: number
  recommendedKitchens: number
  bedroomCount: number
  bathrooms: number
  wcs: number
  kitchenCount: number
  bedroomDelta: number
  bathroomDelta: number
  wcDelta: number
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
  kg700Total: number
  kg600Cost: number
  baseBuildingAreaBenchmarkContribution: number
  coveredTerracesBenchmarkContribution: number
  balconyAreaBenchmarkContribution: number
  totalBenchmarkContributionBeforeGroupAllocation: number
  rawBuildingCost: number
  basementBenchmarkRate: number
  basementBaseCost: number
  basementBucket300: number
  basementBucket400: number
  basementKg300Total: number
  basementKg300ModifierCost: number
  basementKg300CategoryCostsById: ReturnType<typeof calculateBasementBaseCosts>["basementKg300CategoryCostsById"]
  basementKg400CategoryCostsById: ReturnType<typeof calculateBasementBaseCosts>["basementKg400CategoryCostsById"]
  basementKg300BaseSubgroupCosts: ReturnType<typeof calculateBasementBaseCosts>["basementKg300SubgroupCosts"]
  basementKg300SubgroupCosts: ReturnType<typeof calculateBasementKg300Modifiers>["kg300SubgroupCosts"]
  basementKg300ModifierDetails: ReturnType<typeof calculateBasementKg300Modifiers>["modifierDetails"]
  storageTechnicalBasementCost: number
  parkingBasementCost: number
  habitableBasementCost: number
  basementCostItems: ReturnType<typeof calculateBasementBaseCosts>["breakdownItems"]
  bathroomRoomCountAddons: ReturnType<typeof calculateRoomCountAddons>["bathroomRoomCountAddons"]
  wcRoomCountAddons: ReturnType<typeof calculateRoomCountAddons>["wcRoomCountAddons"]
  kg340BathroomDelta: number
  kg350BathroomDelta: number
  kg400BathroomDelta: number
  kg340WcDelta: number
  kg350WcDelta: number
  kg400WcDelta: number
  kg300RoomCountAddons: ReturnType<typeof calculateRoomCountAddons>["kg300SubgroupAddons"]
  kg400CategoryRoomCountAddonsById: ReturnType<typeof calculateRoomCountAddons>["kg400CategoryAddonsById"]
  kg300SubgroupCosts: ReturnType<typeof calculateKg300Modifiers>["kg300SubgroupCosts"]
  kg300ModifierDetails: ReturnType<typeof calculateKg300Modifiers>["modifierDetails"]
  kg400CategoryCostsById: Record<string, number>
  kg600SubgroupCosts: ReturnType<typeof calculateKg600Costs>["kg600SubgroupCosts"]
  kg500Subgroups: ReturnType<typeof calculateKg500Subgroups>["kg500Subgroups"]
  kg700Subgroups: ReturnType<typeof calculateKg700Subgroups>["kg700Subgroups"]
  suggestedKitchenUnitCost: number
  suggestedGeneralFurniture: number
  bedroomPackageCost: number
  areaBased610Cost: number
  kitchenFurnitureCost: number
  kg610AutoTotal: number
  kg610Total: number
  kitchenUnitCost: number
  kitchenPackageCost: number
  wardrobePackageCost: number
  bathroomWcFurnishingSliceCost: number
  includedWardrobes: number
  totalWardrobeCount: number
  baselineWardrobeCount: number
  wardrobeDelta: number
  kg620BaselineWardrobeCost: number
  kg620WardrobeDeltaCost: number
  kg620WardrobeTotal: number
  fixedBenchmarkIncluded210: number
  fixedBenchmarkIncluded620BaselineWardrobes: number
  benchmarkRemainderAfterFixed210And620: number
  kg450BaselineEssentialRate: number
  kg450BaselineEssentialCost: number
  kg450UpgradeCost: number
  benchmarkRemainderAfterFixed210: number
  benchmarkRemainderAfterFixed210And620And450: number
  permitFee: number
  landscapingCost: number
  poolCost: number
  poolArea: number
  hvacOptionCosts: ReturnType<typeof calculateKg400Costs>["hvacOptionCosts"]
  hvacExtrasCost: number
  packageCosts: ReturnType<typeof calculateKg400Costs>["packageCosts"]
  siteCost: number
  utilityConnectionCost: number
  utilityGroup220Cost: number
  utilityGroup230Cost: number
  siteExcavationCost: number
  landAcquisitionAmount: number
  landAcquisitionRatePercent: number
  kg100SubgroupCosts: ReturnType<typeof calculateKg100Costs>["subgroupCosts"]
  breakdownGroups: ProjectBreakdownGroup[]
}

function addCostsById(
  left: Record<string, number>,
  right: Record<string, number>
): Record<string, number> {
  const categoryIds = new Set([...Object.keys(left), ...Object.keys(right)])

  return Array.from(categoryIds).reduce<Record<string, number>>((sum, categoryId) => {
    sum[categoryId] = (left[categoryId] ?? 0) + (right[categoryId] ?? 0)
    return sum
  }, {})
}

function addKg300SubgroupCosts(
  left: ProjectCostResult["kg300SubgroupCosts"],
  right: ProjectCostResult["kg300SubgroupCosts"]
): ProjectCostResult["kg300SubgroupCosts"] {
  return {
    subgroup310Cost: left.subgroup310Cost + right.subgroup310Cost,
    subgroup320Cost: left.subgroup320Cost + right.subgroup320Cost,
    subgroup330Cost: left.subgroup330Cost + right.subgroup330Cost,
    subgroup340Cost: left.subgroup340Cost + right.subgroup340Cost,
    subgroup350Cost: left.subgroup350Cost + right.subgroup350Cost,
    subgroup360Cost: left.subgroup360Cost + right.subgroup360Cost,
    subgroup370Cost: left.subgroup370Cost + right.subgroup370Cost,
    subgroup380Cost: left.subgroup380Cost + right.subgroup380Cost,
    subgroup390Cost: left.subgroup390Cost + right.subgroup390Cost,
  }
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
  // Building area
  // -----------------------------------------

  const buildingArea =
    calculateBuildingArea({
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
      buildingArea,
      locationId: input.locationId,
      qualityId,
      correctedBenchmarkOverridePerSqm: input.benchmarkOverridePerSqm
    })
  const benchmarkPreviewPerQuality =
    QUALITY_LEVELS.reduce<Record<QualityId, number>>((previews, entry) => {
      previews[entry.id] = calculateRawBuildingCost({
        buildingArea,
        locationId: input.locationId,
        qualityId: entry.id,
      }).correctedCostPerSqm

      return previews
    }, {} as Record<QualityId, number>)
  const baseBuildingAreaBenchmarkContribution = buildingCost.baseConstructionCost
  const coveredTerracesBenchmarkContribution = Math.round(
    input.terraceArea * buildingCost.correctedCostPerSqm * 0.50
  )
  const balconyAreaBenchmarkContribution = Math.round(
    input.balconyArea * buildingCost.correctedCostPerSqm * 0.30
  )
  const totalBenchmarkContributionBeforeGroupAllocation =
    baseBuildingAreaBenchmarkContribution +
    coveredTerracesBenchmarkContribution +
    balconyAreaBenchmarkContribution
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
  const benchmarkEffectiveArea =
    Math.max(0, buildingArea)
    + basementBaseCosts.breakdownItems.reduce((sum, item) => (
      sum + (Math.max(0, item.area) * item.benchmarkRateFactor)
    ), 0)
    + (Math.max(0, input.terraceArea) * 0.50)
    + (Math.max(0, input.balconyArea) * 0.30)


  // -----------------------------------------
  // Category costs (DIN276 groups)
  // -----------------------------------------

  const residentialProgramBaseline =
    getResidentialProgramBaseline(input.mainArea)
  const bedroomCount = input.bedroomCount ?? residentialProgramBaseline.bedrooms
  const bathrooms = input.bathrooms ?? residentialProgramBaseline.bathrooms
  const wcs = input.wcs ?? residentialProgramBaseline.wcs
  const recommendedKitchens = 1
  const kitchenCount = input.kitchenCount ?? recommendedKitchens
  const bathroomDelta = bathrooms - residentialProgramBaseline.bathrooms
  const wcDelta = wcs - residentialProgramBaseline.wcs
  const bedroomDelta = bedroomCount - residentialProgramBaseline.bedrooms
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
      buildingArea,
      qualityId
    })

  const kg600Costs =
    calculateKg600Costs({
      buildingArea,
      qualityId,
      baselineBedroomCount: residentialProgramBaseline.bedrooms,
      bedroomCount,
      kitchenCount,
      customKitchenUnitCost: input.customKitchenUnitCost,
      generalFurniture: input.generalFurniture,
      bathrooms,
      wcs,
    })


  // -----------------------------------------
  // Site costs
  // -----------------------------------------

  const kg200Costs =
    calculateKg200Costs({
      buildingArea,
      landscapingArea: input.landscapingArea,
      siteConditionId: input.siteConditionId,
      accessibilityId: resolvedAccessibilityId,
      utilityConnectionId: input.utilityConnectionId,
      customUtilityCost: input.customUtilityCost
    })
  const level1BenchmarkAllocation =
    calculateLevel1BenchmarkAllocation({
      benchmarkTotal: totalBenchmarkContributionBeforeGroupAllocation,
      siteExcavationBaseCost: kg200Costs.siteExcavationBaseCost,
      fixedWardrobeBaselineCost: kg600Costs.kg620BaselineWardrobeCost,
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
      bedroomDelta,
      kg450BaselineEssentialCost: level1BenchmarkAllocation.kg450BaselineEssentialCost,
      dataSecurityPackageLevel: input.dataSecurityPackageLevel,
      dataSecurityPackageSelection: input.dataSecurityPackageSelection,
      dataSecurityManualQuote: input.dataSecurityManualQuote,
      automationPackageLevel: input.automationPackageLevel,
      automationPackageSelection: input.automationPackageSelection,
      automationManualQuote: input.automationManualQuote,
      habitableBasementArea: input.habitableBasementArea,
      hvacSelections: input.hvacSelections,
    })
  const categoryCosts =
    calculateCategoryCosts({
      benchmarkBucket300: level1BenchmarkAllocation.benchmarkBucket300
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
  const roomCountAddons =
    calculateRoomCountAddons({
      qualityId,
      bathroomDelta,
      wcDelta,
    })
  const kg300SubgroupCosts = {
    ...kg300ModifierResult.kg300SubgroupCosts,
    subgroup340Cost:
      kg300ModifierResult.kg300SubgroupCosts.subgroup340Cost
      + roomCountAddons.kg300SubgroupAddons.subgroup340Cost,
    subgroup350Cost:
      kg300ModifierResult.kg300SubgroupCosts.subgroup350Cost
      + roomCountAddons.kg300SubgroupAddons.subgroup350Cost,
  }
  const kg300Total =
    kg300ModifierResult.kg300Total
    + roomCountAddons.kg300SubgroupAddons.subgroup340Cost
    + roomCountAddons.kg300SubgroupAddons.subgroup350Cost
  const mergedKg300SubgroupCosts =
    addKg300SubgroupCosts(kg300SubgroupCosts, basementKg300ModifierResult.kg300SubgroupCosts)
  const mergedKg300Total = kg300Total + basementKg300Total
  const mainKg400CategoryCostsById =
    addCostsById(kg400Costs.categoryCostsById, roomCountAddons.kg400CategoryAddonsById)
  const mergedKg400CategoryCostsById =
    addCostsById(mainKg400CategoryCostsById, basementBaseCosts.basementKg400CategoryCostsById)
  const mergedKg400Total =
    Object.values(mergedKg400CategoryCostsById).reduce((sum, cost) => sum + cost, 0)


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
  const kg500SubgroupResult =
    calculateKg500Subgroups({
      landscapingCost: landscapingCosts.landscapingCost,
      landscapingArea: input.landscapingArea,
      poolCost: poolCosts.poolCost,
      includePool: input.includePool,
      poolArea: poolCosts.poolArea,
      poolQualityId: input.poolQualityId,
      poolTypeId: input.poolTypeId,
      siteConditionId: input.siteConditionId,
    })
  const kg700SubgroupResult =
    calculateKg700Subgroups({
      permitFee: permitCosts.permitFee,
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

  const kg500Total = kg500SubgroupResult.kg500Total
  const kg700Total = kg700SubgroupResult.kg700Total

  const constructionSubtotal =
    mergedKg300Total + mergedKg400Total + kg600Costs.kg600Cost

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
      buildingArea,
      manualCost: input.efkaInsuranceManualCost,
    })

  const coreProjectTotal =
      kg200Costs.kg200Total
    + constructionSubtotal
    + kg500Total
    + kg700Total
    + contingencyCosts.contingencyCost
    + contractorMarginCosts.contractorCost

  const group100Total = kg100Costs.kg100Total

  const dinSubtotal =
      group100Total
    + kg200Costs.kg200Total
    + constructionSubtotal
    + kg500Total
    + kg700Total

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
  const estimatedRangeLow = Math.round(preVatTotal * 0.88)
  const estimatedRangeHigh = Math.round(preVatTotal * 1.12)

  const breakdownGroups =
    buildProjectCostBreakdown({
      investmentTotal: preVatTotal,
      landValue: kg100Costs.landValue,
      landAcquisitionCosts: kg100Costs.incidentalLandAcquisitionCosts,
      landAcquisitionCostsMode: kg100Costs.landAcquisitionCostsMode,
      landAcquisitionRatePercent: kg100Costs.landAcquisitionRatePercent,
      kg200Total: kg200Costs.kg200Total,
      siteExcavationCost: kg200Costs.siteExcavationCost,
      utilityGroup220Cost: kg200Costs.group220Cost,
      utilityGroup230Cost: kg200Costs.group230Cost,
      kg300Total: mergedKg300Total,
      kg300SubgroupCosts: mergedKg300SubgroupCosts,
      bathroomRoomCountAddons: roomCountAddons.bathroomRoomCountAddons,
      wcRoomCountAddons: roomCountAddons.wcRoomCountAddons,
      kg400Total: mergedKg400Total,
      kg400CategoryCostsById: mergedKg400CategoryCostsById,
      kg450BaselineEssentialCost: level1BenchmarkAllocation.kg450BaselineEssentialCost,
      kg450UpgradeCost: kg400Costs.packageCosts.dataSecurity.upgradeCost,
      kg500Subgroups: kg500SubgroupResult.kg500Subgroups,
      hvacSelections: input.hvacSelections,
      siteConditionId: input.siteConditionId,
      kg600Cost: kg600Costs.kg600Cost,
      kg600SubgroupCosts: kg600Costs.kg600SubgroupCosts,
      kg620BaselineWardrobeCost: kg600Costs.kg620BaselineWardrobeCost,
      kg620WardrobeDeltaCost: kg600Costs.kg620WardrobeDeltaCost,
      kg620WardrobeTotal: kg600Costs.kg620WardrobeTotal,
      bedroomPackageCost: kg600Costs.bedroomPackageCost,
      areaBased610Cost: kg600Costs.areaBased610Cost,
      kitchenFurnitureCost: kg600Costs.kitchenFurnitureCost,
      bathroomWcFurnishingSliceCost: kg600Costs.bathroomWcFurnishingSliceCost,
      kg700Subgroups: kg700SubgroupResult.kg700Subgroups,
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
    estimatedRangeLow,
    estimatedRangeHigh,
    constructionSubtotal,
    buildingArea,
    baseCostPerSqm: buildingCost.baseCostPerSqm,
    locationAdjustedBaseCostPerSqm: buildingCost.costPerSqm,
    sizeCorrectionFactor: buildingCost.sizeCorrectionFactor,
    sizeAdjustedCostPerSqm: buildingCost.sizeAdjustedCostPerSqm,
    correctedCostPerSqm: buildingCost.correctedCostPerSqm,
    benchmarkEffectiveArea,
    benchmarkPreviewPerQuality,
    residentialProgramBaseline,
    recommendedBedrooms: residentialProgramBaseline.bedrooms,
    recommendedBathrooms: residentialProgramBaseline.bathrooms,
    recommendedWcs: residentialProgramBaseline.wcs,
    recommendedKitchens,
    bedroomCount,
    bathrooms,
    wcs,
    kitchenCount,
    bedroomDelta,
    bathroomDelta,
    wcDelta,
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
    kg300Total: mergedKg300Total,
    kg400Total: mergedKg400Total,
    kg500Total,
    kg700Total,
    kg600Cost: kg600Costs.kg600Cost,
    baseBuildingAreaBenchmarkContribution,
    coveredTerracesBenchmarkContribution,
    balconyAreaBenchmarkContribution,
    totalBenchmarkContributionBeforeGroupAllocation,

    rawBuildingCost: buildingCost.rawBuildingCost,
    basementBenchmarkRate: basementBaseCosts.basementBenchmarkRate,
    basementBaseCost,
    basementBucket300: basementBaseCosts.basementBucket300,
    basementBucket400: basementBaseCosts.basementBucket400,
    basementKg300Total,
    basementKg300ModifierCost,
    basementKg300CategoryCostsById: basementBaseCosts.basementKg300CategoryCostsById,
    basementKg400CategoryCostsById: basementBaseCosts.basementKg400CategoryCostsById,
    basementKg300BaseSubgroupCosts: basementBaseCosts.basementKg300SubgroupCosts,
    basementKg300SubgroupCosts: basementKg300ModifierResult.kg300SubgroupCosts,
    basementKg300ModifierDetails: basementKg300ModifierResult.modifierDetails,
    storageTechnicalBasementCost: basementBaseCosts.storageTechnicalBasementCost,
    parkingBasementCost: basementBaseCosts.parkingBasementCost,
    habitableBasementCost: basementBaseCosts.habitableBasementCost,
    basementCostItems: basementBaseCosts.breakdownItems,
    bathroomRoomCountAddons: roomCountAddons.bathroomRoomCountAddons,
    wcRoomCountAddons: roomCountAddons.wcRoomCountAddons,
    kg340BathroomDelta: roomCountAddons.kg340BathroomDelta,
    kg350BathroomDelta: roomCountAddons.kg350BathroomDelta,
    kg400BathroomDelta: roomCountAddons.kg400BathroomDelta,
    kg340WcDelta: roomCountAddons.kg340WcDelta,
    kg350WcDelta: roomCountAddons.kg350WcDelta,
    kg400WcDelta: roomCountAddons.kg400WcDelta,
    kg300RoomCountAddons: roomCountAddons.kg300SubgroupAddons,
    kg400CategoryRoomCountAddonsById: roomCountAddons.kg400CategoryAddonsById,
    kg300SubgroupCosts: mergedKg300SubgroupCosts,
    kg300ModifierDetails: kg300ModifierResult.modifierDetails,
    kg400CategoryCostsById: mergedKg400CategoryCostsById,
    kg600SubgroupCosts: kg600Costs.kg600SubgroupCosts,
    kg500Subgroups: kg500SubgroupResult.kg500Subgroups,
    kg700Subgroups: kg700SubgroupResult.kg700Subgroups,
    suggestedKitchenUnitCost: kg600Costs.suggestedKitchenUnitCost,
    suggestedGeneralFurniture: kg600Costs.suggestedGeneralFurniture,
    bedroomPackageCost: kg600Costs.bedroomPackageCost,
    areaBased610Cost: kg600Costs.areaBased610Cost,
    kitchenFurnitureCost: kg600Costs.kitchenFurnitureCost,
    kg610AutoTotal: kg600Costs.kg610AutoTotal,
    kg610Total: kg600Costs.kg610Total,
    kitchenUnitCost: kg600Costs.kitchenUnitCost,
    kitchenPackageCost: kg600Costs.kitchenPackageCost,
    wardrobePackageCost: kg600Costs.wardrobePackageCost,
    bathroomWcFurnishingSliceCost: kg600Costs.bathroomWcFurnishingSliceCost,
    includedWardrobes: kg600Costs.includedWardrobes,
    totalWardrobeCount: kg600Costs.totalWardrobeCount,
    baselineWardrobeCount: kg600Costs.baselineWardrobeCount,
    wardrobeDelta: kg600Costs.wardrobeDelta,
    kg620BaselineWardrobeCost: kg600Costs.kg620BaselineWardrobeCost,
    kg620WardrobeDeltaCost: kg600Costs.kg620WardrobeDeltaCost,
    kg620WardrobeTotal: kg600Costs.kg620WardrobeTotal,
    fixedBenchmarkIncluded210: level1BenchmarkAllocation.fixedBenchmarkIncluded,
    fixedBenchmarkIncluded620BaselineWardrobes: level1BenchmarkAllocation.fixedWardrobeBaselineBenchmarkIncluded,
    kg450BaselineEssentialRate: level1BenchmarkAllocation.kg450BaselineEssentialRate,
    kg450BaselineEssentialCost: level1BenchmarkAllocation.kg450BaselineEssentialCost,
    kg450UpgradeCost: kg400Costs.packageCosts.dataSecurity.upgradeCost,
    benchmarkRemainderAfterFixed210: level1BenchmarkAllocation.benchmarkRemainderAfterFixed210,
    benchmarkRemainderAfterFixed210And620: level1BenchmarkAllocation.benchmarkRemainderAfterFixed210And620,
    benchmarkRemainderAfterFixed210And620And450: level1BenchmarkAllocation.benchmarkRemainderAfterFixed210And620And450,
    kg100SubgroupCosts: kg100Costs.subgroupCosts,
    permitFee: kg700Total,
    landscapingCost: landscapingCosts.landscapingCost,
    poolCost: poolCosts.poolCost,
    poolArea: poolCosts.poolArea,
    hvacOptionCosts: kg400Costs.hvacOptionCosts,
    hvacExtrasCost: kg400Costs.hvacExtrasCost,
    packageCosts: kg400Costs.packageCosts,
    siteCost: kg200Costs.kg200Total,
    utilityConnectionCost: kg200Costs.utilityConnectionCost,
    utilityGroup220Cost: kg200Costs.group220Cost,
    utilityGroup230Cost: kg200Costs.group230Cost,
    siteExcavationCost: kg200Costs.siteExcavationCost,
    landAcquisitionAmount: kg100Costs.incidentalLandAcquisitionCosts,
    landAcquisitionRatePercent: kg100Costs.landAcquisitionRatePercent,
    breakdownGroups,

  }

}
