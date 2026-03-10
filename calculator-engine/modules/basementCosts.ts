import {
  BASEMENT_TYPES,
  GROUNDWATER_CONDITIONS,
  getBasementStructureCost,
  getBasementRockyAdjustment
} from "../../constants/construction"

interface BasementCostsInput {
  basementArea: number
  basementTypeId: string
  groundwaterConditionId: string
  siteConditionIsRocky: boolean
}

export function calculateBasementCosts(input: BasementCostsInput) {

  if (input.basementArea <= 0) {
    return {
      basementStructureCost: 0
    }
  }

  const basementTypes: any[] = [...BASEMENT_TYPES]
  const groundwaterConditions: any[] = [...GROUNDWATER_CONDITIONS]

  const basementType =
    basementTypes.find(b => b.id === input.basementTypeId) || basementTypes[0]

  const groundwater =
    groundwaterConditions.find(g => g.id === input.groundwaterConditionId) || groundwaterConditions[0]

  let basementStructureCost =
    getBasementStructureCost(
      input.basementArea,
      basementType,
      groundwater
    )

  if (input.siteConditionIsRocky) {

    const rockyAdjustment =
      getBasementRockyAdjustment(input.basementArea)

    basementStructureCost =
      basementStructureCost * (1 + rockyAdjustment)

  }

  return {
    basementStructureCost: Math.round(basementStructureCost)
  }

}