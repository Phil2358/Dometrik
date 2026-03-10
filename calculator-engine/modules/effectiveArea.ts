import { BASEMENT_TYPES } from "@/constants/construction"

interface EffectiveAreaInput {
  mainArea: number
  terraceArea: number
  balconyArea: number
  basementArea: number
  basementTypeId: string
}

export function calculateEffectiveArea(input: EffectiveAreaInput): number {

  const basementType =
    BASEMENT_TYPES.find(b => b.id === input.basementTypeId)
    ?? BASEMENT_TYPES[0]

  const effectiveArea =
    input.mainArea +
    input.terraceArea * 0.5 +
    input.balconyArea * 0.3 +
    input.basementArea * basementType.costFactor

  return effectiveArea
}