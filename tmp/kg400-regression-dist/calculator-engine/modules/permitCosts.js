import { PERMIT_DESIGN_BASELINE_FEE, PERMIT_DESIGN_BASELINE_AREA_MAX, PERMIT_DESIGN_QUALITY_MULTIPLIERS } from "../../constants/construction";
export function calculatePermitCosts(input) {
    var _a;
    let permitFee = PERMIT_DESIGN_BASELINE_FEE;
    if (input.effectiveArea > PERMIT_DESIGN_BASELINE_AREA_MAX) {
        const extraArea = input.effectiveArea - PERMIT_DESIGN_BASELINE_AREA_MAX;
        permitFee += extraArea * 20;
    }
    const qualityMultiplier = (_a = PERMIT_DESIGN_QUALITY_MULTIPLIERS[input.qualityId]) !== null && _a !== void 0 ? _a : 1;
    permitFee =
        permitFee * qualityMultiplier;
    return {
        permitFee: Math.round(permitFee)
    };
}
