"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsScreen;
const jsx_runtime_1 = require("react/jsx-runtime");
const engineStressTest_1 = require("@/utils/engineStressTest");
const react_1 = require("react");
const react_native_1 = require("react-native");
const lucide_react_native_1 = require("lucide-react-native");
const colors_1 = __importDefault(require("@/constants/colors"));
const UserModeContext_1 = require("@/contexts/UserModeContext");
const EstimateContext_1 = require("@/contexts/EstimateContext");
const MODE_LABELS = {
    private: {
        title: 'Private User',
        icon: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Home, { size: 20, color: colors_1.default.primary, strokeWidth: 1.8 }),
    },
    professional: {
        title: 'Architect / Professional',
        icon: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Ruler, { size: 20, color: colors_1.default.terracotta, strokeWidth: 1.8 }),
    },
    guided: {
        title: 'Guided Estimate',
        icon: (0, jsx_runtime_1.jsx)(lucide_react_native_1.MessageCircle, { size: 20, color: colors_1.default.olive, strokeWidth: 1.8 }),
    },
};
const ALL_MODES = ['private', 'professional', 'guided'];
function SettingsScreen() {
    const { userMode, selectMode, clearMode } = (0, UserModeContext_1.useUserMode)();
    const { resetAllData } = (0, EstimateContext_1.useEstimate)();
    const handleModeChange = (0, react_1.useCallback)((mode) => {
        void selectMode(mode);
    }, [selectMode]);
    const handleResetProject = (0, react_1.useCallback)(() => {
        react_native_1.Alert.alert('Reset App?', 'This will delete all inputs, scenarios, and settings.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reset',
                style: 'destructive',
                onPress: async () => {
                    await resetAllData();
                    await clearMode();
                    console.log('[Settings] Full app reset completed');
                },
            },
        ]);
    }, [resetAllData, clearMode]);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.ScrollView, { style: styles.container, contentContainerStyle: styles.content, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.section, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.sectionTitle, children: "USER MODE" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.card, children: ALL_MODES.map((mode, index) => {
                            const isActive = userMode === mode;
                            const label = MODE_LABELS[mode];
                            return ((0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { style: [
                                    styles.modeRow,
                                    index < ALL_MODES.length - 1 && styles.modeRowBorder,
                                ], activeOpacity: 0.6, onPress: () => handleModeChange(mode), testID: `settings-mode-${mode}`, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.modeRowLeft, children: [label.icon, (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.modeRowTitle, children: label.title })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [
                                            styles.radioOuter,
                                            isActive && styles.radioOuterActive,
                                        ], children: isActive && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.radioInner }) })] }, mode));
                        }) })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.section, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.sectionTitle, children: "DATA" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.card, children: (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { style: styles.dangerRow, activeOpacity: 0.6, onPress: handleResetProject, testID: "settings-reset", children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.modeRowLeft, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.RotateCcw, { size: 20, color: colors_1.default.danger, strokeWidth: 1.8 }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.dangerText, children: "Reset Project" })] }), (0, jsx_runtime_1.jsx)(lucide_react_native_1.ChevronRight, { size: 18, color: colors_1.default.textTertiary })] }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.hint, children: "Deletes all inputs, scenarios, and settings. The app will restart from the beginning." })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.section, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.sectionTitle, children: "ENGINE TEST" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.card, children: (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { style: styles.modeRow, activeOpacity: 0.6, onPress: () => {
                                console.log("BUTTON PRESSED");
                                (0, engineStressTest_1.runEngineStressTest)(5);
                            }, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.modeRowLeft, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.modeRowTitle, children: "Run Engine Stress Test" }) }), (0, jsx_runtime_1.jsx)(lucide_react_native_1.ChevronRight, { size: 18, color: colors_1.default.textTertiary })] }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.hint, children: "Runs 200 randomized building scenarios to validate cost calculations." })] })] }));
}
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors_1.default.background,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors_1.default.textTertiary,
        letterSpacing: 0.8,
        marginBottom: 8,
        marginLeft: 4,
    },
    card: Object.assign({ backgroundColor: colors_1.default.card, borderRadius: 14, borderWidth: 1, borderColor: colors_1.default.borderLight, overflow: 'hidden' }, react_native_1.Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
        },
        android: {
            elevation: 1,
        },
        web: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
        },
    })),
    modeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        minHeight: 52,
    },
    modeRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors_1.default.borderLight,
    },
    modeRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modeRowTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: colors_1.default.text,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors_1.default.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterActive: {
        borderColor: colors_1.default.terracotta,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors_1.default.terracotta,
    },
    dangerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        minHeight: 52,
    },
    dangerText: {
        fontSize: 15,
        fontWeight: '500',
        color: colors_1.default.danger,
    },
    hint: {
        fontSize: 12,
        fontWeight: '400',
        color: colors_1.default.textTertiary,
        marginTop: 6,
        marginLeft: 4,
    },
});
