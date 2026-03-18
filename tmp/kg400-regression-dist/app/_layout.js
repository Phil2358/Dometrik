import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { EstimateProvider } from "@/contexts/EstimateContext";
import { UserModeProvider, useUserMode } from "@/contexts/UserModeContext";
import SplashIntro from "@/components/SplashIntro";
import ModeSelection from "@/components/ModeSelection";
void SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();
function RootLayoutNav() {
    return (_jsxs(Stack, { screenOptions: { headerBackTitle: "Back" }, children: [_jsx(Stack.Screen, { name: "(tabs)", options: { headerShown: false } }), _jsx(Stack.Screen, { name: "how-it-works", options: { presentation: "modal" } })] }));
}
function AppContent() {
    const [splashDone, setSplashDone] = useState(false);
    const [introDone, setIntroDone] = useState(false);
    const [dataDone, setDataDone] = useState(false);
    const { userMode, isLoading, selectMode } = useUserMode();
    const prevUserModeRef = React.useRef(undefined);
    const handleSplashFinish = useCallback(() => {
        console.log('[App] Splash animation finished');
        setSplashDone(true);
    }, []);
    const handleIntroStart = useCallback(() => {
        console.log('[App] Intro screen dismissed');
        setIntroDone(true);
    }, []);
    useEffect(() => {
        if (!isLoading) {
            console.log('[App] Data loading complete, userMode:', userMode);
            setDataDone(true);
        }
    }, [isLoading, userMode]);
    useEffect(() => {
        if (prevUserModeRef.current !== undefined && prevUserModeRef.current !== null && userMode === null && dataDone) {
            console.log('[App] Reset detected, restarting onboarding flow');
            setSplashDone(false);
            setIntroDone(false);
        }
        prevUserModeRef.current = userMode;
    }, [userMode, dataDone]);
    const handleModeSelect = useCallback(async (mode) => {
        await selectMode(mode);
    }, [selectMode]);
    const showSplashIntro = !introDone;
    const showModeSelection = splashDone && introDone && dataDone && !userMode;
    return (_jsxs(_Fragment, { children: [_jsx(RootLayoutNav, {}), showModeSelection && _jsx(ModeSelection, { onSelect: handleModeSelect }), showSplashIntro && (_jsx(SplashIntro, { onSplashDone: handleSplashFinish, onStart: handleIntroStart }))] }));
}
export default function RootLayout() {
    useEffect(() => {
        void SplashScreen.hideAsync();
    }, []);
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(GestureHandlerRootView, { children: _jsx(UserModeProvider, { children: _jsx(EstimateProvider, { children: _jsx(AppContent, {}) }) }) }) }));
}
