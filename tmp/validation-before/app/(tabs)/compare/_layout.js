"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CompareLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
const expo_router_1 = require("expo-router");
const colors_1 = __importDefault(require("@/constants/colors"));
function CompareLayout() {
    return ((0, jsx_runtime_1.jsx)(expo_router_1.Stack, { screenOptions: {
            headerStyle: { backgroundColor: colors_1.default.primary },
            headerTintColor: colors_1.default.heroText,
            headerTitleStyle: { fontWeight: '600' },
        }, children: (0, jsx_runtime_1.jsx)(expo_router_1.Stack.Screen, { name: "index", options: { title: 'Compare Scenarios' } }) }));
}
