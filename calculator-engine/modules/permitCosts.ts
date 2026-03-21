import {
  DEFAULT_QUALITY_ID,
  PERMIT_DESIGN_BASELINE_FEE,
  PERMIT_DESIGN_BASELINE_AREA_MAX,
  PERMIT_DESIGN_QUALITY_MULTIPLIERS,
  type QualityId,
} from "../../constants/construction"

interface PermitCostsInput {
  benchmarkEffectiveArea: number
  qualityId: QualityId
}

export function calculatePermitCosts(input: PermitCostsInput) {

  let permitFee = PERMIT_DESIGN_BASELINE_FEE

  if (input.benchmarkEffectiveArea > PERMIT_DESIGN_BASELINE_AREA_MAX) {

    const extraArea =
      input.benchmarkEffectiveArea - PERMIT_DESIGN_BASELINE_AREA_MAX

    permitFee += extraArea * 20

  }

  const qualityMultiplier =
    PERMIT_DESIGN_QUALITY_MULTIPLIERS[input.qualityId] ??
    PERMIT_DESIGN_QUALITY_MULTIPLIERS[DEFAULT_QUALITY_ID]

  permitFee =
    permitFee * qualityMultiplier

  return {
    permitFee: Math.round(permitFee)
  }

}
