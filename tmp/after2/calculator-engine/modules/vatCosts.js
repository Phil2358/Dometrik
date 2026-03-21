"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateVatCosts = calculateVatCosts;
function calculateVatCosts(input) {
    const vatPercent = Math.max(0, input.vatPercent);
    const vatAmount = Math.round(input.baseAmount * (vatPercent / 100));
    return {
        vatPercent,
        vatAmount,
        totalIncludingVat: input.baseAmount + vatAmount,
    };
}
