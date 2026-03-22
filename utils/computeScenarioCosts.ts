import { calculateProjectCost, type ProjectCalculationInput } from "../calculator-engine/calculateProjectCost"
import type { ProjectBreakdownGroup } from "../calculator-engine/buildProjectCostBreakdown"
import {
  BASEMENT_TYPE_NAMES,
  DEFAULT_QUALITY_ID,
  GROUNDWATER_CONDITIONS,
  HVAC_OPTIONS,
  LOCATIONS,
  POOL_SIZE_OPTIONS,
  QUALITY_LEVELS,
  SITE_ACCESSIBILITY_OPTIONS,
  SITE_CONDITIONS,
  normalizeQualityId,
} from "../constants/construction"
import { formatNumber } from "./format"

type CompareScenarioInput = ProjectCalculationInput & {
  name?: string
}

const SQUARE_METER_UNIT = "m\u00B2"
const MIDDLE_DOT = " \u00B7 "

export interface ComputedScenarioCosts {
  name: string
  totalCost: number
  preVatTotal: number
  vatAmount: number
  finalTotal: number
  dinSubtotal: number
  nonDinAdditionsSubtotal: number
  locationName: string
  qualityName: string
  siteConditionName: string
  groundwaterConditionName: string
  siteAccessibilityName: string
  buildingArea: number
  mainArea: number
  terraceArea: number
  balconyArea: number
  basementArea: number
  storageBasementArea: number
  parkingBasementArea: number
  habitableBasementArea: number
  includePool: boolean
  poolArea: number
  poolSizeName: string
  landscapingArea: number
  hvacNames: string[]
  contractorPercent: number
  rawBuildingCost: number
  baseBuildingAreaBenchmarkContribution: number
  coveredTerracesBenchmarkContribution: number
  balconyAreaBenchmarkContribution: number
  totalBenchmarkContributionBeforeGroupAllocation: number
  basementBaseCost: number
  basementKg300Total: number
  basementKg400Total: number
  permitFee: number
  permitDesignFee: number
  landscapingCost: number
  poolCost: number
  hvacExtrasCost: number
  siteCost: number
  group100Total: number
  kg200Total: number
  kg300Cost: number
  kg400Total: number
  kg500Total: number
  kg600Cost: number
  constructionSubtotal: number
  contractorCost: number
  contingencyCost: number
  efkaInsuranceAmount: number
  vatPercent: number
  breakdownGroups: ProjectBreakdownGroup[]
}

export function formatBasementSummary(
  storageBasementArea: number,
  parkingBasementArea: number,
  habitableBasementArea: number
): string {
  const parts: string[] = []

  if (storageBasementArea > 0) {
    parts.push(`${BASEMENT_TYPE_NAMES.storage} ${formatNumber(storageBasementArea)} ${SQUARE_METER_UNIT}`)
  }

  if (parkingBasementArea > 0) {
    parts.push(`${BASEMENT_TYPE_NAMES.parking} ${formatNumber(parkingBasementArea)} ${SQUARE_METER_UNIT}`)
  }

  if (habitableBasementArea > 0) {
    parts.push(`${BASEMENT_TYPE_NAMES.habitable} ${formatNumber(habitableBasementArea)} ${SQUARE_METER_UNIT}`)
  }

  if (parts.length === 0) {
    return "No basement"
  }

  return parts.join(MIDDLE_DOT)
}

export function computeScenarioCosts(config: CompareScenarioInput): ComputedScenarioCosts {
  const storageBasementArea = config.storageBasementArea ?? 0
  const parkingBasementArea = config.parkingBasementArea ?? 0
  const habitableBasementArea = config.habitableBasementArea ?? 0
  const basementArea =
    storageBasementArea +
    parkingBasementArea +
    habitableBasementArea

  const poolSizeOption =
    POOL_SIZE_OPTIONS.find((option) => option.id === config.poolSizeId)
    ?? POOL_SIZE_OPTIONS[0]

  const result = calculateProjectCost(config)
  const resolvedQualityId = normalizeQualityId(config.qualityId)
  const qualityName =
    QUALITY_LEVELS.find((entry) => entry.id === resolvedQualityId)?.name
    ?? QUALITY_LEVELS.find((entry) => entry.id === DEFAULT_QUALITY_ID)?.name
    ?? ""
  const locationName =
    LOCATIONS.find((entry) => entry.id === config.locationId)?.name
    ?? ""
  const siteConditionName =
    SITE_CONDITIONS.find((entry) => entry.id === config.siteConditionId)?.name
    ?? ""
  const groundwaterConditionName =
    GROUNDWATER_CONDITIONS.find((entry) => entry.id === config.groundwaterConditionId)?.name
    ?? ""
  const siteAccessibilityName =
    SITE_ACCESSIBILITY_OPTIONS.find((entry) => entry.id === (config.siteAccessibilityId ?? config.accessibilityId ?? "normal"))?.name
    ?? ""
  const hvacNames =
    HVAC_OPTIONS
      .filter((option) => config.hvacSelections?.[option.id])
      .map((option) => option.name)

  return {
    name: config.name ?? "Scenario",
    totalCost: result.preVatTotal,
    preVatTotal: result.preVatTotal,
    vatAmount: result.vatAmount,
    finalTotal: result.finalTotal,
    dinSubtotal: result.dinSubtotal,
    nonDinAdditionsSubtotal: result.nonDinAdditionsSubtotal,
    locationName,
    qualityName,
    siteConditionName,
    groundwaterConditionName,
    siteAccessibilityName,
    buildingArea: result.buildingArea,
    mainArea: config.mainArea,
    terraceArea: config.terraceArea,
    balconyArea: config.balconyArea,
    basementArea,
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
    includePool: config.includePool,
    poolArea: result.poolArea,
    poolSizeName: config.poolSizeId === "custom" ? "Custom" : poolSizeOption.name,
    landscapingArea: config.landscapingArea,
    hvacNames,
    contractorPercent: config.contractorPercent ?? 0,
    rawBuildingCost: result.rawBuildingCost,
    baseBuildingAreaBenchmarkContribution: result.baseBuildingAreaBenchmarkContribution,
    coveredTerracesBenchmarkContribution: result.coveredTerracesBenchmarkContribution,
    balconyAreaBenchmarkContribution: result.balconyAreaBenchmarkContribution,
    totalBenchmarkContributionBeforeGroupAllocation: result.totalBenchmarkContributionBeforeGroupAllocation,
    basementBaseCost: result.basementBaseCost,
    basementKg300Total: result.basementKg300Total,
    basementKg400Total: result.basementBucket400,
    permitFee: result.permitFee,
    permitDesignFee: result.permitFee,
    landscapingCost: result.landscapingCost,
    poolCost: result.poolCost,
    hvacExtrasCost: result.hvacExtrasCost,
    siteCost: result.siteCost,
    group100Total: result.group100Total,
    kg200Total: result.kg200Total,
    kg300Cost: result.kg300Total,
    kg400Total: result.kg400Total,
    kg500Total: result.kg500Total,
    kg600Cost: result.kg600Cost,
    constructionSubtotal: result.constructionSubtotal,
    contractorCost: result.contractorCost,
    contingencyCost: result.contingencyCost,
    efkaInsuranceAmount: result.efkaInsuranceAmount,
    vatPercent: result.vatPercent,
    breakdownGroups: result.breakdownGroups,
  }
}
