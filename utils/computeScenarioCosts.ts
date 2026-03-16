import { calculateProjectCost } from "../calculator-engine/calculateProjectCost"
import { formatNumber } from "./format"

export interface ComputedScenarioCosts {
  name: string
  totalCost: number

  locationName: string
  qualityName: string

  mainArea: number
  terraceArea: number
  balconyArea: number
  basementArea: number
  storageBasementArea: number
  parkingBasementArea: number
  habitableBasementArea: number

  rawBuildingCost: number
  permitFee: number
  landscapingCost: number
  poolCost: number
  hvacExtrasCost: number
  siteCost: number
}

export function formatBasementSummary(
  storageBasementArea: number,
  parkingBasementArea: number,
  habitableBasementArea: number
): string {
  const parts: string[] = []

  if (storageBasementArea > 0) {
    parts.push(`Storage ${formatNumber(storageBasementArea)} m²`)
  }

  if (parkingBasementArea > 0) {
    parts.push(`Parking ${formatNumber(parkingBasementArea)} m²`)
  }

  if (habitableBasementArea > 0) {
    parts.push(`Habitable ${formatNumber(habitableBasementArea)} m²`)
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

  return {
    name: config.name ?? "Scenario",

    totalCost: result.totalCost ?? 0,

    locationName: config.locationName ?? "",
    qualityName: config.qualityName ?? "",

    mainArea: config.mainArea ?? 0,
    terraceArea: config.terraceArea ?? 0,
    balconyArea: config.balconyArea ?? 0,
    basementArea,
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,

    rawBuildingCost: result.rawBuildingCost ?? 0,
    permitFee: result.permitFee ?? 0,
    landscapingCost: result.landscapingCost ?? 0,
    poolCost: result.poolCost ?? 0,
    hvacExtrasCost: result.hvacExtrasCost ?? 0,
    siteCost: result.siteCost ?? 0
  }
}
