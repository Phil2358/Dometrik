"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TabLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
const expo_router_1 = require("expo-router");
const lucide_react_native_1 = require("lucide-react-native");
const colors_1 = __importDefault(require("@/constants/colors"));
function TabLayout() {
    return ((0, jsx_runtime_1.jsxs)(expo_router_1.Tabs, { screenOptions: {
            headerShown: false,
            tabBarActiveTintColor: colors_1.default.accent,
            tabBarInactiveTintColor: colors_1.default.textTertiary,
            tabBarStyle: {
                backgroundColor: colors_1.default.white,
                borderTopColor: colors_1.default.borderLight,
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
            },
        }, children: [(0, jsx_runtime_1.jsx)(expo_router_1.Tabs.Screen, { name: "(estimate)", options: {
                    title: 'Estimate',
                    tabBarIcon: ({ color, size }) => (0, jsx_runtime_1.jsx)(lucide_react_native_1.Calculator, { size: size, color: color }),
                } }), (0, jsx_runtime_1.jsx)(expo_router_1.Tabs.Screen, { name: "breakdown", options: {
                    title: 'Breakdown',
                    tabBarIcon: ({ color, size }) => (0, jsx_runtime_1.jsx)(lucide_react_native_1.BarChart3, { size: size, color: color }),
                } }), (0, jsx_runtime_1.jsx)(expo_router_1.Tabs.Screen, { name: "compare", options: {
                    title: 'Compare',
                    tabBarIcon: ({ color, size }) => (0, jsx_runtime_1.jsx)(lucide_react_native_1.GitCompareArrows, { size: size, color: color }),
                } }), (0, jsx_runtime_1.jsx)(expo_router_1.Tabs.Screen, { name: "settings", options: {
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (0, jsx_runtime_1.jsx)(lucide_react_native_1.Settings, { size: size, color: color }),
                } })] }));
}
