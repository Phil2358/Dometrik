import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, Modal, } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Copy, Pencil, X, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useEstimate } from '@/contexts/EstimateContext';
export default function ScenarioBar() {
    var _a, _b;
    const { scenarios, activeScenarioIndex, switchScenario, cloneScenario, renameScenario, deleteScenario, canCloneScenario, } = useEstimate();
    const [editingIndex, setEditingIndex] = useState(null);
    const [editName, setEditName] = useState('');
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState(null);
    const handleClone = useCallback(() => {
        if (!canCloneScenario) {
            Alert.alert('Limit Reached', 'Maximum number of scenarios reached.');
            return;
        }
        if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        cloneScenario();
    }, [canCloneScenario, cloneScenario]);
    const handleSwitch = useCallback((index) => {
        if (index === activeScenarioIndex)
            return;
        if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        switchScenario(index);
    }, [switchScenario, activeScenarioIndex]);
    const handleStartRename = useCallback((index) => {
        var _a, _b;
        setEditingIndex(index);
        setEditName((_b = (_a = scenarios[index]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '');
    }, [scenarios]);
    const handleFinishRename = useCallback(() => {
        if (editingIndex !== null && editName.trim().length > 0) {
            renameScenario(editingIndex, editName.trim());
        }
        setEditingIndex(null);
        setEditName('');
    }, [editingIndex, editName, renameScenario]);
    const handleRequestDelete = useCallback((index) => {
        if (scenarios.length <= 1) {
            Alert.alert('Cannot Delete', 'At least one scenario must remain.');
            return;
        }
        if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setDeleteConfirmIndex(index);
    }, [scenarios.length]);
    const handleConfirmDelete = useCallback(() => {
        if (deleteConfirmIndex === null)
            return;
        if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        deleteScenario(deleteConfirmIndex);
        setDeleteConfirmIndex(null);
    }, [deleteConfirmIndex, deleteScenario]);
    const handleCancelDelete = useCallback(() => {
        setDeleteConfirmIndex(null);
    }, []);
    const deleteTargetName = deleteConfirmIndex !== null
        ? (_b = (_a = scenarios[deleteConfirmIndex]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'this scenario'
        : '';
    return (_jsxs(View, { style: s.container, children: [_jsxs(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: s.scrollContent, children: [scenarios.map((scenario, index) => {
                        const isActive = index === activeScenarioIndex;
                        const isEditing = editingIndex === index;
                        const isOnlyScenario = scenarios.length <= 1;
                        return (_jsxs(View, { style: [s.tab, isActive && s.tabActive], children: [_jsx(TouchableOpacity, { style: s.tabTouchable, onPress: () => handleSwitch(index), activeOpacity: 0.7, testID: `scenario-tab-${index}`, children: isEditing ? (_jsx(TextInput, { style: s.tabEditInput, value: editName, onChangeText: setEditName, onBlur: handleFinishRename, onSubmitEditing: handleFinishRename, autoFocus: true, selectTextOnFocus: true, maxLength: 24, testID: `scenario-rename-input-${index}` })) : (_jsx(Text, { style: [s.tabName, isActive && s.tabNameActive], numberOfLines: 1, children: scenario.name })) }), isActive && !isEditing && (_jsxs(View, { style: s.tabActions, children: [_jsx(TouchableOpacity, { style: s.actionBtn, onPress: () => handleStartRename(index), activeOpacity: 0.6, testID: `scenario-rename-${index}`, children: _jsx(Pencil, { size: 14, color: Colors.accent }) }), _jsx(TouchableOpacity, { style: [s.actionBtn, isOnlyScenario && s.actionBtnDisabled], onPress: () => handleRequestDelete(index), activeOpacity: isOnlyScenario ? 1 : 0.6, disabled: isOnlyScenario, testID: `scenario-delete-${index}`, children: _jsx(X, { size: 15, color: isOnlyScenario ? Colors.borderLight : Colors.textTertiary }) })] }))] }, scenario.id));
                    }), canCloneScenario && (_jsxs(TouchableOpacity, { style: s.cloneBtn, onPress: handleClone, activeOpacity: 0.7, testID: "clone-scenario-btn", children: [_jsx(Copy, { size: 14, color: Colors.accent }), _jsx(Text, { style: s.cloneBtnText, children: "Clone Scenario" })] }))] }), _jsx(Modal, { visible: deleteConfirmIndex !== null, transparent: true, animationType: "fade", onRequestClose: handleCancelDelete, children: _jsx(TouchableOpacity, { style: s.modalOverlay, activeOpacity: 1, onPress: handleCancelDelete, children: _jsxs(View, { style: s.modalCard, children: [_jsx(View, { style: s.modalIconWrap, children: _jsx(Trash2, { size: 24, color: Colors.danger }) }), _jsx(Text, { style: s.modalTitle, children: "Delete Scenario?" }), _jsxs(Text, { style: s.modalMessage, children: ["\"", deleteTargetName, "\" will be permanently removed. This action cannot be undone."] }), _jsxs(View, { style: s.modalActions, children: [_jsx(TouchableOpacity, { style: s.modalCancelBtn, onPress: handleCancelDelete, activeOpacity: 0.7, testID: "delete-confirm-cancel", children: _jsx(Text, { style: s.modalCancelText, children: "Cancel" }) }), _jsx(TouchableOpacity, { style: s.modalDeleteBtn, onPress: handleConfirmDelete, activeOpacity: 0.7, testID: "delete-confirm-delete", children: _jsx(Text, { style: s.modalDeleteText, children: "Delete" }) })] })] }) }) })] }));
}
const s = StyleSheet.create({
    container: {
        backgroundColor: Colors.card,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        paddingTop: 10,
        paddingBottom: 10,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 10,
        alignItems: 'center',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBg,
        borderRadius: 12,
        minHeight: 46,
        paddingVertical: 6,
        paddingLeft: 16,
        paddingRight: 8,
        borderWidth: 1.5,
        borderColor: 'transparent',
        gap: 6,
    },
    tabActive: {
        backgroundColor: Colors.accentBg,
        borderColor: Colors.terracotta,
    },
    tabTouchable: {
        flexShrink: 1,
        minHeight: 34,
        justifyContent: 'center',
        paddingRight: 4,
    },
    tabName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    tabNameActive: {
        color: Colors.accent,
        fontWeight: '700',
    },
    tabEditInput: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.accent,
        padding: 0,
        minWidth: 90,
    },
    tabActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    actionBtnDisabled: {
        opacity: 0.35,
    },
    cloneBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 12,
        minHeight: 46,
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: Colors.border,
        gap: 8,
    },
    cloneBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.accent,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    modalCard: {
        backgroundColor: Colors.card,
        borderRadius: 18,
        paddingTop: 28,
        paddingBottom: 20,
        paddingHorizontal: 24,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
    modalIconWrap: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalCancelBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        backgroundColor: Colors.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    modalCancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    modalDeleteBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        backgroundColor: Colors.danger,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalDeleteText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
