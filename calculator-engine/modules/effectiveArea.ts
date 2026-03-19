interface BuildingAreaInput {
  mainArea: number
  terraceArea: number
  balconyArea: number
  basementArea?: number
  basementTypeId?: string
  storageBasementArea?: number
  parkingBasementArea?: number
  habitableBasementArea?: number
}

export function calculateBuildingArea(input: BuildingAreaInput): number {
  return input.mainArea
}
