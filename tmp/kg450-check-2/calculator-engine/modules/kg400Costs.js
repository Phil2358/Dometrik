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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const qualityPackageMultiplier = (_a = construction_1.KG400_OPTION_PACKAGE_QUALITY_FACTORS[input.qualityId]) !== null && _a !== void 0 ? _a : construction_1.KG400_OPTION_PACKAGE_QUALITY_FACTORS[construction_1.DEFAULT_QUALITY_ID];
    const bedroomDeltaBaseCost = (_b = construction_1.KG400_BEDROOM_DELTA_BASE_COSTS[input.qualityId]) !== null && _b !== void 0 ? _b : construction_1.KG400_BEDROOM_DELTA_BASE_COSTS[construction_1.DEFAULT_QUALITY_ID];
    const benchmarkBucket400 = Math.max(0, input.benchmarkBucket400);
    const kg400BedroomDeltaCost = Math.round(input.bedroomDelta * bedroomDeltaBaseCost);
    const kg400BedroomHeatingAdjustment = Math.round(kg400BedroomDeltaCost * 0.20);
    const kg400BedroomVentilationAdjustment = Math.round(kg400BedroomDeltaCost * 0.30);
    const kg400BedroomElectricalAdjustment = kg400BedroomDeltaCost
        - kg400BedroomHeatingAdjustment
        - kg400BedroomVentilationAdjustment;
    const hvacCosts = (0, hvacExtras_1.calculateHvacExtras)({
        mainArea: input.mainArea,
        habitableBasementArea: input.habitableBasementArea,
        qualityId: input.qualityId,
        hvacSelections: input.hvacSelections,
    });
    const dataSecurityPackageLevel = (_c = input.dataSecurityPackageLevel) !== null && _c !== void 0 ? _c : (((_d = input.dataSecurityPackageSelection) !== null && _d !== void 0 ? _d : "no") === "yes" ? "connected" : "essential");
    const dataSecurityUpliftPerSqm = construction_1.KG400_DATA_SECURITY_UPLIFT_PER_SQM[dataSecurityPackageLevel];
    const dataSecurityManualQuote = (_e = input.dataSecurityManualQuote) !== null && _e !== void 0 ? _e : null;
    const dataSecurityUpgradeDefaultCost = Math.round(Math.max(0, input.mainArea) * dataSecurityUpliftPerSqm);
    const dataSecurityUpgradeCost = dataSecurityPackageLevel === "custom"
        ? Math.max(0, dataSecurityManualQuote !== null && dataSecurityManualQuote !== void 0 ? dataSecurityManualQuote : 0)
        : dataSecurityUpgradeDefaultCost;
    const dataSecurityBaselineCost = Math.max(0, input.kg450BaselineEssentialCost);
    const dataSecurityDefaultPackageCost = dataSecurityBaselineCost
        + (dataSecurityPackageLevel === "custom" ? 0 : dataSecurityUpgradeDefaultCost);
    const dataSecurityCategoryCost = dataSecurityBaselineCost + dataSecurityUpgradeCost;
    const automationPackageLevel = (_f = input.automationPackageLevel) !== null && _f !== void 0 ? _f : (((_g = input.automationPackageSelection) !== null && _g !== void 0 ? _g : "no") === "yes" ? "connected" : "none");
    const automationUpliftPerSqm = construction_1.KG400_AUTOMATION_UPLIFT_PER_SQM[automationPackageLevel];
    const automationDefaultPackageCost = Math.round(Math.max(0, input.mainArea) * automationUpliftPerSqm);
    const automationManualQuote = (_h = input.automationManualQuote) !== null && _h !== void 0 ? _h : null;
    const automationExtraCost = automationPackageLevel === "custom"
        ? Math.max(0, automationManualQuote !== null && automationManualQuote !== void 0 ? automationManualQuote : 0)
        : automationDefaultPackageCost;
    const automationCategoryCost = automationExtraCost;
    const benchmarkCategoryCostsById = calculateKg400BenchmarkCategoryCostsById(benchmarkBucket400);
    const categoryCostsById = {
        plumbing: Math.max(0, Math.round((_j = benchmarkCategoryCostsById.plumbing) !== null && _j !== void 0 ? _j : 0)),
        heating: Math.max(0, Math.round(((_k = benchmarkCategoryCostsById.heating) !== null && _k !== void 0 ? _k : 0)
            + kg400BedroomHeatingAdjustment
            + ((_l = hvacCosts.adjustmentsByCategory.heating) !== null && _l !== void 0 ? _l : 0))),
        ventilation_cooling: Math.max(0, Math.round(((_m = benchmarkCategoryCostsById.ventilation_cooling) !== null && _m !== void 0 ? _m : 0)
            + kg400BedroomVentilationAdjustment)),
        electrical: Math.max(0, Math.round(((_o = benchmarkCategoryCostsById.electrical) !== null && _o !== void 0 ? _o : 0)
            + kg400BedroomElectricalAdjustment
            + ((_p = hvacCosts.adjustmentsByCategory.electrical) !== null && _p !== void 0 ? _p : 0))),
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
                baselineCost: dataSecurityBaselineCost,
                upgradeCost: dataSecurityUpgradeCost,
                manualOverrideActive: dataSecurityPackageLevel === "custom",
            },
            automation: {
                defaultCost: automationDefaultPackageCost,
                appliedCost: automationCategoryCost,
                baselineCost: 0,
                upgradeCost: automationCategoryCost,
                manualOverrideActive: automationPackageLevel === "custom",
            },
        },
    };
}
