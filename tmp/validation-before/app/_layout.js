"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RootLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_query_1 = require("@tanstack/react-query");
const expo_router_1 = require("expo-router");
const SplashScreen = __importStar(require("expo-splash-screen"));
const react_1 = __importStar(require("react"));
const react_native_gesture_handler_1 = require("react-native-gesture-handler");
const EstimateContext_1 = require("@/contexts/EstimateContext");
const UserModeContext_1 = require("@/contexts/UserModeContext");
const SplashIntro_1 = __importDefault(require("@/components/SplashIntro"));
const ModeSelection_1 = __importDefault(require("@/components/ModeSelection"));
void SplashScreen.preventAutoHideAsync();
const queryClient = new react_query_1.QueryClient();
function RootLayoutNav() {
    return ((0, jsx_runtime_1.jsxs)(expo_router_1.Stack, { screenOptions: { headerBackTitle: "Back" }, children: [(0, jsx_runtime_1.jsx)(expo_router_1.Stack.Screen, { name: "(tabs)", options: { headerShown: false } }), (0, jsx_runtime_1.jsx)(expo_router_1.Stack.Screen, { name: "how-it-works", options: { presentation: "modal" } })] }));
}
function AppContent() {
    const [splashDone, setSplashDone] = (0, react_1.useState)(false);
    const [introDone, setIntroDone] = (0, react_1.useState)(false);
    const [dataDone, setDataDone] = (0, react_1.useState)(false);
    const { userMode, isLoading, selectMode } = (0, UserModeContext_1.useUserMode)();
    const prevUserModeRef = react_1.default.useRef(undefined);
    const handleSplashFinish = (0, react_1.useCallback)(() => {
        console.log('[App] Splash animation finished');
        setSplashDone(true);
    }, []);
    const handleIntroStart = (0, react_1.useCallback)(() => {
        console.log('[App] Intro screen dismissed');
        setIntroDone(true);
    }, []);
    (0, react_1.useEffect)(() => {
        if (!isLoading) {
            console.log('[App] Data loading complete, userMode:', userMode);
            setDataDone(true);
        }
    }, [isLoading, userMode]);
    (0, react_1.useEffect)(() => {
        if (prevUserModeRef.current !== undefined && prevUserModeRef.current !== null && userMode === null && dataDone) {
            console.log('[App] Reset detected, restarting onboarding flow');
            setSplashDone(false);
            setIntroDone(false);
        }
        prevUserModeRef.current = userMode;
    }, [userMode, dataDone]);
    const handleModeSelect = (0, react_1.useCallback)(async (mode) => {
        await selectMode(mode);
    }, [selectMode]);
    const showSplashIntro = !introDone;
    const showModeSelection = splashDone && introDone && dataDone && !userMode;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(RootLayoutNav, {}), showModeSelection && (0, jsx_runtime_1.jsx)(ModeSelection_1.default, { onSelect: handleModeSelect }), showSplashIntro && ((0, jsx_runtime_1.jsx)(SplashIntro_1.default, { onSplashDone: handleSplashFinish, onStart: handleIntroStart }))] }));
}
function RootLayout() {
    (0, react_1.useEffect)(() => {
        void SplashScreen.hideAsync();
    }, []);
    return ((0, jsx_runtime_1.jsx)(react_query_1.QueryClientProvider, { client: queryClient, children: (0, jsx_runtime_1.jsx)(react_native_gesture_handler_1.GestureHandlerRootView, { children: (0, jsx_runtime_1.jsx)(UserModeContext_1.UserModeProvider, { children: (0, jsx_runtime_1.jsx)(EstimateContext_1.EstimateProvider, { children: (0, jsx_runtime_1.jsx)(AppContent, {}) }) }) }) }));
}
