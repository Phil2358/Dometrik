import { Stack } from 'expo-router';
import React from 'react';
import Colors from '@/constants/colors';
import HeaderCostDisplay from '@/components/HeaderCostDisplay';
import { useEstimate } from '@/contexts/EstimateContext';

function EstimateHeaderTitle() {
  const { projectTotalBeforeVat, vatAmount } = useEstimate();
  return <HeaderCostDisplay totalCost={projectTotalBeforeVat} vatAmount={vatAmount} />;
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
