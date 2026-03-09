import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { EstimateProvider } from "@/contexts/EstimateContext";
import { UserModeProvider, useUserMode } from "@/contexts/UserModeContext";
import SplashIntro from "@/components/SplashIntro";
import ModeSelection from "@/components/ModeSelection";
import type { UserMode } from "@/contexts/UserModeContext";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="how-it-works" options={{ presentation: "modal" }} />
    </Stack>
  );
}

function AppContent() {
  const [splashDone, setSplashDone] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [dataDone, setDataDone] = useState(false);
  const { userMode, isLoading, selectMode } = useUserMode();
  const prevUserModeRef = React.useRef<string | null | undefined>(undefined);

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

  const handleModeSelect = useCallback(async (mode: UserMode) => {
    await selectMode(mode);
  }, [selectMode]);

  const showSplashIntro = !introDone;
  const showModeSelection = splashDone && introDone && dataDone && !userMode;

  return (
    <>
      <RootLayoutNav />
      {showModeSelection && <ModeSelection onSelect={handleModeSelect} />}
      {showSplashIntro && (
        <SplashIntro
          onSplashDone={handleSplashFinish}
          onStart={handleIntroStart}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <UserModeProvider>
          <EstimateProvider>
            <AppContent />
          </EstimateProvider>
        </UserModeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
