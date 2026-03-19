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
  return input.mainArea
}
