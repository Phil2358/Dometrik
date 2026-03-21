"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotFoundScreen;
const jsx_runtime_1 = require("react/jsx-runtime");
const expo_router_1 = require("expo-router");
const react_native_1 = require("react-native");
const colors_1 = __importDefault(require("@/constants/colors"));
function NotFoundScreen() {
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(expo_router_1.Stack.Screen, { options: { title: "Not Found" } }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.container, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.title, children: "This screen doesn't exist." }), (0, jsx_runtime_1.jsx)(expo_router_1.Link, { href: "/", style: styles.link, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.linkText, children: "Back to Estimate" }) })] })] }));
}
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: colors_1.default.background,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: colors_1.default.text,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
    linkText: {
        fontSize: 14,
        color: colors_1.default.accent,
        fontWeight: "600",
    },
});
