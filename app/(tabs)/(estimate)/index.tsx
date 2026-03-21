import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
  Linking,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ruler, Info, Mountain, TreePine, Bath, Flame, Waves, ExternalLink, Plug, Shield, Droplets, Truck, AlertTriangle, Home, Wrench, Settings, BookOpen, LandPlot, Sofa, ChevronDown, ChevronUp } from 'lucide-react-native';
import SliderInput from '@/components/SliderInput';
import ScenarioBar from '@/components/ScenarioBar';
import { useRouter } from 'expo-router';

import Svg, { Path, Rect, Circle, Line, G } from 'react-native-svg';
import Colors from '@/constants/colors';
import { useEstimate } from '@/contexts/EstimateContext';
import {
  LOCATIONS,
  QUALITY_LEVELS,
  type QualityId,
  DISCLAIMER_TEXT,
  SITE_CONDITIONS,
  SITE_CONDITIONS_TOOLTIP,
  HVAC_OPTIONS,
  HVAC_TOOLTIP,
  POOL_SIZE_OPTIONS,
  POOL_QUALITY_OPTIONS,
  POOL_TYPE_OPTIONS,
  POOL_TOOLTIP,
  COST_BASIS_TITLE,
  COST_BASIS_TEXT,
  COST_BASIS_SCOPE_TITLE,
  COST_BASIS_SCOPE_TEXT,
  PERMIT_DESIGN_TOOLTIP,
  PERMIT_DESIGN_LARGE_PROJECT_MESSAGE,
  PERMIT_DESIGN_CONTACT_URL,
  PERMIT_DESIGN_CONTACT_LABEL,
  PERMIT_DESIGN_BASELINE_AREA_MAX,
  UTILITY_CONNECTION_OPTIONS,
  UTILITY_CONNECTION_TOOLTIP,
  GROUNDWATER_CONDITIONS,
  GROUNDWATER_TOOLTIP,
  HIGH_GROUNDWATER_WARNING,
  UNSTABLE_SOIL_WARNING,
  SITE_ACCESSIBILITY_OPTIONS,
  SITE_ACCESSIBILITY_TOOLTIP,
  DIFFICULT_ACCESS_WARNING,
  VERY_DIFFICULT_ACCESS_WARNING,
  CONTRACTOR_MIN_PERCENTAGE,
  CONTRACTOR_MAX_PERCENTAGE,
  CONTRACTOR_STEP,
  formatSizeCorrectionFactorLabel,
} from '@/constants/construction';
import { formatCurrency, formatDecimal, formatNumber } from '@/utils/format';

const DATA_SECURITY_LEVEL_OPTIONS = [
  {
    id: 'essential',
    label: 'Essential',
    description: 'Basic data provision and core security preparation included in the base benchmark.',
  },
  {
    id: 'connected',
    label: 'Connected',
    description: 'Structured cabling, alarm provision, video entry, and selected connected security features.',
  },
  {
    id: 'integrated',
    label: 'Integrated',
    description: 'More comprehensive digital infrastructure, surveillance, access control, and coordinated system integration.',
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Use a custom allowance for this subsystem instead of the predefined package levels.',
  },
] as const;

const AUTOMATION_LEVEL_OPTIONS = [
  {
    id: 'none',
    label: 'No automation',
    description: 'Standard electrical installation without smart-home automation.',
  },
  {
    id: 'connected',
    label: 'Connected',
    description: 'Selected smart controls such as lighting, shutters, climate, or app-based control in limited scope.',
  },
  {
    id: 'integrated',
    label: 'Integrated',
    description: 'Broader smart-home coordination with centralized control, scenes, and multi-system automation.',
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Use a custom allowance for this subsystem instead of the predefined package levels.',
  },
] as const;

function sanitizeEstimateText(value: string): string {
  return value
    .replace(/\u00e2\u20ac\u201c/g, EN_DASH)
    .replace(/\u00e2\u20ac\u201d/g, '\u2014')
    .replace(/\u00e2\u2020\u2019/g, ARROW_SYMBOL)
    .replace(/m\u00c2\u00b2/g, SQUARE_METER_UNIT)
    .replace(/m\u00c3\u201a\u00c2\u00b2/g, SQUARE_METER_UNIT)
    .replace(/\u00c2\u00b7/g, MIDDLE_DOT)
    .replace(/\u00c3\u2014/g, MULTIPLY_SYMBOL)
    .replace(/\u00c2\u20ac/g, EURO_SYMBOL);
}

const EURO_SYMBOL = '\u20AC';
const MULTIPLY_SYMBOL = '\u00D7';
const MIDDLE_DOT = '\u00B7';
const EN_DASH = '\u2013';
const MINUS_SYMBOL = '\u2212';
const ARROW_SYMBOL = '\u2192';
const SQUARE_METER_UNIT = 'm\u00B2';

function getFeesQualityLabel(qualityId: QualityId): string {
  switch (qualityId) {
    case 'economy':
      return 'Economy';
    case 'midRange':
      return 'Mid-Range';
    case 'luxury':
      return 'Luxury';
    default:
      return 'Mid-Range';
  }
}

function formatEditableDecimal(value: number, digits = 1): string {
  if (Number.isInteger(value)) {
    return formatNumber(value);
  }
  return formatDecimal(value, digits);
}

function parseDecimalInput(text: string): number {
  const normalized = text.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const firstDotIndex = normalized.indexOf('.');
  const safeValue = firstDotIndex === -1
    ? normalized
    : `${normalized.slice(0, firstDotIndex + 1)}${normalized.slice(firstDotIndex + 1).replace(/\./g, '')}`;
  const parsed = parseFloat(safeValue);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function OverrideValueField({
  value,
  onChangeText,
  editable,
  unit,
  helperText,
  onSetEditable,
  automaticLabel = 'Automatic',
  editableLabel = 'Manual',
  inputTestID,
  actionTestID,
  keyboardType = 'numeric',
}: {
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  unit: string;
  helperText: string;
  onSetEditable: (nextEditable: boolean) => void;
  automaticLabel?: string;
  editableLabel?: string;
  inputTestID?: string;
  actionTestID?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
}) {
  const displayUnit = unit.trim();

  return (
    <>
      <View style={[styles.overrideInputRow, !editable && styles.costInputRowDisabled]}>
        <View style={styles.overrideModeSegment} testID={actionTestID}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onSetEditable(false)}
            style={[
              styles.overrideModeOption,
              !editable ? styles.overrideModeOptionActive : styles.overrideModeOptionInactive,
            ]}
            testID={actionTestID ? `${actionTestID}-automatic` : undefined}
          >
            <Text
              style={[
                styles.overrideModeOptionText,
                !editable ? styles.overrideModeOptionTextActive : styles.overrideModeOptionTextInactive,
              ]}
            >
              {automaticLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onSetEditable(true)}
            style={[
              styles.overrideModeOption,
              editable ? styles.overrideModeOptionActive : styles.overrideModeOptionInactive,
            ]}
            testID={actionTestID ? `${actionTestID}-manual` : undefined}
          >
            <Text
              style={[
                styles.overrideModeOptionText,
                editable ? styles.overrideModeOptionTextActive : styles.overrideModeOptionTextInactive,
              ]}
            >
              {editableLabel}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.overrideInputValueWrap}>
          <TextInput
            style={[styles.costInput, !editable && styles.costInputDisabled]}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            editable={editable}
            placeholder="0"
            placeholderTextColor={Colors.textTertiary}
            testID={inputTestID}
          />
          <Text style={[styles.costInputUnit, !editable && styles.costInputUnitDisabled]}>{displayUnit}</Text>
        </View>
      </View>
      {helperText ? (
        <Text style={styles.optionSubtext}>{helperText}</Text>
      ) : null}
    </>
  );
}

function SiteConditionIcon({ conditionId, size = 40, color }: { conditionId: string; size?: number; color: string }) {
  const secondaryColor = color + '66';
  const groundColor = color;

  switch (conditionId) {
    case 'flat_normal':
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <Line x1="4" y1="26" x2="36" y2="26" stroke={groundColor} strokeWidth="2" />
          <Rect x="8" y="16" width="6" height="10" rx="1" fill={secondaryColor} />
          <Rect x="17" y="12" width="8" height="14" rx="1" fill={groundColor} />
          <Rect x="28" y="18" width="5" height="8" rx="1" fill={secondaryColor} />
          <Line x1="4" y1="30" x2="36" y2="30" stroke={secondaryColor} strokeWidth="1" strokeDasharray="3,2" />
          <Line x1="4" y1="33" x2="36" y2="33" stroke={secondaryColor} strokeWidth="1" strokeDasharray="3,2" />
        </Svg>
      );
    case 'flat_rocky':
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <Line x1="4" y1="26" x2="36" y2="26" stroke={groundColor} strokeWidth="2" />
          <Rect x="14" y="14" width="12" height="12" rx="1" fill={secondaryColor} />
          <Path d="M6 33 L10 28 L14 31 L18 27 L22 30 L26 27 L30 29 L34 27 L36 33 Z" fill={groundColor} opacity={0.3} />
          <Circle cx="10" cy="30" r="2" fill={groundColor} opacity={0.5} />
          <Circle cx="20" cy="32" r="1.5" fill={groundColor} opacity={0.5} />
          <Circle cx="30" cy="30" r="2.5" fill={groundColor} opacity={0.5} />
          <Circle cx="15" cy="31" r="1" fill={groundColor} opacity={0.4} />
          <Circle cx="25" cy="31" r="1.8" fill={groundColor} opacity={0.4} />
        </Svg>
      );
    case 'inclined_normal':
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <Line x1="4" y1="32" x2="36" y2="20" stroke={groundColor} strokeWidth="2" />
          <G transform="translate(18, 10) rotate(0)">
            <Rect x="0" y="0" width="10" height="12" rx="1" fill={secondaryColor} />
            <Path d="M0 0 L5 -4 L10 0 Z" fill={groundColor} opacity={0.6} />
          </G>
          <Line x1="4" y1="36" x2="36" y2="24" stroke={secondaryColor} strokeWidth="1" strokeDasharray="3,2" />
          <Line x1="4" y1="39" x2="36" y2="27" stroke={secondaryColor} strokeWidth="1" strokeDasharray="3,2" />
        </Svg>
      );
    case 'inclined_rocky':
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <Line x1="4" y1="32" x2="36" y2="20" stroke={groundColor} strokeWidth="2" />
          <G transform="translate(18, 10)">
            <Rect x="0" y="0" width="10" height="12" rx="1" fill={secondaryColor} />
            <Path d="M0 0 L5 -4 L10 0 Z" fill={groundColor} opacity={0.6} />
          </G>
          <Path d="M4 38 L10 33 L14 36 L20 31 L26 34 L32 29 L36 32 L36 38 Z" fill={groundColor} opacity={0.3} />
          <Circle cx="8" cy="35" r="2" fill={groundColor} opacity={0.5} />
          <Circle cx="18" cy="33" r="1.5" fill={groundColor} opacity={0.5} />
          <Circle cx="28" cy="28" r="2" fill={groundColor} opacity={0.5} />
          <Circle cx="33" cy="26" r="1.2" fill={groundColor} opacity={0.4} />
        </Svg>
      );
    case 'inclined_sandy':
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <Line x1="4" y1="32" x2="36" y2="20" stroke={groundColor} strokeWidth="2" />
          <G transform="translate(18, 10)">
            <Rect x="0" y="0" width="10" height="12" rx="1" fill={secondaryColor} />
            <Path d="M0 0 L5 -4 L10 0 Z" fill={groundColor} opacity={0.6} />
          </G>
          {[6,10,14,18,22,26,30,34].map((x, i) => (
            <G key={i}>
              <Circle cx={x} cy={34 - (x - 4) * 0.375 + 1} r="0.8" fill={groundColor} opacity={0.35} />
              <Circle cx={x + 2} cy={34 - (x - 2) * 0.375 + 3} r="0.6" fill={groundColor} opacity={0.3} />
              <Circle cx={x - 1} cy={34 - (x - 5) * 0.375 + 5} r="0.7" fill={groundColor} opacity={0.25} />
            </G>
          ))}
          <Path d="M4 34 Q10 33 14 35 Q20 32 26 34 Q30 31 36 33 L36 38 L4 38 Z" fill={groundColor} opacity={0.15} />
        </Svg>
      );
    default:
      return null;
  }
}

function IntegerInputRow({
  label,
  value,
  onChangeValue,
  min = 0,
  mode,
  onReset,
}: {
  label: string;
  value: number;
  onChangeValue: (v: number) => void;
  min?: number;
  mode?: 'auto' | 'manual';
  onReset?: () => void;
}) {
  const handleDecrement = () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChangeValue(Math.max(min, value - 1));
  };
  const handleIncrement = () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChangeValue(value + 1);
  };

  return (
    <View style={styles.integerRow}>
      <View style={styles.integerInfo}>
        <View style={styles.integerLabelRow}>
          <Text style={styles.integerLabel}>{label}</Text>
        </View>
        {mode ? (
          <View style={styles.integerStatusRow}>
            <Text style={[styles.integerStatus, mode === 'manual' && styles.integerStatusManual]}>
              {mode === 'manual' ? 'Manual' : 'Auto'}
            </Text>
            {mode === 'manual' && onReset ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  onReset();
                }}
                testID={`reset-${label.toLowerCase()}`}
              >
                <Text style={styles.integerReset}>Reset</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={styles.integerControls}>
        <TouchableOpacity
          style={[styles.integerBtn, value <= min && styles.integerBtnDisabled]}
          onPress={handleDecrement}
          disabled={value <= min}
          activeOpacity={0.7}
          testID={`decrement-${label.toLowerCase()}`}
        >
          <Text style={[styles.integerBtnText, value <= min && styles.integerBtnTextDisabled]}>{MINUS_SYMBOL}</Text>
        </TouchableOpacity>
        <Text style={styles.integerValue}>{value}</Text>
        <TouchableOpacity
          style={styles.integerBtn}
          onPress={handleIncrement}
          activeOpacity={0.7}
          testID={`increment-${label.toLowerCase()}`}
        >
          <Text style={styles.integerBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function parseOptionalCurrencyInput(text: string): number | null {
  const cleaned = text.replace(/[^0-9]/g, '');
  const parsed = parseInt(cleaned, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function CollapsibleGroup({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.groupWrap}>
      <TouchableOpacity
        style={styles.groupHeader}
        activeOpacity={0.85}
        onPress={onToggle}
      >
        <View style={styles.groupHeaderLeft}>
          <View style={styles.groupIconWrap}>{icon}</View>
          <Text style={styles.groupTitle}>{title}</Text>
        </View>
        {expanded ? (
          <ChevronUp size={18} color={Colors.textSecondary} />
        ) : (
          <ChevronDown size={18} color={Colors.textSecondary} />
        )}
      </TouchableOpacity>
      {expanded ? <View style={styles.groupBody}>{children}</View> : null}
    </View>
  );
}

function HighlightSummaryRow({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.summaryHighlightCard}>
      <View style={styles.summaryHighlightHeader}>
        <Text style={styles.summaryHighlightLabel}>{label}</Text>
        <Text style={styles.summaryHighlightValue}>{value}</Text>
      </View>
      {subtitle ? (
        <Text style={styles.summaryHighlightSubtext}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export default function EstimateScreen() {
  const router = useRouter();
  const {
    locationId,
    setLocationId,
    qualityId,
    selectQuality,
    benchmarkOverridePerSqm,
    setBenchmarkOverridePerSqm,
    mainArea,
    setMainArea,
    terraceArea,
    setTerraceArea,
    balconyArea,
    setBalconyArea,
    storageBasementArea,
    setStorageBasementArea,
    parkingBasementArea,
    setParkingBasementArea,
    habitableBasementArea,
    setHabitableBasementArea,
    basementArea,
    includePool,
    setIncludePool,
    poolSizeId,
    setPoolSizeId,
    poolCustomArea,
    setPoolCustomArea,
    poolCustomDepth,
    setPoolCustomDepth,
    poolQualityId,
    setPoolQualityId,
    poolQualityOption,
    poolTypeId,
    setPoolTypeId,
    poolTypeOption,
    poolArea,
    poolDepth,
    contractorPercent,
    setContractorPercent,
    vatPercent,
    setVatPercent,
    vatAmount,
    setEfkaInsuranceManualCost,
    efkaInsuranceAutoCost,
    efkaInsuranceAmount,
    efkaInsuranceManualOverrideActive,
    setManualContingencyPercent,
    appliedContingencyPercent,
    siteConditionId,
    setSiteConditionId,
     siteCondition,
     landscapingArea,
     setLandscapingArea,
     landscapingCost,
     landValue,
     setLandValue,
     landAcquisitionCosts,
     setLandAcquisitionCosts,
     landAcquisitionAmount,
     landAcquisitionCostsMode,
     setLandAcquisitionCostsMode,
     bathrooms,
     bathroomsMode,
     setBathrooms,
     resetBathrooms,
    wcs,
    wcsMode,
    setWcs,
    resetWcs,
    bedroomCount,
    bedroomCountMode,
    setBedroomCount,
    resetBedroomCount,
    kitchenCount,
    kitchenCountMode,
    setKitchenCount,
    resetKitchenCount,
    customKitchenUnitCost,
    setCustomKitchenUnitCost,
    generalFurniture,
    setGeneralFurniture,
    generalFurnitureCustomized,
    setGeneralFurnitureMode,
    dataSecurityPackageLevel,
    setDataSecurityPackageLevel,
    dataSecurityManualQuote,
    setDataSecurityManualQuote,
    dataSecurityDefaultPackageCost,
    dataSecurityAppliedPackageCost,
    automationPackageLevel,
    setAutomationPackageLevel,
    automationManualQuote,
    setAutomationManualQuote,
    automationDefaultPackageCost,
    automationAppliedPackageCost,
    hvacSelections,
    toggleHvacOption,
    hvacCosts,
    totalHvacCost,
    location,
    quality,
    buildingArea,
    benchmarkPreviewPerQuality,
    plotSize,
    setPlotSize,
    sizeCorrectionFactor,
    correctedCostPerSqm,
    contractorCost,
    poolCost,
    permitDesignFee,
    totalCost,
    utilityConnectionId,
    setUtilityConnectionId,
    customUtilityCost,
    setCustomUtilityCost,
    utilityConnectionCost,
    contingencyPercent,
    recommendedContingencyCost,
    permitDesignBuildingArea,
    groundwaterConditionId,
    setGroundwaterConditionId,
    siteAccessibilityId,
    setSiteAccessibilityId,
    siteAccessibility,
    constructionSubtotal,
    contingencyCost,
    suggestedKitchenUnitCost,
    suggestedGeneralFurniture,
    kitchenUnitCost,
  } = useEstimate();
  const { width: windowWidth } = useWindowDimensions();
  const benchmarkInputRef = React.useRef<TextInput | null>(null);

  const isLargeProject = permitDesignBuildingArea > PERMIT_DESIGN_BASELINE_AREA_MAX;
  const sizeCorrectionLabel = formatSizeCorrectionFactorLabel(sizeCorrectionFactor);
  const displaySizeCorrectionLabel = sizeCorrectionLabel.toLowerCase() === 'base'
    ? '0%'
    : sanitizeEstimateText(sizeCorrectionLabel);
  const displayedLandAcquisitionCosts = landAcquisitionAmount;
  const feesQualityLabel = getFeesQualityLabel(qualityId);
  const appliedGeneralFurniture = generalFurnitureCustomized
    ? generalFurniture
    : suggestedGeneralFurniture;
  const benchmarkMode = benchmarkOverridePerSqm !== null ? 'manual' : 'default';
  const hasBenchmarkOverride = benchmarkOverridePerSqm !== null;
  const referenceBenchmarkPerSqm = benchmarkOverridePerSqm ?? quality.baseCostPerSqm;
  const useStackedBenchmarkCardLayout = windowWidth < 560;
  const qualityBenchmarkOptions: Array<{
    id: QualityId;
    title: string;
    descriptor: string;
    benchmarkValue: number;
    benchmarkLabel: string;
  }> = [
    {
      id: 'economy',
      title: 'Economy',
      descriptor: 'Cost-conscious residential benchmark',
      benchmarkValue: benchmarkPreviewPerQuality.economy ?? 0,
      benchmarkLabel: `${formatCurrency(benchmarkPreviewPerQuality.economy ?? 0)} /${SQUARE_METER_UNIT}`,
    },
    {
      id: 'midRange',
      title: 'Mid-Range',
      descriptor: 'Balanced residential benchmark',
      benchmarkValue: benchmarkPreviewPerQuality.midRange ?? 0,
      benchmarkLabel: `${formatCurrency(benchmarkPreviewPerQuality.midRange ?? 0)} /${SQUARE_METER_UNIT}`,
    },
    {
      id: 'luxury',
      title: 'Luxury',
      descriptor: 'High-spec residential benchmark',
      benchmarkValue: benchmarkPreviewPerQuality.luxury ?? 0,
      benchmarkLabel: `${formatCurrency(benchmarkPreviewPerQuality.luxury ?? 0)} /${SQUARE_METER_UNIT}`,
    },
  ];

  const handleLocationSelect = useCallback(
    (id: string) => {
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setLocationId(id);
    },
    [setLocationId],
  );

  const handleQualitySelect = useCallback(
    (id: QualityId, benchmarkValue: number) => {
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      if (benchmarkMode === 'manual') {
        setBenchmarkOverridePerSqm(benchmarkValue);
      }
      selectQuality(id);
    },
    [benchmarkMode, selectQuality, setBenchmarkOverridePerSqm],
  );

  const activateManualBenchmarkOverride = useCallback((defaultBenchmarkValue: number) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (!hasBenchmarkOverride) {
      setBenchmarkOverridePerSqm(defaultBenchmarkValue);
    }
    requestAnimationFrame(() => {
      benchmarkInputRef.current?.focus();
    });
  }, [hasBenchmarkOverride, setBenchmarkOverridePerSqm]);

  const handleSiteConditionSelect = useCallback(
    (id: string) => {
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setSiteConditionId(id);
    },
    [setSiteConditionId],
  );

  const [showCostBasisInfo, setShowCostBasisInfo] = React.useState<boolean>(false);
  const [showSiteConditionInfo, setShowSiteConditionInfo] = React.useState<boolean>(false);
  const [showHvacInfo, setShowHvacInfo] = React.useState<boolean>(false);
  const [showPoolInfo, setShowPoolInfo] = React.useState<boolean>(false);
  const [showPermitDesignInfo, setShowPermitDesignInfo] = React.useState<boolean>(false);
  const [showUtilityInfo, setShowUtilityInfo] = React.useState<boolean>(false);
  const [showGroundwaterInfo, setShowGroundwaterInfo] = React.useState<boolean>(false);
  const [showAccessibilityInfo, setShowAccessibilityInfo] = React.useState<boolean>(false);
  const [showLandPlotGroup, setShowLandPlotGroup] = React.useState<boolean>(true);
  const [showBuildingInteriorGroup, setShowBuildingInteriorGroup] = React.useState<boolean>(true);
  const [showPlotExternalGroup, setShowPlotExternalGroup] = React.useState<boolean>(true);
  const [showBenchmarkGroup, setShowBenchmarkGroup] = React.useState<boolean>(true);
  const [showOutdoorAdditionsGroup, setShowOutdoorAdditionsGroup] = React.useState<boolean>(true);
  const [showSystemsUpgradesGroup, setShowSystemsUpgradesGroup] = React.useState<boolean>(true);
  const [showFeesMarginsGroup, setShowFeesMarginsGroup] = React.useState<boolean>(true);

  const renderLandPlotGroup = () => (
    <CollapsibleGroup
      title="Land & Plot"
      icon={<LandPlot size={16} color={Colors.accent} />}
      expanded={showLandPlotGroup}
      onToggle={() => setShowLandPlotGroup((prev) => !prev)}
    >
      <View style={styles.groupSection}>
        <View style={styles.card}>
          <SliderInput
            label="Land cost"
            subtitle={formatCurrency(landValue)}
            value={landValue}
            onChangeValue={setLandValue}
            min={10000}
            max={1500000}
            step={1000}
            suffix={` ${EURO_SYMBOL}`}
            testID="slider-land-value"
          />

          <View style={styles.divider} />
          <Text style={styles.poolSubsectionTitle}>Incidental Land Acquisition Costs</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.utilityOptionRow, landAcquisitionCostsMode === 'auto' && styles.utilityOptionRowSelected]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setLandAcquisitionCostsMode('auto');
            }}
            testID="land-acquisition-mode-auto"
          >
            <View style={styles.optionInfo}>
              <Text style={[styles.optionLabel, landAcquisitionCostsMode === 'auto' && { color: Colors.accent }]}>
                Auto estimate (6%)
              </Text>
              <Text style={styles.optionSubtext}>Derived from land cost {MULTIPLY_SYMBOL} {formatDecimal(0.06, 2)}</Text>
            </View>
            <View style={[styles.radioOuter, landAcquisitionCostsMode === 'auto' && styles.radioOuterSelected]}>
              {landAcquisitionCostsMode === 'auto' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.utilityOptionRow, landAcquisitionCostsMode === 'manual' && styles.utilityOptionRowSelected]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              if (landAcquisitionCostsMode === 'auto') {
                setLandAcquisitionCosts(landAcquisitionAmount);
              }
              setLandAcquisitionCostsMode('manual');
            }}
            testID="land-acquisition-mode-manual"
          >
            <View style={styles.optionInfo}>
              <Text style={[styles.optionLabel, landAcquisitionCostsMode === 'manual' && { color: Colors.accent }]}>
                Manual override
              </Text>
              <Text style={styles.optionSubtext}>Enter incidental acquisition costs directly</Text>
            </View>
            <View style={[styles.radioOuter, landAcquisitionCostsMode === 'manual' && styles.radioOuterSelected]}>
              {landAcquisitionCostsMode === 'manual' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {landAcquisitionCostsMode === 'manual' ? (
            <>
              <View style={styles.costInputRow}>
                <TextInput
                  style={styles.costInput}
                  value={landAcquisitionCosts > 0 ? formatNumber(landAcquisitionCosts) : ''}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    setLandAcquisitionCosts(parseInt(cleaned, 10) || 0);
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textTertiary}
                  testID="land-acquisition-costs-input"
                />
                <Text style={styles.costInputUnit}> {EURO_SYMBOL}</Text>
              </View>
              <View style={styles.divider} />
            </>
          ) : null}

          <View style={styles.effectiveRow}>
            <Text style={styles.effectiveLabel}>Estimated Acquisition Costs</Text>
            <Text style={styles.effectiveValue}>{formatCurrency(displayedLandAcquisitionCosts)}</Text>
          </View>
          <Text style={styles.effectiveFormula}>
            {landAcquisitionCostsMode === 'auto'
              ? `${formatCurrency(displayedLandAcquisitionCosts)} (6% of ${formatCurrency(landValue)})`
              : 'Manual override value'}
          </Text>
        </View>
      </View>

      <View style={styles.groupSection}>
        <Text style={styles.groupSectionTitle}>Plot Size</Text>
        <View style={styles.card}>
          <SliderInput
            label="Plot size"
            subtitle=""
            value={plotSize}
            onChangeValue={setPlotSize}
            min={500}
            max={10000}
            step={100}
            suffix={SQUARE_METER_UNIT}
            testID="slider-plot-size"
          />
        </View>
      </View>
    </CollapsibleGroup>
  );

  const renderBuildingDefinitionGroup = () => (
    <CollapsibleGroup
      title="Building Definition"
      icon={<Home size={16} color={Colors.accent} />}
      expanded={showBuildingInteriorGroup}
      onToggle={() => setShowBuildingInteriorGroup((prev) => !prev)}
    >
      <View style={styles.groupSection}>
        <Text style={styles.groupSectionTitle}>Building Size</Text>
        <View style={[styles.card, styles.cardCompactTop]}>
          <SliderInput
            label="Building Area"
            subtitle="Total above-ground building area, including walls, measured to the outer face of the exterior structural walls. Basement, covered terraces, and balconies are entered separately."
            value={mainArea}
            onChangeValue={setMainArea}
            min={80}
            max={400}
            step={5}
            testID="slider-living-area"
          />
          <View style={styles.divider} />
          <Text style={styles.inlineSubsectionLabel}>Basement</Text>
          <SliderInput
            label="Storage/Technical Basement Area"
            subtitle="Technical rooms, storage, utility spaces"
            value={storageBasementArea}
            onChangeValue={setStorageBasementArea}
            min={0}
            max={250}
            step={5}
            badge="50%"
            testID="slider-storage-basement-area"
          />
          <View style={styles.divider} />
          <SliderInput
            label="Parking Basement Area"
            subtitle="Garage and vehicle storage areas"
            value={parkingBasementArea}
            onChangeValue={setParkingBasementArea}
            min={0}
            max={250}
            step={5}
            badge="65%"
            testID="slider-parking-basement-area"
          />
          <View style={styles.divider} />
          <SliderInput
            label="Habitable Basement Area"
            subtitle="Basement floor area used as habitable interior space. Storage and parking basement areas are treated separately if applicable."
            value={habitableBasementArea}
            onChangeValue={setHabitableBasementArea}
            min={0}
            max={250}
            step={5}
            badge="85%"
            testID="slider-habitable-basement-area"
          />
          {basementArea > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.effectiveRow}>
                <Text style={styles.effectiveLabel}>Basement Mix</Text>
                <Text style={styles.effectiveValue}>{`${formatNumber(basementArea)} ${SQUARE_METER_UNIT}`}</Text>
              </View>
              <Text style={styles.effectiveFormula}>
                {`${storageBasementArea > 0 ? `${formatNumber(storageBasementArea)} ${SQUARE_METER_UNIT} Storage/Technical Basement Area` : ''}${storageBasementArea > 0 && (parkingBasementArea > 0 || habitableBasementArea > 0) ? ` ${MIDDLE_DOT} ` : ''}${parkingBasementArea > 0 ? `${formatNumber(parkingBasementArea)} ${SQUARE_METER_UNIT} Parking Basement Area` : ''}${parkingBasementArea > 0 && habitableBasementArea > 0 ? ` ${MIDDLE_DOT} ` : ''}${habitableBasementArea > 0 ? `${formatNumber(habitableBasementArea)} ${SQUARE_METER_UNIT} Habitable Basement Area` : ''}`}
              </Text>
            </>
          )}
          <View style={styles.divider} />
          <SliderInput
            label="Covered Terraces"
            subtitle="Counted at 50% of area"
            value={terraceArea}
            onChangeValue={setTerraceArea}
            badge="50%"
            min={0}
            max={120}
            step={5}
            testID="slider-terrace-area"
          />
          <View style={styles.divider} />
          <SliderInput
            label="Balcony Area"
            subtitle="Open balconies, cantilevered spaces"
            value={balconyArea}
            onChangeValue={setBalconyArea}
            badge="30%"
            min={0}
            max={80}
            step={5}
            testID="slider-balcony-area"
          />
        </View>
      </View>

      <View style={styles.groupSection}>
        <Text style={styles.groupSectionTitle}>Interior Program & Furnishing</Text>
        <View style={[styles.card, styles.cardCompactTop]}>
          <IntegerInputRow
            label="Bedrooms"
            value={bedroomCount}
            onChangeValue={setBedroomCount}
            min={1}
            mode={bedroomCountMode}
            onReset={resetBedroomCount}
          />
          <View style={styles.divider} />
          <IntegerInputRow
            label="Bathrooms"
            value={bathrooms}
            onChangeValue={setBathrooms}
            min={0}
            mode={bathroomsMode}
            onReset={resetBathrooms}
          />
          <View style={styles.divider} />
          <IntegerInputRow
            label="WCs (guest WC)"
            value={wcs}
            onChangeValue={setWcs}
            min={0}
            mode={wcsMode}
            onReset={resetWcs}
          />
        </View>
        <View style={[styles.card, styles.cardCompactTop]}>
          <IntegerInputRow
            label="Kitchens"
            value={kitchenCount}
            onChangeValue={setKitchenCount}
            min={0}
            mode={kitchenCountMode}
            onReset={resetKitchenCount}
          />
          {kitchenCount > 0 ? (
            <>
              <View style={styles.divider} />
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Kitchen Unit Cost</Text>
              </View>
              <OverrideValueField
                value={formatNumber(kitchenUnitCost)}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  const num = parseInt(cleaned, 10);
                  if (isNaN(num) || num <= 0) {
                    setCustomKitchenUnitCost(null);
                  } else {
                    setCustomKitchenUnitCost(num);
                  }
                }}
                editable={customKitchenUnitCost !== null}
                unit={` ${EURO_SYMBOL}`}
                helperText={customKitchenUnitCost !== null
                  ? `Automatic reference: ${formatCurrency(suggestedKitchenUnitCost)} quality and area adjusted.`
                  : `Suggested ${formatCurrency(suggestedKitchenUnitCost)} ${MIDDLE_DOT} quality and area adjusted`}
                onSetEditable={(nextEditable) => {
                  if (Platform.OS !== 'web') {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setCustomKitchenUnitCost(nextEditable ? suggestedKitchenUnitCost : null);
                }}
                inputTestID="kitchen-unit-cost-input"
                actionTestID="kitchen-unit-cost-toggle"
              />
            </>
          ) : null}
          <View style={styles.divider} />
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>General Furniture</Text>
          </View>
          <OverrideValueField
            value={formatNumber(appliedGeneralFurniture)}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, '');
              setGeneralFurniture(parseInt(cleaned, 10) || 0);
            }}
            editable={generalFurnitureCustomized}
            unit={` ${EURO_SYMBOL}`}
            helperText={generalFurnitureCustomized
              ? `Automatic reference: ${formatCurrency(suggestedGeneralFurniture)} based on bedrooms and building area.`
              : 'Automatically recommended based on bedrooms and building area.'}
            onSetEditable={(nextEditable) => {
              if (Platform.OS !== 'web') {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setGeneralFurnitureMode(nextEditable);
            }}
            inputTestID="general-furniture-base-input"
            actionTestID="general-furniture-manual-toggle"
          />
        </View>
      </View>
    </CollapsibleGroup>
  );

  const renderSystemsUpgradesGroup = () => (
    <CollapsibleGroup
      title="Systems & Upgrades"
      icon={<Settings size={16} color={Colors.accent} />}
      expanded={showSystemsUpgradesGroup}
      onToggle={() => setShowSystemsUpgradesGroup((prev) => !prev)}
    >
      <View style={styles.groupSection}>
        <Text style={styles.groupSectionTitle}>Digital Infrastructure & Security</Text>
        <Text style={styles.groupSectionSubtitle}>Essential level is included in the base benchmark (0% adjustment).</Text>
        <View style={styles.card}>
          {DATA_SECURITY_LEVEL_OPTIONS.map((option, index) => {
            const isSelected = dataSecurityPackageLevel === option.id;
            return (
              <React.Fragment key={option.id}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.utilityOptionRow, isSelected && styles.utilityOptionRowSelected]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setDataSecurityPackageLevel(option.id);
                  }}
                  testID={`data-security-package-${option.id}`}
                >
                  <View style={styles.optionInfo}>
                    <Text style={[styles.optionLabel, isSelected && { color: Colors.accent }]}>
                      {option.label}
                    </Text>
                    <Text style={styles.optionSubtext}>{option.description}</Text>
                  </View>
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
          {dataSecurityPackageLevel === 'custom' ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.optionSubtext}>
                Enter a custom uplift above the benchmark-included baseline for Digital Infrastructure & Security.
              </Text>
              <View style={styles.costInputRow}>
                <TextInput
                  style={styles.costInput}
                  value={dataSecurityManualQuote !== null ? formatNumber(dataSecurityManualQuote) : ''}
                  onChangeText={(text) => {
                    setDataSecurityManualQuote(parseOptionalCurrencyInput(text));
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textTertiary}
                  testID="data-security-quote-input"
                />
                <Text style={styles.costInputUnit}> {EURO_SYMBOL}</Text>
              </View>
              <Text style={styles.optionSubtext}>Custom uplift above baseline</Text>
              <Text style={styles.optionSubtext}>
                {`Total subgroup amount with custom uplift: ${formatCurrency(dataSecurityAppliedPackageCost)}`}
              </Text>
            </>
          ) : dataSecurityPackageLevel !== 'essential' ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.optionSubtext}>
                {`Total subgroup amount for selected level: ${formatCurrency(dataSecurityDefaultPackageCost)}.`}
              </Text>
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.groupSection}>
        <Text style={styles.groupSectionTitle}>Smart Control & Automation</Text>
        <Text style={styles.groupSectionSubtitle}>No automation applies the base assumption (0% adjustment).</Text>
        <View style={styles.card}>
          {AUTOMATION_LEVEL_OPTIONS.map((option, index) => {
            const isSelected = automationPackageLevel === option.id;
            return (
              <React.Fragment key={option.id}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.utilityOptionRow, isSelected && styles.utilityOptionRowSelected]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setAutomationPackageLevel(option.id);
                  }}
                  testID={`automation-package-${option.id}`}
                >
                  <View style={styles.optionInfo}>
                    <Text style={[styles.optionLabel, isSelected && { color: Colors.accent }]}>
                      {option.label}
                    </Text>
                    <Text style={styles.optionSubtext}>{option.description}</Text>
                  </View>
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
          {automationPackageLevel === 'custom' ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.optionSubtext}>
                Enter a custom amount for Smart Control & Automation.
              </Text>
              <View style={styles.costInputRow}>
                <TextInput
                  style={styles.costInput}
                  value={automationManualQuote !== null ? formatNumber(automationManualQuote) : ''}
                  onChangeText={(text) => {
                    setAutomationManualQuote(parseOptionalCurrencyInput(text));
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textTertiary}
                  testID="automation-quote-input"
                />
                <Text style={styles.costInputUnit}> {EURO_SYMBOL}</Text>
              </View>
              <Text style={styles.optionSubtext}>Custom amount used in the calculation</Text>
              <Text style={styles.optionSubtext}>
                {`Total subgroup amount with custom input: ${formatCurrency(automationAppliedPackageCost)}`}
              </Text>
            </>
          ) : automationPackageLevel !== 'none' ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.optionSubtext}>
                {`Fixed uplift amount for selected level: ${formatCurrency(automationDefaultPackageCost)}.`}
              </Text>
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.groupSection}>
        <View style={styles.groupSectionHeader}>
          <Text style={styles.groupSectionHeaderTitle}>Energy Systems</Text>
          <TouchableOpacity
            onPress={() => setShowHvacInfo(!showHvacInfo)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID="hvac-info-btn"
          >
            <Info size={15} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
        {showHvacInfo && (
          <View style={styles.tooltipCard}>
            <Text style={styles.tooltipText}>{sanitizeEstimateText(HVAC_TOOLTIP)}</Text>
          </View>
        )}
        <View style={styles.card}>
          <Text style={styles.hvacBaseNote}>Base: Heat pump + fan-coil / VRV system included</Text>
          {HVAC_OPTIONS.map((opt, idx) => {
            const isEnabled = hvacSelections[opt.id] ?? false;
            const hvacItem = hvacCosts.find((h) => h.option.id === opt.id);
            return (
              <React.Fragment key={opt.id}>
                {idx > 0 && <View style={styles.divider} />}
                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionLabel}>{opt.name}</Text>
                    <Text style={styles.optionSubtext}>
                      {isEnabled && hvacItem
                        ? `${formatCurrency(hvacItem.cost)} ${MIDDLE_DOT} ${opt.description}`
                        : opt.description}
                    </Text>
                  </View>
                  <Switch
                    value={isEnabled}
                    onValueChange={() => {
                      if (Platform.OS !== 'web') {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      toggleHvacOption(opt.id);
                    }}
                    trackColor={{ false: Colors.border, true: Colors.accent }}
                    thumbColor={Colors.white}
                    testID={`hvac-toggle-${opt.id}`}
                  />
                </View>
              </React.Fragment>
            );
          })}
          {totalHvacCost > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.effectiveRow}>
                <Text style={styles.effectiveLabel}>Energy Systems Total</Text>
                <Text style={styles.effectiveValue}>{formatCurrency(totalHvacCost)}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </CollapsibleGroup>
  );

  const renderSiteParametersGroup = () => (
    <CollapsibleGroup
      title="Site Parameters"
      icon={<Mountain size={16} color={Colors.accent} />}
      expanded={showPlotExternalGroup}
      onToggle={() => setShowPlotExternalGroup((prev) => !prev)}
    >
      <View style={styles.groupSection}>
        <Text style={styles.groupSectionTitle}>Site Conditions & Infrastructure</Text>

        <View style={styles.groupNestedBlock}>
          <View style={styles.groupInlineHeader}>
            <Text style={styles.groupInlineTitle}>Slope & Soil Type</Text>
            <TouchableOpacity
              onPress={() => setShowSiteConditionInfo(!showSiteConditionInfo)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID="site-condition-info-btn"
            >
              <Info size={15} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          {showSiteConditionInfo && (
            <View style={styles.tooltipCard}>
              <Text style={styles.tooltipText}>{sanitizeEstimateText(SITE_CONDITIONS_TOOLTIP)}</Text>
            </View>
          )}
          <View style={styles.siteConditionsGrid}>
            {SITE_CONDITIONS.map((cond) => {
              const isSelected = siteConditionId === cond.id;
              return (
                <TouchableOpacity
                  key={cond.id}
                  activeOpacity={0.7}
                  style={[styles.siteCondCard, isSelected && styles.siteCondCardSelected]}
                  onPress={() => handleSiteConditionSelect(cond.id)}
                  testID={`site-condition-${cond.id}`}
                >
                  <View style={[styles.siteCondIconWrap, isSelected && styles.siteCondIconWrapSelected]}>
                    <SiteConditionIcon
                      conditionId={cond.id}
                      size={40}
                      color={isSelected ? Colors.accent : Colors.primary}
                    />
                  </View>
                  <View style={styles.siteCondTextWrap}>
                    <Text style={[styles.siteCondName, isSelected && styles.siteCondNameSelected]}>
                      {cond.name}
                    </Text>
                    <Text style={[styles.siteCondDesc, isSelected && styles.siteCondDescSelected]}>
                      {cond.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          {siteConditionId === 'inclined_sandy' && (
            <View style={styles.warningCard}>
              <AlertTriangle size={16} color={Colors.warning} />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Important notice</Text>
                <Text style={styles.warningText}>{sanitizeEstimateText(UNSTABLE_SOIL_WARNING)}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.groupNestedBlock}>
          <View style={styles.groupInlineHeader}>
            <Text style={styles.groupInlineTitle}>Groundwater</Text>
            <TouchableOpacity
              onPress={() => setShowGroundwaterInfo(!showGroundwaterInfo)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID="groundwater-info-btn"
            >
              <Info size={15} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          {showGroundwaterInfo && (
            <View style={styles.tooltipCard}>
              <Text style={styles.tooltipText}>{sanitizeEstimateText(GROUNDWATER_TOOLTIP)}</Text>
            </View>
          )}
          <View style={styles.card}>
            {GROUNDWATER_CONDITIONS.map((gw, idx) => {
              const isSelected = groundwaterConditionId === gw.id;
              return (
                <React.Fragment key={gw.id}>
                  {idx > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.utilityOptionRow, isSelected && styles.utilityOptionRowSelected]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setGroundwaterConditionId(gw.id);
                    }}
                    testID={`groundwater-${gw.id}`}
                  >
                    <View style={styles.optionInfo}>
                      <Text style={[styles.optionLabel, isSelected && { color: Colors.accent }]}>{gw.name}</Text>
                      <Text style={styles.optionSubtext}>{gw.description}</Text>
                    </View>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
          {groundwaterConditionId === 'high' && (
            <View style={styles.warningCard}>
              <AlertTriangle size={16} color={Colors.warning} />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Important notice</Text>
                <Text style={styles.warningText}>{sanitizeEstimateText(HIGH_GROUNDWATER_WARNING)}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.groupNestedBlock}>
          <View style={styles.groupInlineHeader}>
            <Text style={styles.groupInlineTitle}>Accessibility</Text>
            <TouchableOpacity
              onPress={() => setShowAccessibilityInfo(!showAccessibilityInfo)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID="accessibility-info-btn"
            >
              <Info size={15} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          {showAccessibilityInfo && (
            <View style={styles.tooltipCard}>
              <Text style={styles.tooltipText}>{sanitizeEstimateText(SITE_ACCESSIBILITY_TOOLTIP)}</Text>
            </View>
          )}
          <View style={styles.card}>
            {SITE_ACCESSIBILITY_OPTIONS.map((acc, idx) => {
              const isSelected = siteAccessibilityId === acc.id;
              return (
                <React.Fragment key={acc.id}>
                  {idx > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.utilityOptionRow, isSelected && styles.utilityOptionRowSelected]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setSiteAccessibilityId(acc.id);
                    }}
                    testID={`accessibility-${acc.id}`}
                  >
                    <View style={styles.optionInfo}>
                      <Text style={[styles.optionLabel, isSelected && { color: Colors.accent }]}>{acc.name}</Text>
                      <Text style={styles.optionSubtext}>{acc.description}</Text>
                    </View>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
          {(siteAccessibilityId === 'difficult' || siteAccessibilityId === 'very_difficult') && (
            <View style={styles.warningCard}>
              <AlertTriangle size={16} color={Colors.warning} />
              <View style={styles.warningContent}>
                <Text style={styles.warningText}>
                  {sanitizeEstimateText(siteAccessibilityId === 'very_difficult' ? VERY_DIFFICULT_ACCESS_WARNING : DIFFICULT_ACCESS_WARNING)}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.groupNestedBlock}>
          <View style={styles.groupInlineHeader}>
            <Text style={styles.groupInlineTitle}>Utility Network Connections</Text>
            <TouchableOpacity
              onPress={() => setShowUtilityInfo(!showUtilityInfo)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID="utility-info-btn"
            >
              <Info size={15} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          {showUtilityInfo && (
            <View style={styles.tooltipCard}>
              <Text style={styles.tooltipText}>{sanitizeEstimateText(UTILITY_CONNECTION_TOOLTIP)}</Text>
            </View>
          )}
          <View style={styles.card}>
            {UTILITY_CONNECTION_OPTIONS.map((opt, idx) => {
              const isSelected = utilityConnectionId === opt.id;
              return (
                <React.Fragment key={opt.id}>
                  {idx > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.utilityOptionRow, isSelected && styles.utilityOptionRowSelected]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setUtilityConnectionId(opt.id);
                    }}
                    testID={`utility-${opt.id}`}
                  >
                    <View style={styles.optionInfo}>
                      <Text style={[styles.optionLabel, isSelected && { color: Colors.accent }]}>{opt.name}</Text>
                      <Text style={styles.optionSubtext}>
                        {opt.id !== 'custom' ? `${formatCurrency(opt.cost)} ${MIDDLE_DOT} ${opt.description}` : opt.description}
                      </Text>
                    </View>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
            {utilityConnectionId === 'custom' && (
              <>
                <View style={styles.divider} />
                <View style={styles.costInputRow}>
                  <TextInput
                    style={styles.costInput}
                    value={customUtilityCost > 0 ? formatNumber(customUtilityCost) : ''}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, '');
                      setCustomUtilityCost(parseInt(cleaned, 10) || 0);
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    testID="utility-custom-cost"
                  />
                  <Text style={styles.costInputUnit}> {EURO_SYMBOL}</Text>
                </View>
              </>
            )}
            <View style={styles.divider} />
            <View style={styles.effectiveRow}>
              <Text style={styles.effectiveLabel}>Connection Cost</Text>
              <Text style={styles.effectiveValue}>{formatCurrency(utilityConnectionCost)}</Text>
            </View>
          </View>
        </View>

      </View>
    </CollapsibleGroup>
  );

  const renderOutdoorAdditionsGroup = () => (
    <CollapsibleGroup
      title="Outdoor & Additions"
      icon={<TreePine size={16} color={Colors.accent} />}
      expanded={showOutdoorAdditionsGroup}
      onToggle={() => setShowOutdoorAdditionsGroup((prev) => !prev)}
    >
      <View style={styles.groupSection}>
        <Text style={styles.groupSectionTitle}>Landscape & Outdoor Works</Text>
        <View style={styles.card}>
          <SliderInput
            label="Landscaping Area"
            subtitle="Garden, driveways, outdoor areas"
            value={landscapingArea}
            onChangeValue={setLandscapingArea}
            min={0}
            max={1500}
            step={10}
            testID="slider-landscaping-area"
          />
          {landscapingArea > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.effectiveRow}>
                <Text style={styles.effectiveLabel}>Landscaping Cost</Text>
                <Text style={styles.effectiveValue}>{formatCurrency(landscapingCost)}</Text>
              </View>
              <Text style={styles.effectiveFormula}>
                {`Based on ${formatCurrency(40)} /${SQUARE_METER_UNIT} ${MIDDLE_DOT} ${siteCondition.name}`}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.groupSection}>
        <View style={styles.groupSectionHeader}>
          <Text style={styles.groupSectionHeaderTitle}>Swimming Pool</Text>
          <TouchableOpacity
            onPress={() => setShowPoolInfo(!showPoolInfo)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID="pool-info-btn"
          >
            <Info size={15} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
        {showPoolInfo && (
          <View style={styles.tooltipCard}>
            <Text style={styles.tooltipText}>{sanitizeEstimateText(POOL_TOOLTIP)}</Text>
          </View>
        )}
        <View style={styles.card}>
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>Include Swimming Pool</Text>
              <Text style={styles.optionSubtext}>
                {includePool
                  ? `${formatCurrency(poolCost)} ${MIDDLE_DOT} ${poolQualityOption.name}`
                  : 'Not included in estimate'}
              </Text>
            </View>
            <Switch
              value={includePool}
              onValueChange={(val) => {
                if (Platform.OS !== 'web') {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setIncludePool(val);
              }}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={Colors.white}
              testID="pool-toggle"
            />
          </View>
          {includePool && (
            <>
              <View style={styles.divider} />
              <Text style={styles.poolSubsectionTitle}>Pool Size</Text>
              <View style={styles.poolSizeGrid}>
                {POOL_SIZE_OPTIONS.map((opt) => {
                  const isSelected = poolSizeId === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.7}
                      style={[styles.poolSizeBtn, isSelected && styles.poolSizeBtnSelected]}
                      onPress={() => {
                        if (Platform.OS !== 'web') {
                          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        setPoolSizeId(opt.id);
                      }}
                      testID={`pool-size-${opt.id}`}
                    >
                      <Text style={[styles.poolSizeName, isSelected && styles.poolSizeNameSelected]}>
                        {opt.name}
                      </Text>
                      {opt.area > 0 && (
                        <Text style={[styles.poolSizeArea, isSelected && styles.poolSizeAreaSelected]}>
                          {`${formatNumber(opt.area)} ${SQUARE_METER_UNIT}`}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              {poolSizeId === 'custom' && (
                <View style={styles.poolCustomRow}>
                  <View style={styles.poolCustomField}>
                    <Text style={styles.poolCustomLabel}>Pool Area</Text>
                    <View style={styles.poolCustomInputWrap}>
                      <TextInput
                        style={styles.poolCustomInput}
                        value={poolCustomArea > 0 ? formatNumber(poolCustomArea) : ''}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9]/g, '');
                          setPoolCustomArea(parseInt(cleaned, 10) || 0);
                        }}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={Colors.textTertiary}
                        testID="pool-custom-area"
                      />
                      <Text style={styles.poolCustomUnit}>{SQUARE_METER_UNIT}</Text>
                    </View>
                  </View>
                  <View style={styles.poolCustomField}>
                    <Text style={styles.poolCustomLabel}>Pool Depth</Text>
                    <View style={styles.poolCustomInputWrap}>
                      <TextInput
                        style={styles.poolCustomInput}
                        value={poolCustomDepth > 0 ? formatDecimal(poolCustomDepth, 2) : ''}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9,]/g, '').replace(',', '.');
                          const num = parseFloat(cleaned);
                          setPoolCustomDepth(isNaN(num) ? 0 : num);
                        }}
                        keyboardType="decimal-pad"
                        placeholder={formatDecimal(1.4, 2)}
                        placeholderTextColor={Colors.textTertiary}
                        testID="pool-custom-depth"
                      />
                      <Text style={styles.poolCustomUnit}>m</Text>
                    </View>
                  </View>
                </View>
              )}
              <View style={styles.divider} />
              <Text style={styles.poolSubsectionTitle}>Pool Quality</Text>
              <View style={styles.poolOptionGrid}>
                {POOL_QUALITY_OPTIONS.map((opt) => {
                  const isSelected = poolQualityId === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.7}
                      style={[styles.poolOptionBtn, isSelected && styles.poolOptionBtnSelected]}
                      onPress={() => {
                        if (Platform.OS !== 'web') {
                          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        setPoolQualityId(opt.id);
                      }}
                      testID={`pool-quality-${opt.id}`}
                    >
                      <Text style={[styles.poolOptionName, isSelected && styles.poolOptionNameSelected]}>
                        {opt.name}
                      </Text>
                      <Text style={[styles.poolOptionDesc, isSelected && styles.poolOptionDescSelected]}>
                        {opt.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.divider} />
              <Text style={styles.poolSubsectionTitle}>Pool Type</Text>
              <View style={styles.poolOptionGrid}>
                {POOL_TYPE_OPTIONS.map((opt) => {
                  const isSelected = poolTypeId === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.7}
                      style={[styles.poolOptionBtn, isSelected && styles.poolOptionBtnSelected]}
                      onPress={() => {
                        if (Platform.OS !== 'web') {
                          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        setPoolTypeId(opt.id);
                      }}
                      testID={`pool-type-${opt.id}`}
                    >
                      <Text style={[styles.poolOptionName, isSelected && styles.poolOptionNameSelected]}>
                        {opt.name}
                      </Text>
                      <Text style={[styles.poolOptionDesc, isSelected && styles.poolOptionDescSelected]}>
                        {opt.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.divider} />
              <View style={styles.effectiveRow}>
                <Text style={styles.effectiveLabel}>Pool Cost</Text>
                <Text style={styles.effectiveValue}>{formatCurrency(poolCost)}</Text>
              </View>
              <Text style={styles.effectiveFormula}>
                {`${formatNumber(poolArea)} ${SQUARE_METER_UNIT} ${MIDDLE_DOT} ${formatDecimal(poolDepth, 2)} m depth ${MIDDLE_DOT} ${poolQualityOption.name} ${MIDDLE_DOT} ${poolTypeOption.name}`}
              </Text>
            </>
          )}
        </View>
      </View>
    </CollapsibleGroup>
  );

  const renderConstructionBenchmarkGroup = () => (
    <CollapsibleGroup
      title="Construction Benchmark"
      icon={<Ruler size={16} color={Colors.accent} />}
      expanded={showBenchmarkGroup}
      onToggle={() => setShowBenchmarkGroup((prev) => !prev)}
    >
      <View style={styles.groupSection}>
        <Text style={styles.groupSectionTitle}>Location</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {LOCATIONS.map((loc) => {
            const isSelected = locationId === loc.id;
            return (
              <TouchableOpacity
                key={loc.id}
                activeOpacity={0.7}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => handleLocationSelect(loc.id)}
                testID={`location-${loc.id}`}
              >
                <Text style={[styles.chipName, isSelected && styles.chipNameSelected]}>
                  {loc.name}
                </Text>
                <Text style={[styles.chipMult, isSelected && styles.chipMultSelected]}>
                  {MULTIPLY_SYMBOL}{formatDecimal(loc.multiplier, 2)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.groupSection}>
        <View style={styles.groupSectionHeader}>
          <Text style={styles.groupSectionHeaderTitle}>Quality Benchmark Selection</Text>
          <TouchableOpacity
            onPress={() => setShowCostBasisInfo(!showCostBasisInfo)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID="cost-basis-info-btn"
          >
            <Info size={15} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
        {showCostBasisInfo && (
          <View style={styles.costBasisCard}>
            <Text style={styles.costBasisTitle}>{COST_BASIS_TITLE}</Text>
            <Text style={styles.costBasisText}>{sanitizeEstimateText(COST_BASIS_TEXT)}</Text>
            <View style={styles.costBasisDivider} />
            <Text style={styles.costBasisTitle}>{COST_BASIS_SCOPE_TITLE}</Text>
            <Text style={styles.costBasisText}>{sanitizeEstimateText(COST_BASIS_SCOPE_TEXT)}</Text>
          </View>
        )}
        <View style={[styles.card, styles.cardCompactTop]}>
          <View style={styles.qualityRow}>
            {qualityBenchmarkOptions.map((option, index) => {
              const isSelected = qualityId === option.id;
              return (
                <React.Fragment key={option.id}>
                  {index > 0 && <View style={styles.divider} />}
                  {isSelected ? (
                    <View
                      style={[
                        styles.qualityCard,
                        styles.qualityCardSelected,
                        useStackedBenchmarkCardLayout && styles.qualityCardStacked,
                      ]}
                      testID={`quality-${option.id}`}
                    >
                      <View style={styles.qualityCardText}>
                        <Text style={[styles.qualityName, styles.qualityNameSelected]}>
                          {option.title}
                        </Text>
                        <Text style={styles.qualityDescriptor}>{option.descriptor}</Text>
                      </View>
                      <View
                        style={[
                          styles.qualityCardValue,
                          styles.qualityCardValueSelected,
                          useStackedBenchmarkCardLayout && styles.qualityCardValueStacked,
                        ]}
                      >
                        <View
                          style={[
                            styles.qualityInlineValueRow,
                            useStackedBenchmarkCardLayout && styles.qualityInlineValueRowStacked,
                          ]}
                        >
                          <View
                            style={[
                              styles.qualityModeInline,
                              useStackedBenchmarkCardLayout && styles.qualityModeInlineStacked,
                            ]}
                            testID="benchmark-reference-toggle"
                          >
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => {
                                if (Platform.OS !== 'web') {
                                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }
                                setBenchmarkOverridePerSqm(null);
                              }}
                              style={[
                                styles.qualityModeInlineOption,
                                benchmarkMode === 'default'
                                  ? styles.qualityModeInlineOptionActive
                                  : styles.qualityModeInlineOptionInactive,
                              ]}
                              testID="benchmark-reference-default"
                            >
                              <Text
                                style={[
                                  styles.qualityModeInlineText,
                                  benchmarkMode === 'default'
                                    ? styles.qualityModeInlineTextActive
                                    : styles.qualityModeInlineTextInactive,
                                ]}
                              >
                                Default
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => activateManualBenchmarkOverride(option.benchmarkValue)}
                              style={[
                                styles.qualityModeInlineOption,
                                benchmarkMode === 'manual'
                                  ? styles.qualityModeInlineOptionActive
                                  : styles.qualityModeInlineOptionInactive,
                              ]}
                              testID="benchmark-reference-manual"
                            >
                              <Text
                                style={[
                                  styles.qualityModeInlineText,
                                  benchmarkMode === 'manual'
                                    ? styles.qualityModeInlineTextActive
                                    : styles.qualityModeInlineTextInactive,
                                ]}
                              >
                                Manual
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <View
                            style={[
                              styles.qualityInlineInputWrap,
                              benchmarkMode === 'default' && styles.qualityInlineInputWrapReadonly,
                              useStackedBenchmarkCardLayout && styles.qualityInlineInputWrapStacked,
                            ]}
                          >
                            <TextInput
                              ref={benchmarkInputRef}
                              style={[
                                styles.qualityInlineInput,
                                benchmarkMode === 'default' && styles.qualityInlineInputReadonly,
                              ]}
                              value={formatNumber(
                                benchmarkMode === 'manual' ? referenceBenchmarkPerSqm : option.benchmarkValue,
                              )}
                              onChangeText={(text) => {
                                const cleaned = text.replace(/[^0-9]/g, '');
                                if (!cleaned) return;
                                setBenchmarkOverridePerSqm(parseInt(cleaned, 10) || quality.baseCostPerSqm);
                              }}
                              keyboardType="numeric"
                              editable={benchmarkMode === 'manual'}
                              selectTextOnFocus={benchmarkMode === 'manual'}
                              placeholder="0"
                              placeholderTextColor={Colors.textTertiary}
                              testID="benchmark-reference-input"
                            />
                            <Text
                              style={[
                                styles.qualityInlineInputUnit,
                                benchmarkMode === 'default' && styles.qualityInlineInputUnitReadonly,
                              ]}
                            >
                              {`${EURO_SYMBOL}/${SQUARE_METER_UNIT}`}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.qualityCard}
                      onPress={() => {
                        handleQualitySelect(option.id, option.benchmarkValue);
                      }}
                      testID={`quality-${option.id}`}
                    >
                      <View style={styles.qualityCardText}>
                        <Text style={styles.qualityName}>
                          {option.title}
                        </Text>
                        <Text style={styles.qualityDescriptor}>{option.descriptor}</Text>
                      </View>
                      <View style={styles.qualityCardValue}>
                        <Text style={styles.qualityPrice}>{option.benchmarkLabel}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Correction based on Building Size</Text>
          <View style={styles.sizeCorrectionRow}>
            <View style={styles.adjustmentText}>
              <Text style={styles.optionSubtext}>
                {`Smaller projects usually cost more per ${SQUARE_METER_UNIT}, while larger projects benefit from scale.`}
              </Text>
            </View>
            <Text style={[
              styles.sizeCorrectionValue,
              sizeCorrectionFactor > 1 ? styles.sizeCorrectionUp : styles.sizeCorrectionDown,
            ]}>
              {`${displaySizeCorrectionLabel} ${ARROW_SYMBOL} ${formatCurrency(correctedCostPerSqm)} /${SQUARE_METER_UNIT}`}
            </Text>
          </View>
        </View>
      </View>
    </CollapsibleGroup>
  );

  const renderFeesMarginsGroup = () => (
    <CollapsibleGroup
      title="Fees & Margins"
      icon={<Shield size={16} color={Colors.accent} />}
      expanded={showFeesMarginsGroup}
      onToggle={() => setShowFeesMarginsGroup((prev) => !prev)}
    >
      <View style={styles.groupSection}>
        <View style={styles.groupSectionHeader}>
          <Text style={styles.groupSectionHeaderTitle}>Permits & Professional Fees</Text>
          <TouchableOpacity
            onPress={() => setShowPermitDesignInfo(!showPermitDesignInfo)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID="permit-design-info-btn"
          >
            <Info size={15} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.groupSectionSubtitle}>
          {`Based on ${feesQualityLabel} quality ${MIDDLE_DOT} ${formatNumber(permitDesignBuildingArea)} ${SQUARE_METER_UNIT} building area`}
        </Text>
        {showPermitDesignInfo && (
          <View style={styles.tooltipCard}>
            <Text style={styles.tooltipText}>{sanitizeEstimateText(PERMIT_DESIGN_TOOLTIP)}</Text>
          </View>
        )}
        <View style={[styles.card, styles.cardCompactTop]}>
          <View style={styles.valueOnlyRow}>
            <Text style={styles.effectiveValue}>{formatCurrency(permitDesignFee)}</Text>
          </View>
          {isLargeProject && (
            <View style={styles.permitDesignAdvisory}>
              <Info size={13} color={Colors.accent} />
              <Text style={styles.permitDesignAdvisoryText}>{sanitizeEstimateText(PERMIT_DESIGN_LARGE_PROJECT_MESSAGE)}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.permitDesignLink}
            onPress={() => Linking.openURL(PERMIT_DESIGN_CONTACT_URL)}
            activeOpacity={0.7}
            testID="permit-design-contact-link"
          >
            <Text style={styles.permitDesignLinkText}>{PERMIT_DESIGN_CONTACT_LABEL}</Text>
            <ExternalLink size={14} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.groupSection}>
        <Text style={styles.groupSectionTitle}>Contractor Margin</Text>
        <View style={styles.card}>
          <SliderInput
            label="Margin rate"
            subtitle={`${formatDecimal(contractorPercent, 1)}% of construction = ${formatCurrency(contractorCost)}`}
            value={contractorPercent}
            onChangeValue={setContractorPercent}
            min={CONTRACTOR_MIN_PERCENTAGE}
            max={CONTRACTOR_MAX_PERCENTAGE}
            step={CONTRACTOR_STEP}
            suffix="%"
            testID="slider-contractor-percent"
          />
        </View>
      </View>

      <View style={styles.groupSection}>
        <Text style={styles.groupSectionTitle}>Insurance & Taxes</Text>
        <View style={styles.card}>
          <SliderInput
            label="VAT rate"
            subtitle={`Reference only: ${formatEditableDecimal(vatPercent, 1)}% of subtotal before VAT = ${formatCurrency(vatAmount)}`}
            value={vatPercent}
            onChangeValue={(value) => setVatPercent(Math.max(0, value))}
            min={0}
            max={40}
            step={0.5}
            suffix="%"
            testID="slider-vat-percent"
          />
          <Text style={styles.moduleSupportText}>
            VAT is tracked here as an editable planning reference and is not added to the current estimator total.
          </Text>
          <View style={styles.divider} />
          <Text style={styles.cardTitle}>e-EFKA worker insurance</Text>
          <Text style={styles.optionSubtext}>
            Automatic estimate for mandatory owner-paid worker insurance based on building area.
          </Text>
          <OverrideValueField
            value={formatNumber(efkaInsuranceAmount)}
            onChangeText={(text) => setEfkaInsuranceManualCost(parseInt(text.replace(/[^0-9]/g, ''), 10) || 0)}
            editable={efkaInsuranceManualOverrideActive}
            unit={` ${EURO_SYMBOL}`}
            helperText={efkaInsuranceManualOverrideActive
              ? `Automatic reference: ${formatCurrency(efkaInsuranceAutoCost)}.`
              : ''}
            onSetEditable={(nextEditable) => {
              if (Platform.OS !== 'web') {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setEfkaInsuranceManualCost(nextEditable ? efkaInsuranceAutoCost : null);
            }}
            inputTestID="efka-insurance-cost-input"
            actionTestID="efka-insurance-manual-toggle"
          />
        </View>
      </View>

      <View style={styles.groupSection}>
        <Text style={styles.groupSectionTitle}>Construction Contingency</Text>
        <View style={styles.card}>
          <SliderInput
            label="Applied rate"
            subtitle={`Recommended rate for ${feesQualityLabel} quality: ${formatEditableDecimal(contingencyPercent * 100, 1)}%`}
            value={Math.round(appliedContingencyPercent * 10) / 10}
            onChangeValue={(value) => {
              setManualContingencyPercent(Math.max(0, value));
            }}
            min={0}
            max={20}
            step={0.5}
            suffix="%"
            testID="slider-contingency-rate"
          />
          <Text style={styles.effectiveFormula}>
            {`Contingency cost: ${formatCurrency(contingencyCost)}`}
          </Text>
        </View>
      </View>
    </CollapsibleGroup>
  );

  return (
    <View style={styles.outerContainer}>
      <ScenarioBar />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

      {renderLandPlotGroup()}
      {renderConstructionBenchmarkGroup()}
      {renderBuildingDefinitionGroup()}
      {renderOutdoorAdditionsGroup()}
      {renderSystemsUpgradesGroup()}
      {renderSiteParametersGroup()}
      {renderFeesMarginsGroup()}

      <TouchableOpacity
        style={styles.transparencyLink}
        onPress={() => router.push('/how-it-works')}
        activeOpacity={0.7}
        testID="how-it-works-btn"
      >
        <BookOpen size={16} color={Colors.accent} />
        <Text style={styles.transparencyLinkText}>How the Estimate Works</Text>
      </TouchableOpacity>

      <View style={styles.disclaimer}>
        <Info size={14} color={Colors.textTertiary} style={styles.disclaimerIcon} />
        <Text style={styles.disclaimerText}>{sanitizeEstimateText(DISCLAIMER_TEXT)}</Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  groupWrap: {
    marginTop: 20,
    width: '100%' as const,
    maxWidth: 1040,
    alignSelf: 'center' as const,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    overflow: 'hidden' as const,
  },
  groupHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  groupHeaderLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    flex: 1,
    paddingRight: 12,
    minWidth: 0,
  },
  groupIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.accentBg,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
    lineHeight: 22,
    flexShrink: 1,
  },
  groupBody: {
    paddingBottom: 10,
  },
  groupSection: {
    marginTop: 8,
  },
  groupSectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    lineHeight: 20,
  },
  groupSectionSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginHorizontal: 16,
    marginBottom: 8,
    lineHeight: 18,
  },
  groupSectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  groupSectionHeaderTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    lineHeight: 20,
  },
  groupNestedBlock: {
    marginTop: 8,
  },
  groupInlineHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  groupInlineTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  inlineSubsectionLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryHighlightCard: {
    backgroundColor: Colors.accentBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  summaryHighlightHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
  },
  summaryHighlightLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  summaryHighlightValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.accent,
    flexShrink: 1,
    textAlign: 'right' as const,
  },
  summaryHighlightSubtext: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },
  summarySpacer: {
    height: 10,
  },
  chipsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center' as const,
    minWidth: 80,
  },
  chipSelected: {
    backgroundColor: Colors.accentBg,
    borderColor: Colors.accent,
  },
  chipName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  chipNameSelected: {
    color: Colors.accent,
  },
  chipMult: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  chipMultSelected: {
    color: Colors.accent,
  },
  qualityRow: {
    flexDirection: 'column' as const,
    gap: 10,
  },
  qualityCard: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    paddingVertical: 6,
    gap: 10,
  },
  qualityCardSelected: {
    backgroundColor: Colors.accentBg,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  qualityCardStacked: {
    alignItems: 'stretch' as const,
  },
  qualityCardText: {
    flex: 1,
    paddingRight: 12,
  },
  qualityCardValue: {
    alignItems: 'flex-end' as const,
    flexShrink: 1,
    minWidth: 120,
  },
  qualityCardValueSelected: {
    minWidth: 0,
    flexShrink: 0,
  },
  qualityCardValueStacked: {
    width: '100%' as const,
    marginTop: 10,
    alignItems: 'flex-start' as const,
  },
  qualityInlineValueRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
    gap: 8,
    flexWrap: 'nowrap' as const,
    minHeight: 40,
  },
  qualityInlineValueRowStacked: {
    width: '100%' as const,
    justifyContent: 'space-between' as const,
  },
  qualityModeInline: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.card,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 2,
    gap: 2,
    flexShrink: 0,
  },
  qualityModeInlineStacked: {
    marginRight: 8,
  },
  qualityModeInlineOption: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  qualityModeInlineOptionActive: {
    borderColor: Colors.textTertiary,
  },
  qualityModeInlineOptionInactive: {
    backgroundColor: 'transparent',
  },
  qualityModeInlineText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  qualityModeInlineTextActive: {
    color: Colors.text,
    fontWeight: '700' as const,
  },
  qualityModeInlineTextInactive: {
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  qualityInlineInputWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.card,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 140,
    justifyContent: 'flex-end' as const,
    flexShrink: 0,
    overflow: 'hidden' as const,
  },
  qualityInlineInputWrapStacked: {
    width: 140,
  },
  qualityInlineInputWrapReadonly: {
    borderColor: Colors.border,
  },
  qualityInlineInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    textAlign: 'right' as const,
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  qualityInlineInputReadonly: {
    color: Colors.accent,
  },
  qualityInlineInputUnit: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  qualityInlineInputUnitReadonly: {
    color: Colors.accent,
  },
  qualityName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  qualityNameSelected: {
    color: Colors.accent,
  },
  qualityDescriptor: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  qualityPrice: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  qualityPriceSelected: {
    color: Colors.accent,
  },
  qualityUnit: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  qualityUnitSelected: {
    color: Colors.accent,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardCompactTop: {
    marginTop: 4,
  },
  cardEmphasis: {
    marginTop: 10,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    lineHeight: 20,
    flexShrink: 1,
  },
  resetLink: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  costInputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 48,
  },
  costInputRowDisabled: {
    opacity: 0.7,
  },
  overrideInputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 48,
    gap: 10,
  },
  overrideInputValueWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
    minWidth: 120,
  },
  overrideModeSegment: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderRadius: 999,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden' as const,
  },
  overrideModeOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: 'center' as const,
  },
  overrideModeOptionActive: {
    backgroundColor: Colors.accent,
  },
  overrideModeOptionInactive: {
    backgroundColor: Colors.card,
  },
  overrideModeOptionText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  overrideModeOptionTextActive: {
    color: Colors.white,
  },
  overrideModeOptionTextInactive: {
    color: Colors.textSecondary,
  },
  euroSign: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginRight: 4,
  },
  costInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
    padding: 0,
  },
  costInputDisabled: {
    color: Colors.textSecondary,
  },
  costInputUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  costInputUnitDisabled: {
    color: Colors.textTertiary,
  },
  costHintRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginTop: 10,
    gap: 6,
  },
  costHint: {
    flex: 1,
    fontSize: 12,
    color: Colors.textTertiary,
    lineHeight: 16,
  },
  moduleSupportText: {
    marginTop: 10,
    fontSize: 12,
    color: Colors.textTertiary,
    lineHeight: 16,
  },
  sizeCorrectionRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    flexWrap: 'wrap' as const,
    marginTop: 10,
    paddingHorizontal: 0,
    gap: 12,
  },
  adjustmentText: {
    flex: 1,
  },
  sizeCorrectionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  sizeCorrectionValue: {
    fontSize: 12,
    fontWeight: '700' as const,
    flexShrink: 1,
    textAlign: 'right' as const,
  },
  sizeCorrectionUp: {
    color: Colors.warning,
  },
  sizeCorrectionDown: {
    color: Colors.success,
  },
  finalBenchmarkRow: {
    marginTop: 12,
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    flexWrap: 'wrap' as const,
  },
  finalBenchmarkValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.accent,
  },
  finalBenchmarkUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
    marginBottom: 3,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },
  effectiveRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    paddingVertical: 4,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  valueOnlyRow: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    alignItems: 'center' as const,
    paddingVertical: 4,
  },
  effectiveLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
    flexShrink: 1,
  },
  effectiveValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.primary,
    flexShrink: 1,
    textAlign: 'right' as const,
  },
  effectiveFormula: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
    lineHeight: 16,
    textAlign: 'left' as const,
  },
  optionRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  optionInfo: {
    flex: 1,
    minWidth: 0,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  optionSubtext: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 3,
    lineHeight: 17,
  },
  disclaimer: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    width: '100%' as const,
    maxWidth: 1040,
    alignSelf: 'center' as const,
    paddingHorizontal: 4,
    marginTop: 20,
    gap: 8,
  },
  disclaimerIcon: {
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textTertiary,
    lineHeight: 16,
  },
  tooltipCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 12,
  },
  tooltipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  siteConditionsGrid: {
    paddingHorizontal: 16,
    gap: 8,
  },
  siteCondCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
  },
  siteCondCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentBg,
  },
  siteCondIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.inputBg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  siteCondIconWrapSelected: {
    backgroundColor: 'rgba(212, 120, 47, 0.12)',
  },
  siteCondTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  siteCondName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    lineHeight: 18,
  },
  siteCondNameSelected: {
    color: Colors.accent,
  },
  siteCondDesc: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
    lineHeight: 16,
  },
  siteCondDescSelected: {
    color: Colors.accent,
  },
  basementTypeHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  basementTypeTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  basementTooltip: {
    backgroundColor: Colors.inputBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  basementTooltipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  basementTypeOptions: {
    gap: 6,
  },
  basementTypeBtn: {
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  basementTypeBtnSelected: {
    backgroundColor: Colors.accentBg,
    borderColor: Colors.accent,
  },
  basementTypeName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  basementTypeNameSelected: {
    color: Colors.accent,
  },
  basementTypeDesc: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  basementTypeDescSelected: {
    color: Colors.accent,
  },
  basementCostBreakdown: {
    gap: 6,
  },
  basementCostRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  basementCostLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  basementCostValue: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  basementCostTotal: {
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  basementCostTotalLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  basementCostTotalValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  hvacBaseNote: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 12,
    fontStyle: 'italic' as const,
  },
  permitDesignAdvisory: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: Colors.accentBg,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    gap: 8,
  },
  permitDesignAdvisoryText: {
    flex: 1,
    fontSize: 12,
    color: Colors.accent,
    lineHeight: 17,
    fontWeight: '500' as const,
  },
  permitDesignLink: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'flex-start' as const,
    marginTop: 12,
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.accentBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  permitDesignLinkText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  transparencyLink: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: '100%' as const,
    maxWidth: 1040,
    alignSelf: 'center' as const,
    marginTop: 20,
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  transparencyLinkText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  resetBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginHorizontal: 16,
    marginTop: 16,
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#DC2626',
  },
  bottomSpacer: {
    height: 20,
  },
  utilityOptionRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 6,
    gap: 10,
  },
  utilityOptionRowSelected: {
    opacity: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  radioOuterSelected: {
    borderColor: Colors.accent,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  costBasisCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 14,
  },
  costBasisTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  costBasisText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  costBasisDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  warningCard: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: Colors.warningBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 10,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.warning,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
  integerRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    flexWrap: 'wrap' as const,
    paddingVertical: 4,
    gap: 8,
  },
  integerInfo: {
    flex: 1,
  },
  integerLabelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  integerLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  integerStatusRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginTop: 4,
  },
  integerStatus: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
  },
  integerStatusManual: {
    color: Colors.accent,
  },
  integerReset: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  integerControls: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    alignSelf: 'flex-start' as const,
  },
  integerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.inputBg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  integerBtnDisabled: {
    opacity: 0.35,
  },
  integerBtnText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  integerBtnTextDisabled: {
    color: Colors.textTertiary,
  },
  integerValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
    minWidth: 28,
    textAlign: 'center' as const,
  },
  poolSubsectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  poolSizeGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  poolSizeBtn: {
    flex: 1,
    minWidth: 140,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center' as const,
  },
  poolSizeBtnSelected: {
    backgroundColor: Colors.accentBg,
    borderColor: Colors.accent,
  },
  poolSizeName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  poolSizeNameSelected: {
    color: Colors.accent,
  },
  poolSizeArea: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  poolSizeAreaSelected: {
    color: Colors.accent,
  },
  poolCustomRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    marginTop: 10,
  },
  poolCustomField: {
    flex: 1,
    minWidth: 150,
  },
  poolCustomLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  poolCustomInputWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  poolCustomInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
    padding: 0,
    textAlign: 'right' as const,
  },
  poolCustomUnit: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  poolOptionGrid: {
    gap: 6,
  },
  poolOptionBtn: {
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  poolOptionBtnSelected: {
    backgroundColor: Colors.accentBg,
    borderColor: Colors.accent,
  },
  poolOptionName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  poolOptionNameSelected: {
    color: Colors.accent,
  },
  poolOptionDesc: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  poolOptionDescSelected: {
    color: Colors.accent,
  },
});
