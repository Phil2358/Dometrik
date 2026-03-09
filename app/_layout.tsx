import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { EstimateProvider } from "@/contexts/EstimateContext";
import { UserModeProvider, useUserMode } from "@/contexts/UserModeContext";
import SplashAnimation from "@/components/SplashAnimation";
import IntroScreen from "@/components/IntroScreen";
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

  const handleSplashFinish = useCallback(() => {
    console.log('[App] Splash animation finished');
    setSplashDone(true);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      console.log('[App] Data loading complete, userMode:', userMode);
      setDataDone(true);
    }
  }, [isLoading, userMode]);

  const handleIntroStart = useCallback(() => {
    console.log('[App] Intro screen dismissed');
    setIntroDone(true);
  }, []);

  const handleModeSelect = useCallback(async (mode: UserMode) => {
    await selectMode(mode);
  }, [selectMode]);

  const ready = splashDone && dataDone;
  const showIntro = ready && !introDone;
  const showModeSelection = ready && introDone && !userMode;

  return (
    <>
      <RootLayoutNav />
      {showModeSelection && <ModeSelection onSelect={handleModeSelect} />}
      {showIntro && <IntroScreen onStart={handleIntroStart} />}
      {!splashDone && <SplashAnimation onFinish={handleSplashFinish} />}
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
