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
  landscapingArea?: number
}

export interface ProjectCostBreakdown {
  KG200?: number
  KG300: number
  KG400?: number
  KG500?: number
  KG600?: number
  KG700?: number

  totalCost: number
}