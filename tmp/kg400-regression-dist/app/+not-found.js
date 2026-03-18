import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
export default function NotFoundScreen() {
    return (_jsxs(_Fragment, { children: [_jsx(Stack.Screen, { options: { title: "Not Found" } }), _jsxs(View, { style: styles.container, children: [_jsx(Text, { style: styles.title, children: "This screen doesn't exist." }), _jsx(Link, { href: "/", style: styles.link, children: _jsx(Text, { style: styles.linkText, children: "Back to Estimate" }) })] })] }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: Colors.background,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
    linkText: {
        fontSize: 14,
        color: Colors.accent,
        fontWeight: "600",
    },
});
