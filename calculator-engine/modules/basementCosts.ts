import {
  BASEMENT_TYPES,
  GROUNDWATER_CONDITIONS,
  getBasementRockyAdjustment
} from "../../constants/construction"

interface BasementCostsInput {
  basementArea?: number
  basementTypeId?: string
  storageBasementArea?: number
  parkingBasementArea?: number
  habitableBasementArea?: number
  groundwaterConditionId: string
  siteConditionIsRocky: boolean
}

export function calculateBasementCosts(input: BasementCostsInput) {

  const storageBasementArea = input.storageBasementArea ?? 0
  const parkingBasementArea = input.parkingBasementArea ?? 0
  const habitableBasementArea = input.habitableBasementArea ?? 0
  const hasMixedBasementInputs =
    input.storageBasementArea !== undefined ||
    input.parkingBasementArea !== undefined ||
    input.habitableBasementArea !== undefined
  const totalBasementArea =
    hasMixedBasementInputs
      ? storageBasementArea + parkingBasementArea + habitableBasementArea
      : (input.basementArea ?? 0)

  if (totalBasementArea <= 0) {
    return {
      basementStructureCost: 0
    }
  }

  const basementTypes: any[] = [...BASEMENT_TYPES]
  const groundwaterConditions: any[] = [...GROUNDWATER_CONDITIONS]
  const storageBasementType =
    basementTypes.find(b => b.id === "storage") || basementTypes[0]
  const parkingBasementType =
    basementTypes.find(b => b.id === "parking") || basementTypes[0]
  const habitableBasementType =
    basementTypes.find(b => b.id === "habitable") || basementTypes[0]

  const groundwater =
    groundwaterConditions.find(g => g.id === input.groundwaterConditionId) || groundwaterConditions[0]

  let basementStructureCost =
    storageBasementArea * storageBasementType.structureCostPerSqm +
    parkingBasementArea * parkingBasementType.structureCostPerSqm +
    habitableBasementArea * habitableBasementType.structureCostPerSqm

  if (!hasMixedBasementInputs) {
    const basementType =
      basementTypes.find(b => b.id === input.basementTypeId) || storageBasementType
    basementStructureCost =
      (input.basementArea ?? 0) * basementType.structureCostPerSqm
  }

  if (groundwater.basementCostMultiplier > 1) {
    basementStructureCost *= 1.08
  }

  if (input.siteConditionIsRocky) {

    const rockyAdjustment =
      getBasementRockyAdjustment(totalBasementArea)

    basementStructureCost =
      basementStructureCost * (1 + rockyAdjustment)

  }

  return {
    basementStructureCost: Math.round(basementStructureCost)
  }

}
