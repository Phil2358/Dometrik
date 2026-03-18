import { BASE_GROUP_SHARE_KG400, COST_CATEGORIES, KG400_AUTOMATION_PACKAGE_COSTS, KG400_BATHROOM_DELTA_BASE_COST, KG400_BEDROOM_DELTA_BASE_COST, KG400_DATA_SECURITY_BASELINE_COST_PER_SQM, KG400_WC_DELTA_BASE_COST, QUALITY_LEVELS, } from "../../constants/construction";
import { calculateHvacExtras } from "./hvacExtras";
const KG400_ACCESSIBILITY_WEIGHT = 0.22;
const KG400_PERCENTAGE_DENOMINATOR = 24;
function getKg400CategoryPercentage(categoryId) {
    var _a, _b;
    return (_b = (_a = COST_CATEGORIES.find((category) => category.id === categoryId)) === null || _a === void 0 ? void 0 : _a.percentage) !== null && _b !== void 0 ? _b : 0;
}
export function calculateKg400Costs(input) {
    var _a, _b, _c, _d;
    const qualityPackageMultiplier = (_b = (_a = QUALITY_LEVELS.find((quality) => quality.id === input.qualityId)) === null || _a === void 0 ? void 0 : _a.benchmarkFactor) !== null && _b !== void 0 ? _b : 1;
    const kg400AccessibilityMultiplier = 1 + Math.max(0, input.siteAccessibilityFactor - 1) * KG400_ACCESSIBILITY_WEIGHT;
    const mainAreaConstructionCost = input.mainArea * input.finalCostPerSqm;
    const mainAreaKg400Envelope = Math.round(mainAreaConstructionCost * BASE_GROUP_SHARE_KG400);
    const kg400BedroomDeltaCost = Math.round(input.bedroomDelta * KG400_BEDROOM_DELTA_BASE_COST * qualityPackageMultiplier);
    const kg400BathroomDeltaCost = Math.round(input.bathroomDelta * KG400_BATHROOM_DELTA_BASE_COST * qualityPackageMultiplier);
    const kg400WcDeltaCost = Math.round(input.wcDelta * KG400_WC_DELTA_BASE_COST * qualityPackageMultiplier);
    const kg400BedroomVentilationAdjustment = Math.round(kg400BedroomDeltaCost * 0.45);
    const kg400BedroomElectricalAdjustment = Math.round(kg400BedroomDeltaCost * 0.35);
    const kg400BathroomPlumbingAdjustment = Math.round(kg400BathroomDeltaCost * 0.75);
    const kg400BathroomHeatingAdjustment = Math.round(kg400BathroomDeltaCost * 0.15);
    const kg400BathroomElectricalAdjustment = kg400BathroomDeltaCost - kg400BathroomPlumbingAdjustment - kg400BathroomHeatingAdjustment;
    const kg400WcPlumbingAdjustment = Math.round(kg400WcDeltaCost * 0.70);
    const kg400WcElectricalAdjustment = Math.round(kg400WcDeltaCost * 0.20);
    const hvacCosts = calculateHvacExtras({
        mainArea: input.mainArea,
        habitableBasementArea: input.habitableBasementArea,
        qualityId: input.qualityId,
        hvacSelections: input.hvacSelections,
    });
    // 450 = small main-area-based baseline for minimal weak-current/security infrastructure.
    const dataSecurityOptionalExtrasCost = 0;
    const dataSecurityBaselineCost = Math.round(Math.max(0, input.mainArea) * KG400_DATA_SECURITY_BASELINE_COST_PER_SQM);
    // 480 = automation only via explicit optional package / extras.
    const automationPackageId = "none";
    const automationCategoryCost = KG400_AUTOMATION_PACKAGE_COSTS[automationPackageId];
    const categoryCostsById = {
        plumbing: Math.max(0, Math.round(Math.round(mainAreaKg400Envelope
            * (getKg400CategoryPercentage("plumbing") / KG400_PERCENTAGE_DENOMINATOR)) * kg400AccessibilityMultiplier) + kg400BathroomPlumbingAdjustment + kg400WcPlumbingAdjustment),
        heating: Math.max(0, Math.round(Math.round(mainAreaKg400Envelope
            * (getKg400CategoryPercentage("heating") / KG400_PERCENTAGE_DENOMINATOR)) * kg400AccessibilityMultiplier) + kg400BathroomHeatingAdjustment + ((_c = hvacCosts.adjustmentsByCategory.heating) !== null && _c !== void 0 ? _c : 0)),
        ventilation_cooling: Math.max(0, Math.round(Math.round(mainAreaKg400Envelope
            * (getKg400CategoryPercentage("ventilation_cooling") / KG400_PERCENTAGE_DENOMINATOR)) * kg400AccessibilityMultiplier) + kg400BedroomVentilationAdjustment),
        electrical: Math.max(0, Math.round(Math.round(mainAreaKg400Envelope
            * (getKg400CategoryPercentage("electrical") / KG400_PERCENTAGE_DENOMINATOR)) * kg400AccessibilityMultiplier)
            + kg400BedroomElectricalAdjustment
            + kg400BathroomElectricalAdjustment
            + kg400WcElectricalAdjustment
            + ((_d = hvacCosts.adjustmentsByCategory.electrical) !== null && _d !== void 0 ? _d : 0)),
        data_security: Math.max(0, dataSecurityBaselineCost + dataSecurityOptionalExtrasCost),
        automation: Math.max(0, automationCategoryCost),
    };
    return {
        categoryCostsById,
        kg400Total: Object.values(categoryCostsById).reduce((sum, cost) => sum + cost, 0),
        hvacOptionCosts: hvacCosts.optionCosts,
        hvacExtrasCost: hvacCosts.hvacExtrasCost,
    };
}
