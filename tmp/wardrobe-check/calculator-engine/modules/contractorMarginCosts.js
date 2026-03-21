"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateContractorMarginCosts = calculateContractorMarginCosts;
function calculateContractorMarginCosts(input) {
    const contractorPercent = Math.max(0, input.contractorPercent);
    return {
        contractorPercent,
        contractorCost: Math.round(input.constructionSubtotal * (contractorPercent / 100))
    };
}
