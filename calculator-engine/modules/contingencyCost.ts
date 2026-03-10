export function calculateContingencyCost(
  constructionSubtotal: number,
  qualityLevel: "standard" | "premium" | "luxury"
) {

  let contingencyFactor = 0.05

  if (qualityLevel === "premium") {
    contingencyFactor = 0.07
  }

  if (qualityLevel === "luxury") {
    contingencyFactor = 0.10
  }

  const contingencyCost =
    constructionSubtotal * contingencyFactor

  return contingencyCost
}