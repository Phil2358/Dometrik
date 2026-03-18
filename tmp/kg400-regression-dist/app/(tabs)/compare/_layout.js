import { jsx as _jsx } from "react/jsx-runtime";
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';
export default function CompareLayout() {
    return (_jsx(Stack, { screenOptions: {
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.heroText,
            headerTitleStyle: { fontWeight: '600' },
        }, children: _jsx(Stack.Screen, { name: "index", options: { title: 'Compare Scenarios' } }) }));
}
