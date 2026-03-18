import { jsx as _jsx } from "react/jsx-runtime";
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';
import HeaderCostDisplay from '@/components/HeaderCostDisplay';
import { useEstimate } from '@/contexts/EstimateContext';
function BreakdownHeaderTitle() {
    const { totalCost, landValue, landAcquisitionCosts, landAcquisitionCostsMode } = useEstimate();
    const group100Total = landValue + (landAcquisitionCostsMode === 'auto' ? landValue * 0.06 : landAcquisitionCosts);
    return _jsx(HeaderCostDisplay, { totalCost: totalCost + group100Total });
}
export default function BreakdownLayout() {
    return (_jsx(Stack, { screenOptions: {
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.heroText,
            headerTitleStyle: { fontWeight: '600' },
        }, children: _jsx(Stack.Screen, { name: "index", options: {
                headerTitle: () => _jsx(BreakdownHeaderTitle, {}),
            } }) }));
}
