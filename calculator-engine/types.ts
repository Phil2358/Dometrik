export type BasementType =
  | "storage"
  | "parking"
  | "habitable"

export interface ProjectInput {
  locationFactor: number
  baseCostPerM2: number

  livingArea: number
  terraceArea: number
  basementArea: number

  basementType: BasementType

  bathrooms: number
  wc: number

  poolArea?: number
  poolDepth?: number
}