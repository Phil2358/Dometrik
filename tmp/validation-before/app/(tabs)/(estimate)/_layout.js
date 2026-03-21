"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EstimateLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
const expo_router_1 = require("expo-router");
const colors_1 = __importDefault(require("@/constants/colors"));
const HeaderCostDisplay_1 = __importDefault(require("@/components/HeaderCostDisplay"));
const EstimateContext_1 = require("@/contexts/EstimateContext");
function EstimateHeaderTitle() {
    const { projectTotalBeforeVat, vatAmount } = (0, EstimateContext_1.useEstimate)();
    return (0, jsx_runtime_1.jsx)(HeaderCostDisplay_1.default, { totalCost: projectTotalBeforeVat, vatAmount: vatAmount });
}
function EstimateLayout() {
    return ((0, jsx_runtime_1.jsx)(expo_router_1.Stack, { screenOptions: {
            headerStyle: { backgroundColor: colors_1.default.primary },
            headerTintColor: colors_1.default.heroText,
            headerTitleStyle: { fontWeight: '600' },
        }, children: (0, jsx_runtime_1.jsx)(expo_router_1.Stack.Screen, { name: "index", options: {
                headerTitle: () => (0, jsx_runtime_1.jsx)(EstimateHeaderTitle, {}),
            } }) }));
}
