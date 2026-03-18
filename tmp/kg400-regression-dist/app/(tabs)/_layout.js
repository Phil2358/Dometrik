import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Tabs } from 'expo-router';
import { Calculator, BarChart3, GitCompareArrows, Settings } from 'lucide-react-native';
import Colors from '@/constants/colors';
export default function TabLayout() {
    return (_jsxs(Tabs, { screenOptions: {
            headerShown: false,
            tabBarActiveTintColor: Colors.accent,
            tabBarInactiveTintColor: Colors.textTertiary,
            tabBarStyle: {
                backgroundColor: Colors.white,
                borderTopColor: Colors.borderLight,
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
            },
        }, children: [_jsx(Tabs.Screen, { name: "(estimate)", options: {
                    title: 'Estimate',
                    tabBarIcon: ({ color, size }) => _jsx(Calculator, { size: size, color: color }),
                } }), _jsx(Tabs.Screen, { name: "breakdown", options: {
                    title: 'Breakdown',
                    tabBarIcon: ({ color, size }) => _jsx(BarChart3, { size: size, color: color }),
                } }), _jsx(Tabs.Screen, { name: "compare", options: {
                    title: 'Compare',
                    tabBarIcon: ({ color, size }) => _jsx(GitCompareArrows, { size: size, color: color }),
                } }), _jsx(Tabs.Screen, { name: "settings", options: {
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => _jsx(Settings, { size: size, color: color }),
                } })] }));
}
