import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Copy, Pencil, X, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import type { QualityId } from '@/constants/construction';
import { useEstimate } from '@/contexts/EstimateContext';
import { formatNumber } from '@/utils/format';

function getScenarioQualityMeta(scenario: { qualityId: QualityId; benchmarkOverridePerSqm: number | null }) {
  const manualSuffix = scenario.benchmarkOverridePerSqm !== null ? ' · Manual' : '';

  switch (scenario.qualityId) {
    case 'economy':
      return { label: `Economy${manualSuffix}`, tone: scenario.benchmarkOverridePerSqm !== null ? Colors.accent : Colors.success };
    case 'midRange':
      return { label: `Mid-Range${manualSuffix}`, tone: Colors.accent };
    case 'luxury':
      return { label: `Luxury${manualSuffix}`, tone: scenario.benchmarkOverridePerSqm !== null ? Colors.accent : Colors.warning };
    default:
      return { label: `Benchmark${manualSuffix}`, tone: Colors.textTertiary };
  }
}

export default function ScenarioBar() {
  const {
    scenarios,
    activeScenarioIndex,
    switchScenario,
    cloneScenario,
    renameScenario,
    deleteScenario,
    canCloneScenario,
  } = useEstimate();

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

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

  const handleSwitch = useCallback((index: number) => {
    if (index === activeScenarioIndex) return;
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    switchScenario(index);
  }, [switchScenario, activeScenarioIndex]);

  const handleStartRename = useCallback((index: number) => {
    setEditingIndex(index);
    setEditName(scenarios[index]?.name ?? '');
  }, [scenarios]);

  const handleFinishRename = useCallback(() => {
    if (editingIndex !== null && editName.trim().length > 0) {
      renameScenario(editingIndex, editName.trim());
    }
    setEditingIndex(null);
    setEditName('');
  }, [editingIndex, editName, renameScenario]);

  const handleRequestDelete = useCallback((index: number) => {
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
    if (deleteConfirmIndex === null) return;
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
    ? scenarios[deleteConfirmIndex]?.name ?? 'this scenario'
    : '';

  return (
    <View style={s.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {scenarios.map((scenario, index) => {
          const isActive = index === activeScenarioIndex;
          const isEditing = editingIndex === index;
          const isOnlyScenario = scenarios.length <= 1;
          const qualityMeta = getScenarioQualityMeta(scenario);

          return (
            <View key={scenario.id} style={[s.tab, isActive && s.tabActive]}>
              <TouchableOpacity
                style={s.tabTouchable}
                onPress={() => handleSwitch(index)}
                activeOpacity={0.7}
                testID={`scenario-tab-${index}`}
              >
                {isEditing ? (
                  <TextInput
                    style={s.tabEditInput}
                    value={editName}
                    onChangeText={setEditName}
                    onBlur={handleFinishRename}
                    onSubmitEditing={handleFinishRename}
                    autoFocus
                    selectTextOnFocus
                    maxLength={24}
                    testID={`scenario-rename-input-${index}`}
                  />
                ) : (
                  <View style={s.tabContent}>
                    <Text
                      style={[s.tabName, isActive && s.tabNameActive]}
                      numberOfLines={1}
                    >
                      {scenario.name}
                    </Text>
                    <View style={s.tabMetaRow}>
                      <View style={[s.qualityBadge, { borderColor: qualityMeta.tone, backgroundColor: `${qualityMeta.tone}14` }]}>
                        <View style={[s.qualityBadgeDot, { backgroundColor: qualityMeta.tone }]} />
                        <Text style={[s.qualityBadgeText, { color: qualityMeta.tone }]}>{qualityMeta.label}</Text>
                      </View>
                      <Text style={[s.tabMetaValue, isActive && s.tabMetaValueActive]}>
                        {`${formatNumber(scenario.mainArea ?? 0)} m${String.fromCharCode(0x00B2)}`}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              {isActive && !isEditing && (
                <View style={s.tabActions}>
                  <TouchableOpacity
                    style={s.actionBtn}
                    onPress={() => handleStartRename(index)}
                    activeOpacity={0.6}
                    testID={`scenario-rename-${index}`}
                  >
                    <Pencil size={14} color={Colors.accent} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.actionBtn, isOnlyScenario && s.actionBtnDisabled]}
                    onPress={() => handleRequestDelete(index)}
                    activeOpacity={isOnlyScenario ? 1 : 0.6}
                    disabled={isOnlyScenario}
                    testID={`scenario-delete-${index}`}
                  >
                    <X size={15} color={isOnlyScenario ? Colors.borderLight : Colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {canCloneScenario && (
          <TouchableOpacity
            style={s.cloneBtn}
            onPress={handleClone}
            activeOpacity={0.7}
            testID="clone-scenario-btn"
          >
            <Copy size={14} color={Colors.accent} />
            <Text style={s.cloneBtnText}>Clone Scenario</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={deleteConfirmIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={handleCancelDelete}
        >
          <View style={s.modalCard}>
            <View style={s.modalIconWrap}>
              <Trash2 size={24} color={Colors.danger} />
            </View>
            <Text style={s.modalTitle}>Delete Scenario?</Text>
            <Text style={s.modalMessage}>
              "{deleteTargetName}" will be permanently removed. This action cannot be undone.
            </Text>
            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.modalCancelBtn}
                onPress={handleCancelDelete}
                activeOpacity={0.7}
                testID="delete-confirm-cancel"
              >
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.modalDeleteBtn}
                onPress={handleConfirmDelete}
                activeOpacity={0.7}
                testID="delete-confirm-delete"
              >
                <Text style={s.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
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
    alignItems: 'center' as const,
  },
  tab: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
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
    justifyContent: 'center' as const,
    paddingRight: 4,
  },
  tabContent: {
    gap: 4,
  },
  tabName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabNameActive: {
    color: Colors.accent,
    fontWeight: '700' as const,
  },
  tabEditInput: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.accent,
    padding: 0,
    minWidth: 90,
  },
  tabMetaRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  qualityBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
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
    fontWeight: '700' as const,
  },
  tabMetaValue: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
  },
  tabMetaValueActive: {
    color: Colors.accent,
  },
  tabActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 2,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  actionBtnDisabled: {
    opacity: 0.35,
  },
  cloneBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
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
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
    width: '100%' as const,
    maxWidth: 340,
    alignItems: 'center' as const,
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
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  modalMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row' as const,
    gap: 12,
    width: '100%' as const,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.inputBg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  modalDeleteBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.danger,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  modalDeleteText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
