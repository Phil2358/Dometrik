import { USER_MODE_CONFIGS, type UserMode } from '@/constants/userModes';

interface DisplayedTotalsInput {
  userMode: UserMode | null;
  projectTotalBeforeVat: number;
  totalCostInclVat: number;
  vatAmount: number;
  vatPercent: number;
  group100Total: number;
}

export interface DisplayedTotals {
  includeGroup100: boolean;
  displayedProjectTotalBeforeVat: number;
  displayedVatAmount: number;
  displayedTotalInclVat: number;
}

export function getDisplayedTotalsForMode({
  userMode,
  projectTotalBeforeVat,
  totalCostInclVat,
  vatAmount,
  vatPercent,
  group100Total,
}: DisplayedTotalsInput): DisplayedTotals {
  const includeGroup100 = userMode ? USER_MODE_CONFIGS[userMode].includeGroup100InDisplayedTotals : true;

  if (includeGroup100) {
    return {
      includeGroup100,
      displayedProjectTotalBeforeVat: projectTotalBeforeVat,
      displayedVatAmount: vatAmount,
      displayedTotalInclVat: totalCostInclVat,
    };
  }

  const hiddenGroup100Vat = group100Total * (vatPercent / 100);

  return {
    includeGroup100,
    displayedProjectTotalBeforeVat: projectTotalBeforeVat - group100Total,
    displayedVatAmount: vatAmount - hiddenGroup100Vat,
    displayedTotalInclVat: totalCostInclVat - group100Total - hiddenGroup100Vat,
  };
}
