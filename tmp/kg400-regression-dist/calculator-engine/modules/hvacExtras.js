const HVAC_HEATING_QUALITY_MULTIPLIERS = {
    standard: 1.00,
    premium: 1.12,
    luxury: 1.25
};
const HVAC_PV_QUALITY_MULTIPLIERS = {
    standard: 1.00,
    premium: 1.07,
    luxury: 1.12
};
export function calculateHvacExtras(input) {
    var _a, _b, _c;
    const heatingQualityMultiplier = (_a = HVAC_HEATING_QUALITY_MULTIPLIERS[input.qualityId]) !== null && _a !== void 0 ? _a : 1.12;
    const photovoltaicQualityMultiplier = (_b = HVAC_PV_QUALITY_MULTIPLIERS[input.qualityId]) !== null && _b !== void 0 ? _b : 1.07;
    const heatedInternalArea = Math.max(0, input.mainArea + ((_c = input.habitableBasementArea) !== null && _c !== void 0 ? _c : 0));
    const kg400ProgramArea = Math.max(0, input.mainArea);
    const underfloorHeatingBaseCost = Math.max(9000, heatedInternalArea * 85);
    const underfloorHeatingCost = input.hvacSelections.underfloor_heating
        ? Math.round(underfloorHeatingBaseCost * heatingQualityMultiplier)
        : 0;
    const solarThermalBaseCost = kg400ProgramArea <= 120
        ? 2500
        : kg400ProgramArea <= 220
            ? 3500
            : 4500;
    const solarThermalCostCap = input.qualityId === "luxury"
        ? 6500
        : input.qualityId === "premium"
            ? 6000
            : 5500;
    const solarThermalCost = input.hvacSelections.solar_thermal
        ? Math.min(solarThermalCostCap, Math.round(solarThermalBaseCost * heatingQualityMultiplier))
        : 0;
    const photovoltaicBaseCost = kg400ProgramArea <= 120
        ? 6000
        : kg400ProgramArea <= 220
            ? 9000
            : 11500;
    const photovoltaicCostCap = input.qualityId === "luxury"
        ? 14000
        : input.qualityId === "premium"
            ? 13250
            : 12500;
    const photovoltaicCost = input.hvacSelections.photovoltaic
        ? Math.min(photovoltaicCostCap, Math.round(photovoltaicBaseCost * photovoltaicQualityMultiplier))
        : 0;
    const optionCosts = {
        underfloor_heating: underfloorHeatingCost,
        solar_thermal: solarThermalCost,
        photovoltaic: photovoltaicCost
    };
    return {
        optionCosts,
        adjustmentsByCategory: {
            heating: underfloorHeatingCost + solarThermalCost,
            electrical: photovoltaicCost
        },
        hvacExtrasCost: underfloorHeatingCost + solarThermalCost + photovoltaicCost
    };
}
