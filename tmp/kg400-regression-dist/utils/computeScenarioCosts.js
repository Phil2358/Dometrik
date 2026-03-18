import { calculateProjectCost } from "../calculator-engine/calculateProjectCost";
import { formatNumber } from "./format";
export function formatBasementSummary(storageBasementArea, parkingBasementArea, habitableBasementArea) {
    const parts = [];
    if (storageBasementArea > 0) {
        parts.push(`Storage ${formatNumber(storageBasementArea)} m²`);
    }
    if (parkingBasementArea > 0) {
        parts.push(`Parking ${formatNumber(parkingBasementArea)} m²`);
    }
    if (habitableBasementArea > 0) {
        parts.push(`Habitable ${formatNumber(habitableBasementArea)} m²`);
    }
    if (parts.length === 0) {
        return "No basement";
    }
    return parts.join(" · ");
}
export function computeScenarioCosts(config) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    const storageBasementArea = (_a = config.storageBasementArea) !== null && _a !== void 0 ? _a : 0;
    const parkingBasementArea = (_b = config.parkingBasementArea) !== null && _b !== void 0 ? _b : 0;
    const habitableBasementArea = (_c = config.habitableBasementArea) !== null && _c !== void 0 ? _c : 0;
    const mixedBasementArea = storageBasementArea +
        parkingBasementArea +
        habitableBasementArea;
    const basementArea = mixedBasementArea > 0
        ? mixedBasementArea
        : ((_d = config.basementArea) !== null && _d !== void 0 ? _d : 0);
    const result = calculateProjectCost(config);
    return {
        name: (_e = config.name) !== null && _e !== void 0 ? _e : "Scenario",
        totalCost: (_f = result.totalCost) !== null && _f !== void 0 ? _f : 0,
        locationName: (_g = config.locationName) !== null && _g !== void 0 ? _g : "",
        qualityName: (_h = config.qualityName) !== null && _h !== void 0 ? _h : "",
        mainArea: (_j = config.mainArea) !== null && _j !== void 0 ? _j : 0,
        terraceArea: (_k = config.terraceArea) !== null && _k !== void 0 ? _k : 0,
        balconyArea: (_l = config.balconyArea) !== null && _l !== void 0 ? _l : 0,
        basementArea,
        storageBasementArea,
        parkingBasementArea,
        habitableBasementArea,
        rawBuildingCost: (_m = result.rawBuildingCost) !== null && _m !== void 0 ? _m : 0,
        permitFee: (_o = result.permitFee) !== null && _o !== void 0 ? _o : 0,
        landscapingCost: (_p = result.landscapingCost) !== null && _p !== void 0 ? _p : 0,
        poolCost: (_q = result.poolCost) !== null && _q !== void 0 ? _q : 0,
        hvacExtrasCost: (_r = result.hvacExtrasCost) !== null && _r !== void 0 ? _r : 0,
        siteCost: (_s = result.siteCost) !== null && _s !== void 0 ? _s : 0
    };
}
