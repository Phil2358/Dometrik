"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBasementCosts = calculateBasementCosts;
const construction_1 = require("../../constants/construction");
function calculateBasementCosts(input) {
    var _a, _b, _c, _d, _e;
    const storageBasementArea = (_a = input.storageBasementArea) !== null && _a !== void 0 ? _a : 0;
    const parkingBasementArea = (_b = input.parkingBasementArea) !== null && _b !== void 0 ? _b : 0;
    const habitableBasementArea = (_c = input.habitableBasementArea) !== null && _c !== void 0 ? _c : 0;
    const hasMixedBasementInputs = input.storageBasementArea !== undefined ||
        input.parkingBasementArea !== undefined ||
        input.habitableBasementArea !== undefined;
    const totalBasementArea = hasMixedBasementInputs
        ? storageBasementArea + parkingBasementArea + habitableBasementArea
        : ((_d = input.basementArea) !== null && _d !== void 0 ? _d : 0);
    if (totalBasementArea <= 0) {
        return {
            basementStructureCost: 0
        };
    }
    const basementTypes = [...construction_1.BASEMENT_TYPES];
    const groundwaterConditions = [...construction_1.GROUNDWATER_CONDITIONS];
    const storageBasementType = basementTypes.find(b => b.id === "storage") || basementTypes[0];
    const parkingBasementType = basementTypes.find(b => b.id === "parking") || basementTypes[0];
    const habitableBasementType = basementTypes.find(b => b.id === "habitable") || basementTypes[0];
    const groundwater = groundwaterConditions.find(g => g.id === input.groundwaterConditionId) || groundwaterConditions[0];
    let basementStructureCost = storageBasementArea * storageBasementType.structureCostPerSqm +
        parkingBasementArea * parkingBasementType.structureCostPerSqm +
        habitableBasementArea * habitableBasementType.structureCostPerSqm;
    if (!hasMixedBasementInputs) {
        const basementType = basementTypes.find(b => b.id === input.basementTypeId) || storageBasementType;
        basementStructureCost =
            ((_e = input.basementArea) !== null && _e !== void 0 ? _e : 0) * basementType.structureCostPerSqm;
    }
    if (groundwater.basementCostMultiplier > 1) {
        basementStructureCost *= 1.08;
    }
    if (input.siteConditionIsRocky) {
        const rockyAdjustment = (0, construction_1.getBasementRockyAdjustment)(totalBasementArea);
        basementStructureCost =
            basementStructureCost * (1 + rockyAdjustment);
    }
    return {
        basementStructureCost: Math.round(basementStructureCost)
    };
}
