"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUserMode = exports.UserModeProvider = void 0;
const create_context_hook_1 = __importDefault(require("@nkzw/create-context-hook"));
const react_1 = require("react");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const STORAGE_KEY_USER_MODE = '@user_mode';
const STORAGE_KEY_HAS_SEEN_INTRO = '@has_seen_intro';
_a = (0, create_context_hook_1.default)(() => {
    const [userMode, setUserMode] = (0, react_1.useState)(null);
    const [hasSeenIntro, setHasSeenIntro] = (0, react_1.useState)(false);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        Promise.all([
            async_storage_1.default.getItem(STORAGE_KEY_USER_MODE),
            async_storage_1.default.getItem(STORAGE_KEY_HAS_SEEN_INTRO),
        ]).then(([storedMode, storedIntro]) => {
            if (storedMode === 'private' || storedMode === 'professional' || storedMode === 'guided') {
                setUserMode(storedMode);
                console.log('[UserMode] Loaded mode:', storedMode);
            }
            else {
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
    const selectMode = (0, react_1.useCallback)(async (mode) => {
        setUserMode(mode);
        try {
            await async_storage_1.default.setItem(STORAGE_KEY_USER_MODE, mode);
            console.log('[UserMode] Saved mode:', mode);
        }
        catch (e) {
            console.log('[UserMode] Error saving mode:', e);
        }
    }, []);
    const markIntroSeen = (0, react_1.useCallback)(async () => {
        setHasSeenIntro(true);
        try {
            await async_storage_1.default.setItem(STORAGE_KEY_HAS_SEEN_INTRO, 'true');
            console.log('[UserMode] Marked intro as seen');
        }
        catch (e) {
            console.log('[UserMode] Error saving intro state:', e);
        }
    }, []);
    const clearMode = (0, react_1.useCallback)(async () => {
        setUserMode(null);
        setHasSeenIntro(false);
        try {
            await async_storage_1.default.multiRemove([STORAGE_KEY_USER_MODE, STORAGE_KEY_HAS_SEEN_INTRO]);
            console.log('[UserMode] Cleared mode and intro');
        }
        catch (e) {
            console.log('[UserMode] Error clearing mode:', e);
        }
    }, []);
    return (0, react_1.useMemo)(() => ({
        userMode,
        hasSeenIntro,
        isLoading,
        selectMode,
        markIntroSeen,
        clearMode,
    }), [userMode, hasSeenIntro, isLoading, selectMode, markIntroSeen, clearMode]);
}), exports.UserModeProvider = _a[0], exports.useUserMode = _a[1];
