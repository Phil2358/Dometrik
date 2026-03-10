import {
  BASEMENT_TYPES,
  GROUNDWATER_CONDITIONS,
  getBasementStructureCost,
  getBasementRockyAdjustment
} from "@/constants/construction"

interface BasementCostsInput {
  basementArea: number
  basementTypeId: string
  groundwaterConditionId: string
  siteConditionIsRocky: boolean
}

export function calculateBasementCosts(input: BasementCostsInput) {

  const basementType =
    BASEMENT_TYPES.find(b => b.id === input.basementTypeId)
    ?? BASEMENT_TYPES[0]

  const groundwater =
    GROUNDWATER_CONDITIONS.find(g => g.id === input.groundwaterConditionId)
    ?? GROUNDWATER_CONDITIONS[0]

  let basementStructureCost =
    getBasementStructureCost(
      input.basementArea,
      basementType,
      groundwater
    )

  // rocky soil adjustment
  if (input.siteConditionIsRocky) {
    const rockyAdjustment =
      getBasementRockyAdjustment(input.basementArea)

    basementStructureCost *= (1 + rockyAdjustment)
  }

  return {
    basementStructureCost
  }
}