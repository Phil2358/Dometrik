import { calculateProjectCost } from "../calculator-engine/calculateProjectCost"
import { BASEMENT_TYPE_NAMES, DEFAULT_QUALITY_ID, QUALITY_LEVELS, normalizeQualityId } from "../constants/construction"
import { formatNumber } from "./format"

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

  buildingArea: number
  mainArea: number
  terraceArea: number
  balconyArea: number
  basementArea: number
  storageBasementArea: number
  parkingBasementArea: number
  habitableBasementArea: number

  rawBuildingCost: number
  baseBuildingAreaBenchmarkContribution: number
  coveredTerracesBenchmarkContribution: number
  balconyAreaBenchmarkContribution: number
  totalBenchmarkContributionBeforeGroupAllocation: number
  basementBaseCost: number
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
}

export function formatBasementSummary(
  storageBasementArea: number,
  parkingBasementArea: number,
  habitableBasementArea: number
): string {
  const parts: string[] = []

  if (storageBasementArea > 0) {
    parts.push(`${BASEMENT_TYPE_NAMES.storage} ${formatNumber(storageBasementArea)} m²`)
  }

  if (parkingBasementArea > 0) {
    parts.push(`${BASEMENT_TYPE_NAMES.parking} ${formatNumber(parkingBasementArea)} m²`)
  }

  if (habitableBasementArea > 0) {
    parts.push(`${BASEMENT_TYPE_NAMES.habitable} ${formatNumber(habitableBasementArea)} m²`)
  }

  if (parts.length === 0) {
    return "No basement"
  }

  return parts.join(" · ")
}

export function computeScenarioCosts(config: any): ComputedScenarioCosts {
  const storageBasementArea = config.storageBasementArea ?? 0
  const parkingBasementArea = config.parkingBasementArea ?? 0
  const habitableBasementArea = config.habitableBasementArea ?? 0
  const mixedBasementArea =
    storageBasementArea +
    parkingBasementArea +
    habitableBasementArea

  const basementArea =
    mixedBasementArea > 0
      ? mixedBasementArea
      : (config.basementArea ?? 0)

  const result = calculateProjectCost(config)
  const resolvedQualityId = normalizeQualityId(config.qualityId);
  const resolvedQualityName =
    QUALITY_LEVELS.find((entry) => entry.id === resolvedQualityId)?.name
    ?? QUALITY_LEVELS.find((entry) => entry.id === DEFAULT_QUALITY_ID)?.name
    ?? '';

  return {
    name: config.name ?? "Scenario",

    totalCost: result.preVatTotal ?? result.totalCost ?? 0,
    preVatTotal: result.preVatTotal ?? result.totalCost ?? 0,
    vatAmount: result.vatAmount ?? 0,
    finalTotal: result.finalTotal ?? result.totalCost ?? 0,
    dinSubtotal: result.dinSubtotal ?? 0,
    nonDinAdditionsSubtotal: result.nonDinAdditionsSubtotal ?? 0,

    locationName: config.locationName ?? "",
    qualityName: resolvedQualityName,

    buildingArea: result.buildingArea ?? config.buildingArea ?? config.mainArea ?? 0,
    mainArea: config.mainArea ?? 0,
    terraceArea: config.terraceArea ?? 0,
    balconyArea: config.balconyArea ?? 0,
    basementArea,
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,

    rawBuildingCost: result.rawBuildingCost ?? 0,
    baseBuildingAreaBenchmarkContribution: result.baseBuildingAreaBenchmarkContribution ?? 0,
    coveredTerracesBenchmarkContribution: result.coveredTerracesBenchmarkContribution ?? 0,
    balconyAreaBenchmarkContribution: result.balconyAreaBenchmarkContribution ?? 0,
    totalBenchmarkContributionBeforeGroupAllocation: result.totalBenchmarkContributionBeforeGroupAllocation ?? 0,
    basementBaseCost: result.basementBaseCost ?? 0,
    permitFee: result.permitFee ?? 0,
    permitDesignFee: result.permitFee ?? 0,
    landscapingCost: result.landscapingCost ?? 0,
    poolCost: result.poolCost ?? 0,
    hvacExtrasCost: result.hvacExtrasCost ?? 0,
    siteCost: result.siteCost ?? 0,
    group100Total: result.group100Total ?? 0,
    kg200Total: result.kg200Total ?? 0,
    kg300Cost: result.kg300Total ?? 0,
    kg400Total: result.kg400Total ?? 0,
    kg500Total: result.kg500Total ?? 0,
    kg600Cost: result.kg600Cost ?? 0,
    constructionSubtotal: result.constructionSubtotal ?? 0,
    contractorCost: result.contractorCost ?? 0,
    contingencyCost: result.contingencyCost ?? 0,
    efkaInsuranceAmount: result.efkaInsuranceAmount ?? 0,
    vatPercent: result.vatPercent ?? (config.vatPercent ?? 24),
  }
}
