import { jsx as _jsx } from "react/jsx-runtime";
import { Stack } from 'expo-router';
export default function SettingsLayout() {
    return (_jsx(Stack, { children: _jsx(Stack.Screen, { name: "index", options: { title: 'Settings' } }) }));
}
