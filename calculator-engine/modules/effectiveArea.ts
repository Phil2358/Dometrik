import { BASEMENT_TYPES } from "../../constants/construction"

interface EffectiveAreaInput {
  mainArea: number
  terraceArea: number
  balconyArea: number
  basementArea: number
  basementTypeId: string
}

export function calculateEffectiveArea(input: EffectiveAreaInput): number {

  const basementTypes: any[] = [...BASEMENT_TYPES]

  const basementType =
    basementTypes.find(b => b.id === input.basementTypeId) || basementTypes[0]

  const effectiveArea =
    input.mainArea +
    input.terraceArea * 0.5 +
    input.balconyArea * 0.3 +
    input.basementArea * basementType.costFactor

  return effectiveArea
}