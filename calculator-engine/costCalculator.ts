export interface ProjectInput {

  locationFactor: number
  baseCostPerM2: number

  livingArea: number
  terraceArea: number
  basementArea: number

  basementType: "storage" | "parking" | "habitable"

  bathrooms: number
  wc: number

  poolArea?: number
  poolDepth?: number

}

export function calculateProjectCost(input: ProjectInput) {

  const effectiveArea =
    input.livingArea +
    input.terraceArea * 0.5 +
    input.basementArea * 0.5

  const totalCost =
    effectiveArea *
    input.baseCostPerM2 *
    input.locationFactor

  return {
    effectiveArea,
    totalCost
  }
}