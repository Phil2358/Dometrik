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
exports.default = ScenarioBar;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const Haptics = __importStar(require("expo-haptics"));
const lucide_react_native_1 = require("lucide-react-native");
const colors_1 = __importDefault(require("@/constants/colors"));
const EstimateContext_1 = require("@/contexts/EstimateContext");
const format_1 = require("@/utils/format");
function getScenarioQualityMeta(scenario) {
    const manualSuffix = scenario.benchmarkOverridePerSqm !== null ? ' · Manual' : '';
    switch (scenario.qualityId) {
        case 'economy':
            return { label: `Economy${manualSuffix}`, tone: scenario.benchmarkOverridePerSqm !== null ? colors_1.default.accent : colors_1.default.success };
        case 'midRange':
            return { label: `Mid-Range${manualSuffix}`, tone: colors_1.default.accent };
        case 'luxury':
            return { label: `Luxury${manualSuffix}`, tone: scenario.benchmarkOverridePerSqm !== null ? colors_1.default.accent : colors_1.default.warning };
        default:
            return { label: `Benchmark${manualSuffix}`, tone: colors_1.default.textTertiary };
    }
}
function ScenarioBar() {
    var _a, _b;
    const { scenarios, activeScenarioIndex, switchScenario, cloneScenario, renameScenario, deleteScenario, canCloneScenario, } = (0, EstimateContext_1.useEstimate)();
    const [editingIndex, setEditingIndex] = (0, react_1.useState)(null);
    const [editName, setEditName] = (0, react_1.useState)('');
    const [deleteConfirmIndex, setDeleteConfirmIndex] = (0, react_1.useState)(null);
    const handleClone = (0, react_1.useCallback)(() => {
        if (!canCloneScenario) {
            react_native_1.Alert.alert('Limit Reached', 'Maximum number of scenarios reached.');
            return;
        }
        if (react_native_1.Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        cloneScenario();
    }, [canCloneScenario, cloneScenario]);
    const handleSwitch = (0, react_1.useCallback)((index) => {
        if (index === activeScenarioIndex)
            return;
        if (react_native_1.Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        switchScenario(index);
    }, [switchScenario, activeScenarioIndex]);
    const handleStartRename = (0, react_1.useCallback)((index) => {
        var _a, _b;
        setEditingIndex(index);
        setEditName((_b = (_a = scenarios[index]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '');
    }, [scenarios]);
    const handleFinishRename = (0, react_1.useCallback)(() => {
        if (editingIndex !== null && editName.trim().length > 0) {
            renameScenario(editingIndex, editName.trim());
        }
        setEditingIndex(null);
        setEditName('');
    }, [editingIndex, editName, renameScenario]);
    const handleRequestDelete = (0, react_1.useCallback)((index) => {
        if (scenarios.length <= 1) {
            react_native_1.Alert.alert('Cannot Delete', 'At least one scenario must remain.');
            return;
        }
        if (react_native_1.Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setDeleteConfirmIndex(index);
    }, [scenarios.length]);
    const handleConfirmDelete = (0, react_1.useCallback)(() => {
        if (deleteConfirmIndex === null)
            return;
        if (react_native_1.Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        deleteScenario(deleteConfirmIndex);
        setDeleteConfirmIndex(null);
    }, [deleteConfirmIndex, deleteScenario]);
    const handleCancelDelete = (0, react_1.useCallback)(() => {
        setDeleteConfirmIndex(null);
    }, []);
    const deleteTargetName = deleteConfirmIndex !== null
        ? (_b = (_a = scenarios[deleteConfirmIndex]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'this scenario'
        : '';
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: s.container, children: [(0, jsx_runtime_1.jsxs)(react_native_1.ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: s.scrollContent, children: [scenarios.map((scenario, index) => {
                        var _a;
                        const isActive = index === activeScenarioIndex;
                        const isEditing = editingIndex === index;
                        const isOnlyScenario = scenarios.length <= 1;
                        const qualityMeta = getScenarioQualityMeta(scenario);
                        return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [s.tab, isActive && s.tabActive], children: [(0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { style: s.tabTouchable, onPress: () => handleSwitch(index), activeOpacity: 0.7, testID: `scenario-tab-${index}`, children: isEditing ? ((0, jsx_runtime_1.jsx)(react_native_1.TextInput, { style: s.tabEditInput, value: editName, onChangeText: setEditName, onBlur: handleFinishRename, onSubmitEditing: handleFinishRename, autoFocus: true, selectTextOnFocus: true, maxLength: 24, testID: `scenario-rename-input-${index}` })) : ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: s.tabContent, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [s.tabName, isActive && s.tabNameActive], numberOfLines: 1, children: scenario.name }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: s.tabMetaRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [s.qualityBadge, { borderColor: qualityMeta.tone, backgroundColor: `${qualityMeta.tone}14` }], children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [s.qualityBadgeDot, { backgroundColor: qualityMeta.tone }] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [s.qualityBadgeText, { color: qualityMeta.tone }], children: qualityMeta.label })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [s.tabMetaValue, isActive && s.tabMetaValueActive], children: `${(0, format_1.formatNumber)((_a = scenario.mainArea) !== null && _a !== void 0 ? _a : 0)} m${String.fromCharCode(0x00B2)}` })] })] })) }), isActive && !isEditing && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: s.tabActions, children: [(0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { style: s.actionBtn, onPress: () => handleStartRename(index), activeOpacity: 0.6, testID: `scenario-rename-${index}`, children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Pencil, { size: 14, color: colors_1.default.accent }) }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { style: [s.actionBtn, isOnlyScenario && s.actionBtnDisabled], onPress: () => handleRequestDelete(index), activeOpacity: isOnlyScenario ? 1 : 0.6, disabled: isOnlyScenario, testID: `scenario-delete-${index}`, children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.X, { size: 15, color: isOnlyScenario ? colors_1.default.borderLight : colors_1.default.textTertiary }) })] }))] }, scenario.id));
                    }), canCloneScenario && ((0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { style: s.cloneBtn, onPress: handleClone, activeOpacity: 0.7, testID: "clone-scenario-btn", children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.Copy, { size: 14, color: colors_1.default.accent }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: s.cloneBtnText, children: "Clone Scenario" })] }))] }), (0, jsx_runtime_1.jsx)(react_native_1.Modal, { visible: deleteConfirmIndex !== null, transparent: true, animationType: "fade", onRequestClose: handleCancelDelete, children: (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { style: s.modalOverlay, activeOpacity: 1, onPress: handleCancelDelete, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: s.modalCard, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: s.modalIconWrap, children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Trash2, { size: 24, color: colors_1.default.danger }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: s.modalTitle, children: "Delete Scenario?" }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: s.modalMessage, children: ["\"", deleteTargetName, "\" will be permanently removed. This action cannot be undone."] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: s.modalActions, children: [(0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { style: s.modalCancelBtn, onPress: handleCancelDelete, activeOpacity: 0.7, testID: "delete-confirm-cancel", children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: s.modalCancelText, children: "Cancel" }) }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { style: s.modalDeleteBtn, onPress: handleConfirmDelete, activeOpacity: 0.7, testID: "delete-confirm-delete", children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: s.modalDeleteText, children: "Delete" }) })] })] }) }) })] }));
}
const s = react_native_1.StyleSheet.create({
    container: {
        backgroundColor: colors_1.default.card,
        borderBottomWidth: 1,
        borderBottomColor: colors_1.default.borderLight,
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
        backgroundColor: colors_1.default.inputBg,
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
        backgroundColor: colors_1.default.accentBg,
        borderColor: colors_1.default.terracotta,
    },
    tabTouchable: {
        flexShrink: 1,
        minHeight: 34,
        justifyContent: 'center',
        paddingRight: 4,
    },
    tabContent: {
        gap: 4,
    },
    tabName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors_1.default.textSecondary,
    },
    tabNameActive: {
        color: colors_1.default.accent,
        fontWeight: '700',
    },
    tabEditInput: {
        fontSize: 14,
        fontWeight: '700',
        color: colors_1.default.accent,
        padding: 0,
        minWidth: 90,
    },
    tabMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    qualityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
        gap: 5,
    },
    qualityBadgeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    qualityBadgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    tabMetaValue: {
        fontSize: 11,
        fontWeight: '600',
        color: colors_1.default.textTertiary,
    },
    tabMetaValueActive: {
        color: colors_1.default.accent,
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
        backgroundColor: colors_1.default.card,
        borderRadius: 12,
        minHeight: 46,
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: colors_1.default.border,
        gap: 8,
    },
    cloneBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors_1.default.accent,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    modalCard: {
        backgroundColor: colors_1.default.card,
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
        color: colors_1.default.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 14,
        color: colors_1.default.textSecondary,
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
        backgroundColor: colors_1.default.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors_1.default.border,
    },
    modalCancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors_1.default.textSecondary,
    },
    modalDeleteBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors_1.default.danger,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalDeleteText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
