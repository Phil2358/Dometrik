import {
  PERMIT_DESIGN_BASELINE_FEE,
  PERMIT_DESIGN_BASELINE_AREA_MAX,
  PERMIT_DESIGN_QUALITY_MULTIPLIERS
} from "../../constants/construction"

interface PermitCostsInput {
  effectiveArea: number
  qualityId: string
}

export function calculatePermitCosts(input: PermitCostsInput) {

  let permitFee = PERMIT_DESIGN_BASELINE_FEE

  if (input.effectiveArea > PERMIT_DESIGN_BASELINE_AREA_MAX) {

    const extraArea =
      input.effectiveArea - PERMIT_DESIGN_BASELINE_AREA_MAX

    permitFee += extraArea * 20

  }

  const qualityMultiplier =
    PERMIT_DESIGN_QUALITY_MULTIPLIERS[input.qualityId] ?? 1

  permitFee =
    permitFee * qualityMultiplier

  return {
    permitFee: Math.round(permitFee)
  }

}