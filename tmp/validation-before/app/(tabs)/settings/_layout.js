"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
const expo_router_1 = require("expo-router");
function SettingsLayout() {
    return ((0, jsx_runtime_1.jsx)(expo_router_1.Stack, { children: (0, jsx_runtime_1.jsx)(expo_router_1.Stack.Screen, { name: "index", options: { title: 'Settings' } }) }));
}
