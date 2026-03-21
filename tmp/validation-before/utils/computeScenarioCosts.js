"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBasementSummary = formatBasementSummary;
exports.computeScenarioCosts = computeScenarioCosts;
const calculateProjectCost_1 = require("../calculator-engine/calculateProjectCost");
const construction_1 = require("../constants/construction");
const format_1 = require("./format");
const SQUARE_METER_UNIT = "m\u00B2";
const MIDDLE_DOT = " \u00B7 ";
function formatBasementSummary(storageBasementArea, parkingBasementArea, habitableBasementArea) {
    const parts = [];
    if (storageBasementArea > 0) {
        parts.push(`${construction_1.BASEMENT_TYPE_NAMES.storage} ${(0, format_1.formatNumber)(storageBasementArea)} ${SQUARE_METER_UNIT}`);
    }
    if (parkingBasementArea > 0) {
        parts.push(`${construction_1.BASEMENT_TYPE_NAMES.parking} ${(0, format_1.formatNumber)(parkingBasementArea)} ${SQUARE_METER_UNIT}`);
    }
    if (habitableBasementArea > 0) {
        parts.push(`${construction_1.BASEMENT_TYPE_NAMES.habitable} ${(0, format_1.formatNumber)(habitableBasementArea)} ${SQUARE_METER_UNIT}`);
    }
    if (parts.length === 0) {
        return "No basement";
    }
    return parts.join(MIDDLE_DOT);
}
function computeScenarioCosts(config) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    const storageBasementArea = (_a = config.storageBasementArea) !== null && _a !== void 0 ? _a : 0;
    const parkingBasementArea = (_b = config.parkingBasementArea) !== null && _b !== void 0 ? _b : 0;
    const habitableBasementArea = (_c = config.habitableBasementArea) !== null && _c !== void 0 ? _c : 0;
    const basementArea = storageBasementArea +
        parkingBasementArea +
        habitableBasementArea;
    const poolSizeOption = (_d = construction_1.POOL_SIZE_OPTIONS.find((option) => option.id === config.poolSizeId)) !== null && _d !== void 0 ? _d : construction_1.POOL_SIZE_OPTIONS[0];
    const result = (0, calculateProjectCost_1.calculateProjectCost)(config);
    const resolvedQualityId = (0, construction_1.normalizeQualityId)(config.qualityId);
    const qualityName = (_h = (_f = (_e = construction_1.QUALITY_LEVELS.find((entry) => entry.id === resolvedQualityId)) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : (_g = construction_1.QUALITY_LEVELS.find((entry) => entry.id === construction_1.DEFAULT_QUALITY_ID)) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : "";
    const locationName = (_k = (_j = construction_1.LOCATIONS.find((entry) => entry.id === config.locationId)) === null || _j === void 0 ? void 0 : _j.name) !== null && _k !== void 0 ? _k : "";
    const siteConditionName = (_m = (_l = construction_1.SITE_CONDITIONS.find((entry) => entry.id === config.siteConditionId)) === null || _l === void 0 ? void 0 : _l.name) !== null && _m !== void 0 ? _m : "";
    const groundwaterConditionName = (_p = (_o = construction_1.GROUNDWATER_CONDITIONS.find((entry) => entry.id === config.groundwaterConditionId)) === null || _o === void 0 ? void 0 : _o.name) !== null && _p !== void 0 ? _p : "";
    const siteAccessibilityName = (_r = (_q = construction_1.SITE_ACCESSIBILITY_OPTIONS.find((entry) => { var _a, _b; return entry.id === ((_b = (_a = config.siteAccessibilityId) !== null && _a !== void 0 ? _a : config.accessibilityId) !== null && _b !== void 0 ? _b : "normal"); })) === null || _q === void 0 ? void 0 : _q.name) !== null && _r !== void 0 ? _r : "";
    const hvacNames = construction_1.HVAC_OPTIONS
        .filter((option) => { var _a; return (_a = config.hvacSelections) === null || _a === void 0 ? void 0 : _a[option.id]; })
        .map((option) => option.name);
    return {
        name: (_s = config.name) !== null && _s !== void 0 ? _s : "Scenario",
        totalCost: result.preVatTotal,
        preVatTotal: result.preVatTotal,
        vatAmount: result.vatAmount,
        finalTotal: result.finalTotal,
        dinSubtotal: result.dinSubtotal,
        nonDinAdditionsSubtotal: result.nonDinAdditionsSubtotal,
        locationName,
        qualityName,
        siteConditionName,
        groundwaterConditionName,
        siteAccessibilityName,
        buildingArea: result.buildingArea,
        mainArea: config.mainArea,
        terraceArea: config.terraceArea,
        balconyArea: config.balconyArea,
        basementArea,
        storageBasementArea,
        parkingBasementArea,
        habitableBasementArea,
        includePool: config.includePool,
        poolArea: result.poolArea,
        poolSizeName: config.poolSizeId === "custom" ? "Custom" : poolSizeOption.name,
        landscapingArea: config.landscapingArea,
        hvacNames,
        contractorPercent: (_t = config.contractorPercent) !== null && _t !== void 0 ? _t : 0,
        rawBuildingCost: result.rawBuildingCost,
        baseBuildingAreaBenchmarkContribution: result.baseBuildingAreaBenchmarkContribution,
        coveredTerracesBenchmarkContribution: result.coveredTerracesBenchmarkContribution,
        balconyAreaBenchmarkContribution: result.balconyAreaBenchmarkContribution,
        totalBenchmarkContributionBeforeGroupAllocation: result.totalBenchmarkContributionBeforeGroupAllocation,
        basementBaseCost: result.basementBaseCost,
        basementKg300Total: result.basementKg300Total,
        basementKg400Total: result.basementBucket400,
        permitFee: result.permitFee,
        permitDesignFee: result.permitFee,
        landscapingCost: result.landscapingCost,
        poolCost: result.poolCost,
        hvacExtrasCost: result.hvacExtrasCost,
        siteCost: result.siteCost,
        group100Total: result.group100Total,
        kg200Total: result.kg200Total,
        kg300Cost: result.kg300Total,
        kg400Total: result.kg400Total,
        kg500Total: result.kg500Total,
        kg600Cost: result.kg600Cost,
        constructionSubtotal: result.constructionSubtotal,
        contractorCost: result.contractorCost,
        contingencyCost: result.contingencyCost,
        efkaInsuranceAmount: result.efkaInsuranceAmount,
        vatPercent: result.vatPercent,
    };
}
