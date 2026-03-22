import { Stack } from 'expo-router';
import React from 'react';
import Colors from '@/constants/colors';
import HeaderCostDisplay from '@/components/HeaderCostDisplay';
import { useEstimate } from '@/contexts/EstimateContext';
import { useUserMode } from '@/contexts/UserModeContext';
import { getDisplayedTotalsForMode } from '@/utils/displayTotals';

function BreakdownHeaderTitle() {
  const { userMode } = useUserMode();
  const { projectTotalBeforeVat, totalCostInclVat, vatAmount, vatPercent, group100Total } = useEstimate();
  const displayedTotals = getDisplayedTotalsForMode({
    userMode,
    projectTotalBeforeVat,
    totalCostInclVat,
    vatAmount,
    vatPercent,
    group100Total,
  });

  return (
    <HeaderCostDisplay
      totalCost={displayedTotals.displayedProjectTotalBeforeVat}
      vatAmount={displayedTotals.displayedVatAmount}
    />
  );
}

export default function BreakdownLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.heroText,
        headerTitleStyle: { fontWeight: '600' as const },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => <BreakdownHeaderTitle />,
        }}
      />
    </Stack>
  );
}
