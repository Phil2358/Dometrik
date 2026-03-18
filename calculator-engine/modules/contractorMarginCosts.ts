interface ContractorMarginCostsInput {
  constructionSubtotal: number
  contractorPercent: number
}

export function calculateContractorMarginCosts(input: ContractorMarginCostsInput) {
  const contractorPercent = Math.max(0, input.contractorPercent)

  return {
    contractorPercent,
    contractorCost: Math.round(input.constructionSubtotal * (contractorPercent / 100))
  }
}
