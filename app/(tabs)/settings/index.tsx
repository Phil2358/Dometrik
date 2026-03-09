import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Home, Ruler, MessageCircle, ChevronRight, RotateCcw } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useUserMode, UserMode } from '@/contexts/UserModeContext';
import { useEstimate } from '@/contexts/EstimateContext';


const MODE_LABELS: Record<UserMode, { title: string; icon: React.ReactNode }> = {
  private: {
    title: 'Private User',
    icon: <Home size={20} color={Colors.primary} strokeWidth={1.8} />,
  },
  professional: {
    title: 'Architect / Professional',
    icon: <Ruler size={20} color={Colors.accent} strokeWidth={1.8} />,
  },
  guided: {
    title: 'Guided Estimate',
    icon: <MessageCircle size={20} color="#2D8B55" strokeWidth={1.8} />,
  },
};

const ALL_MODES: UserMode[] = ['private', 'professional', 'guided'];

export default function SettingsScreen() {
  const { userMode, selectMode, clearMode } = useUserMode();
  const { resetAllData } = useEstimate();

  const handleModeChange = useCallback((mode: UserMode) => {
    void selectMode(mode);
  }, [selectMode]);

  const handleResetProject = useCallback(() => {
    Alert.alert(
      'Reset App?',
      'This will delete all inputs, scenarios, and settings.',
      [
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
      ]
    );
  }, [resetAllData, clearMode]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>USER MODE</Text>
        <View style={styles.card}>
          {ALL_MODES.map((mode, index) => {
            const isActive = userMode === mode;
            const label = MODE_LABELS[mode];
            return (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeRow,
                  index < ALL_MODES.length - 1 && styles.modeRowBorder,
                ]}
                activeOpacity={0.6}
                onPress={() => handleModeChange(mode)}
                testID={`settings-mode-${mode}`}
              >
                <View style={styles.modeRowLeft}>
                  {label.icon}
                  <Text style={styles.modeRowTitle}>{label.title}</Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    isActive && styles.radioOuterActive,
                  ]}
                >
                  {isActive && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DATA</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.dangerRow}
            activeOpacity={0.6}
            onPress={handleResetProject}
            testID="settings-reset"
          >
            <View style={styles.modeRowLeft}>
              <RotateCcw size={20} color={Colors.danger} strokeWidth={1.8} />
              <Text style={styles.dangerText}>Reset Project</Text>
            </View>
            <ChevronRight size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>
          Deletes all inputs, scenarios, and settings. The app will restart from the beginning.
        </Text>
      </View>
    </ScrollView>
  );
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
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden' as const,
    ...Platform.select({
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
    }),
  },
  modeRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  modeRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modeRowLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  modeRowTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  radioOuterActive: {
    borderColor: Colors.accent,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent,
  },
  dangerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  dangerText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.danger,
  },
  hint: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
    marginTop: 6,
    marginLeft: 4,
  },
});
