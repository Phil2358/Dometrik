import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { migrateLegacyUserMode, type UserMode } from '@/constants/userModes';

export type { UserMode } from '@/constants/userModes';

const STORAGE_KEY_USER_MODE = '@user_mode';
const STORAGE_KEY_HAS_SEEN_INTRO = '@has_seen_intro';

export const [UserModeProvider, useUserMode] = createContextHook(() => {
  const [userMode, setUserMode] = useState<UserMode | null>(null);
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_USER_MODE),
      AsyncStorage.getItem(STORAGE_KEY_HAS_SEEN_INTRO),
    ]).then(([storedMode, storedIntro]) => {
      const resolvedMode = migrateLegacyUserMode(storedMode);
      if (resolvedMode) {
        setUserMode(resolvedMode);
        console.log('[UserMode] Loaded mode:', resolvedMode);
        if (resolvedMode !== storedMode) {
          void AsyncStorage.setItem(STORAGE_KEY_USER_MODE, resolvedMode);
        }
      } else {
        console.log('[UserMode] No stored mode found');
      }
      if (storedIntro === 'true') {
        setHasSeenIntro(true);
        console.log('[UserMode] Intro already seen');
      }
      setIsLoading(false);
    }).catch((e) => {
      console.log('[UserMode] Error loading data:', e);
      setIsLoading(false);
    });
  }, []);

  const selectMode = useCallback(async (mode: UserMode) => {
    setUserMode(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_USER_MODE, mode);
      console.log('[UserMode] Saved mode:', mode);
    } catch (e) {
      console.log('[UserMode] Error saving mode:', e);
    }
  }, []);

  const markIntroSeen = useCallback(async () => {
    setHasSeenIntro(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_HAS_SEEN_INTRO, 'true');
      console.log('[UserMode] Marked intro as seen');
    } catch (e) {
      console.log('[UserMode] Error saving intro state:', e);
    }
  }, []);

  const clearMode = useCallback(async () => {
    setUserMode(null);
    setHasSeenIntro(false);
    try {
      await AsyncStorage.multiRemove([STORAGE_KEY_USER_MODE, STORAGE_KEY_HAS_SEEN_INTRO]);
      console.log('[UserMode] Cleared mode and intro');
    } catch (e) {
      console.log('[UserMode] Error clearing mode:', e);
    }
  }, []);

  return useMemo(() => ({
    userMode,
    hasSeenIntro,
    isLoading,
    selectMode,
    markIntroSeen,
    clearMode,
  }), [userMode, hasSeenIntro, isLoading, selectMode, markIntroSeen, clearMode]);
});
