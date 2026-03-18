import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { runEngineStressTest } from "@/utils/engineStressTest";
import { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, } from 'react-native';
import { Home, Ruler, MessageCircle, ChevronRight, RotateCcw } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useUserMode } from '@/contexts/UserModeContext';
import { useEstimate } from '@/contexts/EstimateContext';
const MODE_LABELS = {
    private: {
        title: 'Private User',
        icon: _jsx(Home, { size: 20, color: Colors.primary, strokeWidth: 1.8 }),
    },
    professional: {
        title: 'Architect / Professional',
        icon: _jsx(Ruler, { size: 20, color: Colors.terracotta, strokeWidth: 1.8 }),
    },
    guided: {
        title: 'Guided Estimate',
        icon: _jsx(MessageCircle, { size: 20, color: Colors.olive, strokeWidth: 1.8 }),
    },
};
const ALL_MODES = ['private', 'professional', 'guided'];
export default function SettingsScreen() {
    const { userMode, selectMode, clearMode } = useUserMode();
    const { resetAllData } = useEstimate();
    const handleModeChange = useCallback((mode) => {
        void selectMode(mode);
    }, [selectMode]);
    const handleResetProject = useCallback(() => {
        Alert.alert('Reset App?', 'This will delete all inputs, scenarios, and settings.', [
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
    return (_jsxs(ScrollView, { style: styles.container, contentContainerStyle: styles.content, children: [_jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "USER MODE" }), _jsx(View, { style: styles.card, children: ALL_MODES.map((mode, index) => {
                            const isActive = userMode === mode;
                            const label = MODE_LABELS[mode];
                            return (_jsxs(TouchableOpacity, { style: [
                                    styles.modeRow,
                                    index < ALL_MODES.length - 1 && styles.modeRowBorder,
                                ], activeOpacity: 0.6, onPress: () => handleModeChange(mode), testID: `settings-mode-${mode}`, children: [_jsxs(View, { style: styles.modeRowLeft, children: [label.icon, _jsx(Text, { style: styles.modeRowTitle, children: label.title })] }), _jsx(View, { style: [
                                            styles.radioOuter,
                                            isActive && styles.radioOuterActive,
                                        ], children: isActive && _jsx(View, { style: styles.radioInner }) })] }, mode));
                        }) })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "DATA" }), _jsx(View, { style: styles.card, children: _jsxs(TouchableOpacity, { style: styles.dangerRow, activeOpacity: 0.6, onPress: handleResetProject, testID: "settings-reset", children: [_jsxs(View, { style: styles.modeRowLeft, children: [_jsx(RotateCcw, { size: 20, color: Colors.danger, strokeWidth: 1.8 }), _jsx(Text, { style: styles.dangerText, children: "Reset Project" })] }), _jsx(ChevronRight, { size: 18, color: Colors.textTertiary })] }) }), _jsx(Text, { style: styles.hint, children: "Deletes all inputs, scenarios, and settings. The app will restart from the beginning." })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "ENGINE TEST" }), _jsx(View, { style: styles.card, children: _jsxs(TouchableOpacity, { style: styles.modeRow, activeOpacity: 0.6, onPress: () => {
                                console.log("BUTTON PRESSED");
                                runEngineStressTest(5);
                            }, children: [_jsx(View, { style: styles.modeRowLeft, children: _jsx(Text, { style: styles.modeRowTitle, children: "Run Engine Stress Test" }) }), _jsx(ChevronRight, { size: 18, color: Colors.textTertiary })] }) }), _jsx(Text, { style: styles.hint, children: "Runs 200 randomized building scenarios to validate cost calculations." })] })] }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
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
        color: Colors.textTertiary,
        letterSpacing: 0.8,
        marginBottom: 8,
        marginLeft: 4,
    },
    card: Object.assign({ backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden' }, Platform.select({
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
        borderBottomColor: Colors.borderLight,
    },
    modeRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modeRowTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterActive: {
        borderColor: Colors.terracotta,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.terracotta,
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
        color: Colors.danger,
    },
    hint: {
        fontSize: 12,
        fontWeight: '400',
        color: Colors.textTertiary,
        marginTop: 6,
        marginLeft: 4,
    },
});
