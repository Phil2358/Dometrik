"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateKg400BenchmarkCategoryCostsById = calculateKg400BenchmarkCategoryCostsById;
exports.calculateKg400Costs = calculateKg400Costs;
const construction_1 = require("../../constants/construction");
const hvacExtras_1 = require("./hvacExtras");
const KG400_BENCHMARK_CATEGORY_IDS = [
    "plumbing",
    "heating",
    "ventilation_cooling",
    "electrical",
];
const KG400_CATEGORY_PERCENTAGE_DENOMINATOR = construction_1.COST_CATEGORIES
    .filter((category) => KG400_BENCHMARK_CATEGORY_IDS.includes(category.id))
    .reduce((sum, category) => sum + category.percentage, 0);
function getKg400CategoryPercentage(categoryId) {
    var _a, _b;
    return (_b = (_a = construction_1.COST_CATEGORIES.find((category) => category.id === categoryId)) === null || _a === void 0 ? void 0 : _a.percentage) !== null && _b !== void 0 ? _b : 0;
}
function calculateKg400BenchmarkCategoryCostsById(benchmarkBucket400) {
    const resolvedBenchmarkBucket400 = Math.max(0, benchmarkBucket400);
    const plumbing = Math.max(0, Math.round(resolvedBenchmarkBucket400
        * (getKg400CategoryPercentage("plumbing") / KG400_CATEGORY_PERCENTAGE_DENOMINATOR)));
    const heating = Math.max(0, Math.round(resolvedBenchmarkBucket400
        * (getKg400CategoryPercentage("heating") / KG400_CATEGORY_PERCENTAGE_DENOMINATOR)));
    const ventilation_cooling = Math.max(0, Math.round(resolvedBenchmarkBucket400
        * (getKg400CategoryPercentage("ventilation_cooling") / KG400_CATEGORY_PERCENTAGE_DENOMINATOR)));
    const electrical = Math.max(0, resolvedBenchmarkBucket400 - plumbing - heating - ventilation_cooling);
    return {
        plumbing,
        heating,
        ventilation_cooling,
        electrical,
        data_security: 0,
        automation: 0,
    };
}
function calculateKg400Costs(input) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    const qualityPackageMultiplier = (_a = construction_1.KG400_OPTION_PACKAGE_QUALITY_FACTORS[input.qualityId]) !== null && _a !== void 0 ? _a : construction_1.KG400_OPTION_PACKAGE_QUALITY_FACTORS[construction_1.DEFAULT_QUALITY_ID];
    const benchmarkBucket400 = Math.max(0, input.benchmarkBucket400);
    const kg400BedroomDeltaCost = Math.round(input.bedroomDelta * construction_1.KG400_BEDROOM_DELTA_BASE_COST * qualityPackageMultiplier);
    const kg400BathroomDeltaCost = Math.round(input.bathroomDelta * construction_1.KG400_BATHROOM_DELTA_BASE_COST * qualityPackageMultiplier);
    const kg400WcDeltaCost = Math.round(input.wcDelta * construction_1.KG400_WC_DELTA_BASE_COST * qualityPackageMultiplier);
    const kg400BedroomHeatingAdjustment = Math.round(kg400BedroomDeltaCost * 0.20);
    const kg400BedroomVentilationAdjustment = Math.round(kg400BedroomDeltaCost * 0.30);
    const kg400BedroomElectricalAdjustment = kg400BedroomDeltaCost
        - kg400BedroomHeatingAdjustment
        - kg400BedroomVentilationAdjustment;
    const kg400BathroomPlumbingAdjustment = Math.round(kg400BathroomDeltaCost * 0.65);
    const kg400BathroomHeatingAdjustment = Math.round(kg400BathroomDeltaCost * 0.10);
    const kg400BathroomVentilationAdjustment = Math.round(kg400BathroomDeltaCost * 0.05);
    const kg400BathroomElectricalAdjustment = kg400BathroomDeltaCost
        - kg400BathroomPlumbingAdjustment
        - kg400BathroomHeatingAdjustment
        - kg400BathroomVentilationAdjustment;
    const kg400WcPlumbingAdjustment = Math.round(kg400WcDeltaCost * 0.75);
    const kg400WcHeatingAdjustment = Math.round(kg400WcDeltaCost * 0.05);
    const kg400WcVentilationAdjustment = Math.round(kg400WcDeltaCost * 0.05);
    const kg400WcElectricalAdjustment = kg400WcDeltaCost
        - kg400WcPlumbingAdjustment
        - kg400WcHeatingAdjustment
        - kg400WcVentilationAdjustment;
    const hvacCosts = (0, hvacExtras_1.calculateHvacExtras)({
        mainArea: input.mainArea,
        habitableBasementArea: input.habitableBasementArea,
        qualityId: input.qualityId,
        hvacSelections: input.hvacSelections,
    });
    const dataSecurityPackageLevel = (_b = input.dataSecurityPackageLevel) !== null && _b !== void 0 ? _b : (((_c = input.dataSecurityPackageSelection) !== null && _c !== void 0 ? _c : "no") === "yes" ? "connected" : "essential");
    const dataSecurityUpliftPerSqm = construction_1.KG400_DATA_SECURITY_UPLIFT_PER_SQM[dataSecurityPackageLevel];
    const dataSecurityManualQuote = (_d = input.dataSecurityManualQuote) !== null && _d !== void 0 ? _d : null;
    const dataSecurityDefaultPackageCost = Math.round(Math.max(0, input.mainArea) * dataSecurityUpliftPerSqm);
    const dataSecurityExtraCost = dataSecurityPackageLevel === "custom"
        ? Math.max(0, dataSecurityManualQuote !== null && dataSecurityManualQuote !== void 0 ? dataSecurityManualQuote : 0)
        : dataSecurityDefaultPackageCost;
    const dataSecurityCategoryCost = dataSecurityExtraCost;
    const automationPackageLevel = (_e = input.automationPackageLevel) !== null && _e !== void 0 ? _e : (((_f = input.automationPackageSelection) !== null && _f !== void 0 ? _f : "no") === "yes" ? "connected" : "none");
    const automationUpliftPerSqm = construction_1.KG400_AUTOMATION_UPLIFT_PER_SQM[automationPackageLevel];
    const automationDefaultPackageCost = Math.round(Math.max(0, input.mainArea) * automationUpliftPerSqm);
    const automationManualQuote = (_g = input.automationManualQuote) !== null && _g !== void 0 ? _g : null;
    const automationExtraCost = automationPackageLevel === "custom"
        ? Math.max(0, automationManualQuote !== null && automationManualQuote !== void 0 ? automationManualQuote : 0)
        : automationDefaultPackageCost;
    const automationCategoryCost = automationExtraCost;
    const benchmarkCategoryCostsById = calculateKg400BenchmarkCategoryCostsById(benchmarkBucket400);
    const categoryCostsById = {
        plumbing: Math.max(0, Math.round(((_h = benchmarkCategoryCostsById.plumbing) !== null && _h !== void 0 ? _h : 0)
            + kg400BathroomPlumbingAdjustment
            + kg400WcPlumbingAdjustment)),
        heating: Math.max(0, Math.round(((_j = benchmarkCategoryCostsById.heating) !== null && _j !== void 0 ? _j : 0)
            + kg400BedroomHeatingAdjustment
            + kg400BathroomHeatingAdjustment
            + kg400WcHeatingAdjustment
            + ((_k = hvacCosts.adjustmentsByCategory.heating) !== null && _k !== void 0 ? _k : 0))),
        ventilation_cooling: Math.max(0, Math.round(((_l = benchmarkCategoryCostsById.ventilation_cooling) !== null && _l !== void 0 ? _l : 0)
            + kg400BedroomVentilationAdjustment
            + kg400BathroomVentilationAdjustment
            + kg400WcVentilationAdjustment)),
        electrical: Math.max(0, Math.round(((_m = benchmarkCategoryCostsById.electrical) !== null && _m !== void 0 ? _m : 0)
            + kg400BedroomElectricalAdjustment
            + kg400BathroomElectricalAdjustment
            + kg400WcElectricalAdjustment
            + ((_o = hvacCosts.adjustmentsByCategory.electrical) !== null && _o !== void 0 ? _o : 0))),
        data_security: Math.max(0, dataSecurityCategoryCost),
        automation: Math.max(0, automationCategoryCost),
    };
    return {
        categoryCostsById,
        kg400Total: Object.values(categoryCostsById).reduce((sum, cost) => sum + cost, 0),
        hvacOptionCosts: hvacCosts.optionCosts,
        hvacExtrasCost: hvacCosts.hvacExtrasCost,
        packageCosts: {
            dataSecurity: {
                defaultCost: dataSecurityDefaultPackageCost,
                appliedCost: dataSecurityCategoryCost,
                manualOverrideActive: dataSecurityPackageLevel === "custom",
            },
            automation: {
                defaultCost: automationDefaultPackageCost,
                appliedCost: automationCategoryCost,
                manualOverrideActive: automationPackageLevel === "custom",
            },
        },
    };
}
