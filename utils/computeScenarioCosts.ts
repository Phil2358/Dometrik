import { calculateProjectCost } from "../calculator-engine/calculateProjectCost"

export interface ComputedScenarioCosts {
  name: string
  totalCost: number

  locationName: string
  qualityName: string

  mainArea: number
  terraceArea: number
  balconyArea: number
  basementArea: number

  rawBuildingCost: number
  permitFee: number
  landscapingCost: number
  poolCost: number
  hvacExtrasCost: number
  siteCost: number
}

export function computeScenarioCosts(config: any): ComputedScenarioCosts {

  const result = calculateProjectCost(config)

  return {
    name: config.name ?? "Scenario",

    totalCost: result.totalCost ?? 0,

    locationName: config.locationName ?? "",
    qualityName: config.qualityName ?? "",

    mainArea: config.mainArea ?? 0,
    terraceArea: config.terraceArea ?? 0,
    balconyArea: config.balconyArea ?? 0,
    basementArea: config.basementArea ?? 0,

    rawBuildingCost: result.rawBuildingCost ?? 0,
    permitFee: result.permitFee ?? 0,
    landscapingCost: result.landscapingCost ?? 0,
    poolCost: result.poolCost ?? 0,
    hvacExtrasCost: result.hvacExtrasCost ?? 0,
    siteCost: result.siteCost ?? 0
  }
}