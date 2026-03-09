import { Stack } from 'expo-router';
import React from 'react';
import Colors from '@/constants/colors';

export default function CompareLayout() {
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
        options={{ title: 'Compare Scenarios' }}
      />
    </Stack>
  );
}
