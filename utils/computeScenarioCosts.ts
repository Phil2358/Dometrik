import { calculateProjectCost } from "../calculator-engine/calculateProjectCost"

export function computeScenarioCosts(config: any) {
  return calculateProjectCost(config)
}