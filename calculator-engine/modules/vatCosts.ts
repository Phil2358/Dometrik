interface VatCostsInput {
  baseAmount: number
  vatPercent: number
}

export function calculateVatCosts(input: VatCostsInput) {
  const vatPercent = Math.max(0, input.vatPercent)
  const vatAmount = Math.round(input.baseAmount * (vatPercent / 100))

  return {
    vatPercent,
    vatAmount,
    totalIncludingVat: input.baseAmount + vatAmount,
  }
}
