import { BASEMENT_TYPES } from "../../constants/construction"

interface EffectiveAreaInput {
  mainArea: number
  terraceArea: number
  balconyArea: number
  basementArea?: number
  basementTypeId?: string
  storageBasementArea?: number
  parkingBasementArea?: number
  habitableBasementArea?: number
}

export function calculateEffectiveArea(input: EffectiveAreaInput): number {

  const basementTypes: any[] = [...BASEMENT_TYPES]
  const storageBasementType =
    basementTypes.find(b => b.id === "storage") || basementTypes[0]
  const parkingBasementType =
    basementTypes.find(b => b.id === "parking") || basementTypes[0]
  const habitableBasementType =
    basementTypes.find(b => b.id === "habitable") || basementTypes[0]

  const hasMixedBasementInputs =
    input.storageBasementArea !== undefined ||
    input.parkingBasementArea !== undefined ||
    input.habitableBasementArea !== undefined

  const weightedBasementArea =
    hasMixedBasementInputs
      ? (input.storageBasementArea ?? 0) * storageBasementType.costFactor
        + (input.parkingBasementArea ?? 0) * parkingBasementType.costFactor
        + (input.habitableBasementArea ?? 0) * habitableBasementType.costFactor
      : (input.basementArea ?? 0) * ((basementTypes.find(b => b.id === input.basementTypeId) || storageBasementType).costFactor)

  const effectiveArea =
    input.mainArea +
    input.terraceArea * 0.5 +
    input.balconyArea * 0.3 +
    weightedBasementArea

  return effectiveArea
}
