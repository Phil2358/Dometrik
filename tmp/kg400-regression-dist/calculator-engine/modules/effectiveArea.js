import { BASEMENT_TYPES } from "../../constants/construction";
export function calculateEffectiveArea(input) {
    var _a, _b, _c, _d;
    const basementTypes = [...BASEMENT_TYPES];
    const storageBasementType = basementTypes.find(b => b.id === "storage") || basementTypes[0];
    const parkingBasementType = basementTypes.find(b => b.id === "parking") || basementTypes[0];
    const habitableBasementType = basementTypes.find(b => b.id === "habitable") || basementTypes[0];
    const hasMixedBasementInputs = input.storageBasementArea !== undefined ||
        input.parkingBasementArea !== undefined ||
        input.habitableBasementArea !== undefined;
    const weightedBasementArea = hasMixedBasementInputs
        ? ((_a = input.storageBasementArea) !== null && _a !== void 0 ? _a : 0) * storageBasementType.costFactor
            + ((_b = input.parkingBasementArea) !== null && _b !== void 0 ? _b : 0) * parkingBasementType.costFactor
            + ((_c = input.habitableBasementArea) !== null && _c !== void 0 ? _c : 0) * habitableBasementType.costFactor
        : ((_d = input.basementArea) !== null && _d !== void 0 ? _d : 0) * ((basementTypes.find(b => b.id === input.basementTypeId) || storageBasementType).costFactor);
    const effectiveArea = input.mainArea +
        input.terraceArea * 0.5 +
        input.balconyArea * 0.3 +
        weightedBasementArea;
    return effectiveArea;
}
