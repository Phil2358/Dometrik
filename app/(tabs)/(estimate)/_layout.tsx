import { Stack } from 'expo-router';
import React from 'react';
import Colors from '@/constants/colors';
import HeaderCostDisplay from '@/components/HeaderCostDisplay';
import { useEstimate } from '@/contexts/EstimateContext';

const EFKA_REFERENCE_COST = 19000;
const EFKA_REFERENCE_AREA = 130;

function EstimateHeaderTitle() {
  const {
    totalCost,
    landValue,
    landAcquisitionCosts,
    landAcquisitionCostsMode,
    effectiveArea,
    efkaInsuranceManualCost,
    vatPercent,
  } = useEstimate();
  const group100Total = landValue + (landAcquisitionCostsMode === 'auto' ? landValue * 0.06 : landAcquisitionCosts);
  const efkaInsuranceAutoCost = Math.round(effectiveArea * (EFKA_REFERENCE_COST / EFKA_REFERENCE_AREA));
  const efkaInsuranceAmount = efkaInsuranceManualCost ?? efkaInsuranceAutoCost;
  const subtotalBeforeVat = totalCost + group100Total + efkaInsuranceAmount;
  const vatAmount = Math.round(subtotalBeforeVat * (vatPercent / 100));

  return <HeaderCostDisplay totalCost={subtotalBeforeVat} vatAmount={vatAmount} />;
}

export default function EstimateLayout() {
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
          headerTitle: () => <EstimateHeaderTitle />,
        }}
      />
    </Stack>
  );
}
