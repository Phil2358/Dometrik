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
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MapPin, Ruler, Info, Mountain, TreePine, Bath, Flame, Waves, FileText, ExternalLink, Plug, ShieldAlert, Droplets, Truck, AlertTriangle, Home, Wrench, Settings, BookOpen } from 'lucide-react-native';
import SliderInput from '@/components/SliderInput';
import ScenarioBar from '@/components/ScenarioBar';
import { useRouter } from 'expo-router';

import Svg, { Path, Rect, Circle, Line, G } from 'react-native-svg';
import Colors from '@/constants/colors';
import { useEstimate } from '@/contexts/EstimateContext';
import {
  LOCATIONS,
  QUALITY_LEVELS,
  DISCLAIMER_TEXT,
  SITE_CONDITIONS,
  SITE_CONDITIONS_TOOLTIP,
  BASEMENT_TYPES,
  BASEMENT_TYPE_TOOLTIP,
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
  getSizeCorrectionLabel,
  formatEuro,
  formatNumber,
} from '@/constants/construction';

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
  baseline,
}: {
  label: string;
  value: number;
  onChangeValue: (v: number) => void;
  min?: number;
  baseline?: number;
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
        <Text style={styles.integerLabel}>{label}</Text>
        {baseline !== undefined && (
          <Text style={styles.integerBaseline}>{baseline} included in base</Text>
        )}
      </View>
      <View style={styles.integerControls}>
        <TouchableOpacity
          style={[styles.integerBtn, value <= min && styles.integerBtnDisabled]}
          onPress={handleDecrement}
          disabled={value <= min}
          activeOpacity={0.7}
          testID={`decrement-${label.toLowerCase()}`}
        >
          <Text style={[styles.integerBtnText, value <= min && styles.integerBtnTextDisabled]}>−</Text>
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

export default function EstimateScreen() {
  const router = useRouter();
  const {
    locationId,
    setLocationId,
    qualityId,
    selectQuality,
    customCostPerSqm,
    setCustomCostPerSqm,
    mainArea,
    setMainArea,
    terraceArea,
    setTerraceArea,
    balconyArea,
    setBalconyArea,
    basementArea,
    setBasementArea,
    basementTypeId,
    setBasementTypeId,
    basementType,
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
    siteConditionId,
    setSiteConditionId,
    siteCondition,
    landscapingArea,
    setLandscapingArea,
    landscapingCost,
    bathrooms,
    setBathrooms,
    wcs,
    setWcs,
    hvacSelections,
    toggleHvacOption,
    hvacCosts,
    totalHvacCost,
    quality,
    effectiveArea,
    baseCostPerSqm,
    sizeCorrectionFactor,
    correctedCostPerSqm,
    contractorCost,
    poolCost,
    permitDesignFee,
    utilityConnectionId,
    setUtilityConnectionId,
    customUtilityCost,
    setCustomUtilityCost,
    utilityConnectionCost,
    contingencyPercent,
    permitDesignEffectiveArea,
    groundwaterConditionId,
    setGroundwaterConditionId,
    siteAccessibilityId,
    setSiteAccessibilityId,
    siteAccessibility,
    basementExcavationCost,
    basementStructureCost,
    basementTotalCost,
  } = useEstimate();

  const isLargeProject = permitDesignEffectiveArea > PERMIT_DESIGN_BASELINE_AREA_MAX;
  const sizeCorrectionLabel = getSizeCorrectionLabel(mainArea);

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
    (id: string) => {
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      selectQuality(id);
    },
    [selectQuality],
  );

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
  const [showBasementTypeInfo, setShowBasementTypeInfo] = React.useState<boolean>(false);
  const [showHvacInfo, setShowHvacInfo] = React.useState<boolean>(false);
  const [showPoolInfo, setShowPoolInfo] = React.useState<boolean>(false);
  const [showPermitDesignInfo, setShowPermitDesignInfo] = React.useState<boolean>(false);
  const [showUtilityInfo, setShowUtilityInfo] = React.useState<boolean>(false);
  const [showGroundwaterInfo, setShowGroundwaterInfo] = React.useState<boolean>(false);
  const [showAccessibilityInfo, setShowAccessibilityInfo] = React.useState<boolean>(false);

  const handleBasementTypeSelect = useCallback(
    (id: string) => {
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setBasementTypeId(id);
    },
    [setBasementTypeId],
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

      <View style={styles.sectionHeader}>
        <MapPin size={16} color={Colors.accent} />
        <Text style={styles.sectionTitle}>Location</Text>
      </View>
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
                ×{loc.multiplier.toFixed(2)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Ruler size={16} color={Colors.accent} />
        <Text style={styles.sectionTitle}>Quality Standard</Text>
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
          <Text style={styles.costBasisText}>{COST_BASIS_TEXT}</Text>
          <View style={styles.costBasisDivider} />
          <Text style={styles.costBasisTitle}>{COST_BASIS_SCOPE_TITLE}</Text>
          <Text style={styles.costBasisText}>{COST_BASIS_SCOPE_TEXT}</Text>
        </View>
      )}
      <View style={styles.qualityRow}>
        {QUALITY_LEVELS.map((q) => {
          const isSelected = qualityId === q.id;
          return (
            <TouchableOpacity
              key={q.id}
              activeOpacity={0.7}
              style={[styles.qualityCard, isSelected && styles.qualityCardSelected]}
              onPress={() => handleQualitySelect(q.id)}
              testID={`quality-${q.id}`}
            >
              <Text style={[styles.qualityName, isSelected && styles.qualityNameSelected]}>
                {q.name}
              </Text>
              <Text style={[styles.qualityPrice, isSelected && styles.qualityPriceSelected]}>
                €{formatNumber(q.baseCostPerSqm)}
              </Text>
              <Text style={[styles.qualityUnit, isSelected && styles.qualityUnitSelected]}>
                /m²
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.costBasisNote}>
        <Info size={12} color={Colors.textTertiary} />
        <Text style={styles.costBasisNoteText}>
          Base construction costs represent direct building construction costs (KG 300 + 400 + 600). Contractor overhead, professional fees, and VAT are calculated separately.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Base Cost per m²</Text>
          {customCostPerSqm !== null && (
            <TouchableOpacity onPress={() => setCustomCostPerSqm(null)}>
              <Text style={styles.resetLink}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.costInputRow}>
          <Text style={styles.euroSign}>€</Text>
          <TextInput
            style={styles.costInput}
            value={String(baseCostPerSqm)}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, '');
              const num = parseInt(cleaned, 10);
              if (isNaN(num) || num <= 0) {
                setCustomCostPerSqm(null);
              } else {
                setCustomCostPerSqm(num);
              }
            }}
            keyboardType="numeric"
            testID="cost-per-sqm-input"
          />
          <Text style={styles.costInputUnit}>/m² (base)</Text>
        </View>
        {sizeCorrectionFactor !== 1.0 && (
          <View style={styles.sizeCorrectionRow}>
            <Text style={styles.sizeCorrectionLabel}>Size correction</Text>
            <Text style={[
              styles.sizeCorrectionValue,
              sizeCorrectionFactor > 1 ? styles.sizeCorrectionUp : styles.sizeCorrectionDown,
            ]}>
              {sizeCorrectionLabel} → €{formatNumber(correctedCostPerSqm)}/m²
            </Text>
          </View>
        )}
        <View style={styles.costHintRow}>
          <Info size={13} color={Colors.textTertiary} />
          <Text style={styles.costHint}>
            Adjust freely. Quality presets: Standard €1,200 · Premium €1,500 · Luxury €2,000. Size correction applies automatically.
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Home size={16} color={Colors.accent} />
        <Text style={styles.sectionTitle}>Building Size</Text>
      </View>
      <View style={styles.card}>
        <SliderInput
          label="Living Area"
          subtitle="Full interior floor area measured to outer face of structural walls"
          value={mainArea}
          onChangeValue={setMainArea}
          min={80}
          max={400}
          step={5}
          testID="slider-living-area"
        />
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
        <View style={styles.divider} />
        <View style={styles.effectiveRow}>
          <Text style={styles.effectiveLabel}>Effective Area</Text>
          <Text style={styles.effectiveValue}>{effectiveArea.toFixed(0)} m²</Text>
        </View>
        <Text style={styles.effectiveFormula}>
          {mainArea} + ({terraceArea} × 0.5){balconyArea > 0 ? ` + (${balconyArea} × 0.30)` : ''}{basementArea > 0 ? ` + (${basementArea} × ${basementType.costFactor})` : ''} = {effectiveArea.toFixed(0)} m²
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Wrench size={16} color={Colors.accent} />
        <Text style={styles.sectionTitle}>Basement</Text>
      </View>
      <View style={styles.card}>
        <SliderInput
          label="Basement Area"
          subtitle="Separate from main building area"
          value={basementArea}
          onChangeValue={setBasementArea}
          min={0}
          max={250}
          step={5}
          testID="slider-basement-area"
        />
        {basementArea > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.basementTypeHeader}>
              <Text style={styles.basementTypeTitle}>Basement Type</Text>
              <TouchableOpacity
                onPress={() => setShowBasementTypeInfo(!showBasementTypeInfo)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                testID="basement-type-info-btn"
              >
                <Info size={14} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
            {showBasementTypeInfo && (
              <View style={styles.basementTooltip}>
                <Text style={styles.basementTooltipText}>{BASEMENT_TYPE_TOOLTIP}</Text>
              </View>
            )}
            <View style={styles.basementTypeOptions}>
              {BASEMENT_TYPES.map((bt) => {
                const isSelected = basementTypeId === bt.id;
                return (
                  <TouchableOpacity
                    key={bt.id}
                    activeOpacity={0.7}
                    style={[styles.basementTypeBtn, isSelected && styles.basementTypeBtnSelected]}
                    onPress={() => handleBasementTypeSelect(bt.id)}
                    testID={`basement-type-${bt.id}`}
                  >
                    <Text style={[styles.basementTypeName, isSelected && styles.basementTypeNameSelected]}>
                      {bt.name}
                    </Text>
                    <Text style={[styles.basementTypeDesc, isSelected && styles.basementTypeDescSelected]}>
                      {bt.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.divider} />
            <View style={styles.basementCostBreakdown}>
              <View style={styles.basementCostRow}>
                <Text style={styles.basementCostLabel}>Excavation (KG 200)</Text>
                <Text style={styles.basementCostValue}>{formatEuro(basementExcavationCost)}</Text>
              </View>
              <View style={styles.basementCostRow}>
                <Text style={styles.basementCostLabel}>Structure (KG 300)</Text>
                <Text style={styles.basementCostValue}>{formatEuro(basementStructureCost)}</Text>
              </View>
              <View style={[styles.basementCostRow, styles.basementCostTotal]}>
                <Text style={styles.basementCostTotalLabel}>Total Basement</Text>
                <Text style={styles.basementCostTotalValue}>{formatEuro(basementTotalCost)}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Mountain size={16} color={Colors.accent} />
        <Text style={styles.sectionTitle}>Site Conditions</Text>
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
          <Text style={styles.tooltipText}>{SITE_CONDITIONS_TOOLTIP}</Text>
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
              <Text style={[styles.siteCondName, isSelected && styles.siteCondNameSelected]}>
                {cond.name}
              </Text>
              <Text style={[styles.siteCondDesc, isSelected && styles.siteCondDescSelected]}>
                {cond.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {siteConditionId === 'inclined_sandy' && (
        <View style={styles.warningCard}>
          <AlertTriangle size={16} color={Colors.warning} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Important notice</Text>
            <Text style={styles.warningText}>{UNSTABLE_SOIL_WARNING}</Text>
          </View>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Droplets size={16} color={Colors.accent} />
        <Text style={styles.sectionTitle}>Groundwater Conditions</Text>
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
          <Text style={styles.tooltipText}>{GROUNDWATER_TOOLTIP}</Text>
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
            <Text style={styles.warningText}>{HIGH_GROUNDWATER_WARNING}</Text>
          </View>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Truck size={16} color={Colors.accent} />
        <Text style={styles.sectionTitle}>Site Accessibility</Text>
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
          <Text style={styles.tooltipText}>{SITE_ACCESSIBILITY_TOOLTIP}</Text>
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
        {siteAccessibility.fixedCost > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.effectiveRow}>
              <Text style={styles.effectiveLabel}>Access Logistics Cost</Text>
              <Text style={styles.effectiveValue}>{formatEuro(siteAccessibility.fixedCost)}</Text>
            </View>
            <Text style={styles.effectiveFormula}>Fixed cost added to KG 250 – Temporary construction measures</Text>
          </>
        )}
      </View>
      {(siteAccessibilityId === 'difficult' || siteAccessibilityId === 'very_difficult') && (
        <View style={styles.warningCard}>
          <AlertTriangle size={16} color={Colors.warning} />
          <View style={styles.warningContent}>
            <Text style={styles.warningText}>
              {siteAccessibilityId === 'very_difficult' ? VERY_DIFFICULT_ACCESS_WARNING : DIFFICULT_ACCESS_WARNING}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <TreePine size={16} color={Colors.accent} />
        <Text style={styles.sectionTitle}>Landscaping</Text>
      </View>
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
              <Text style={styles.effectiveValue}>{formatEuro(landscapingCost)}</Text>
            </View>
            <Text style={styles.effectiveFormula}>
              Based on €40/m² · {siteCondition.name}
            </Text>
          </>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Flame size={16} color={Colors.accent} />
        <Text style={styles.sectionTitle}>HVAC & Energy Systems</Text>
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
          <Text style={styles.tooltipText}>{HVAC_TOOLTIP}</Text>
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
                      ? `${formatEuro(hvacItem.cost)} · ${opt.description}`
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
              <Text style={styles.effectiveValue}>{formatEuro(totalHvacCost)}</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Bath size={16} color={Colors.accent} />
        <Text style={styles.sectionTitle}>Interior Program</Text>
      </View>
      <View style={styles.card}>
        <IntegerInputRow
          label="Bathrooms"
          value={bathrooms}
          onChangeValue={setBathrooms}
          min={0}
          baseline={1}
        />
        <View style={styles.divider} />
        <IntegerInputRow
          label="WCs (guest WC)"
          value={wcs}
          onChangeValue={setWcs}
          min={0}
          baseline={1}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Waves size={16} color={Colors.accent} />
        <Text style={styles.sectionTitle}>Swimming Pool</Text>
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
          <Text style={styles.tooltipText}>{POOL_TOOLTIP}</Text>
        </View>
      )}
      <View style={styles.card}>
        <View style={styles.optionRow}>
          <View style={styles.optionInfo}>
            <Text style={styles.optionLabel}>Include Swimming Pool</Text>
            <Text style={styles.optionSubtext}>
              {includePool
                ? `${formatEuro(poolCost)} · ${poolQualityOption.name}`
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
                        {opt.area} m²
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
                      value={poolCustomArea > 0 ? String(poolCustomArea) : ''}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9]/g, '');
                        setPoolCustomArea(parseInt(cleaned, 10) || 0);
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={Colors.textTertiary}
                      testID="pool-custom-area"
                    />
                    <Text style={styles.poolCustomUnit}>m²</Text>
                  </View>
                </View>
                <View style={styles.poolCustomField}>
                  <Text style={styles.poolCustomLabel}>Pool Depth</Text>
                  <View style={styles.poolCustomInputWrap}>
                    <TextInput
                      style={styles.poolCustomInput}
                      value={poolCustomDepth > 0 ? String(poolCustomDepth) : ''}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9.]/g, '');
                        const num = parseFloat(cleaned);
                        setPoolCustomDepth(isNaN(num) ? 0 : num);
                      }}
                      keyboardType="decimal-pad"
                      placeholder="1.40"
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
              <Text style={styles.effectiveValue}>{formatEuro(poolCost)}</Text>
            </View>
            <Text style={styles.effectiveFormula}>
              {poolArea} m² · {poolDepth.toFixed(2)} m depth · {poolQualityOption.name} · {poolTypeOption.name}
            </Text>
          </>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Plug size={16} color={Colors.accent} />
        <Text style={styles.sectionTitle}>Utility Network Connections</Text>
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
          <Text style={styles.tooltipText}>{UTILITY_CONNECTION_TOOLTIP}</Text>
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
                    {opt.id !== 'custom' ? `${formatEuro(opt.cost)} · ${opt.description}` : opt.description}
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
              <Text style={styles.euroSign}>€</Text>
              <TextInput
                style={styles.costInput}
                value={customUtilityCost > 0 ? String(customUtilityCost) : ''}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setCustomUtilityCost(parseInt(cleaned, 10) || 0);
                }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.textTertiary}
                testID="utility-custom-cost"
              />
            </View>
          </>
        )}
        <View style={styles.divider} />
        <View style={styles.effectiveRow}>
          <Text style={styles.effectiveLabel}>Connection Cost</Text>
          <Text style={styles.effectiveValue}>{formatEuro(utilityConnectionCost)}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <FileText size={16} color={Colors.accent} />
        <Text style={styles.sectionTitle}>Permit & Design Fees</Text>
        <TouchableOpacity
          onPress={() => setShowPermitDesignInfo(!showPermitDesignInfo)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID="permit-design-info-btn"
        >
          <Info size={15} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>
      {showPermitDesignInfo && (
        <View style={styles.tooltipCard}>
          <Text style={styles.tooltipText}>{PERMIT_DESIGN_TOOLTIP}</Text>
        </View>
      )}
      <View style={styles.card}>
        <View style={styles.effectiveRow}>
          <Text style={styles.effectiveLabel}>Permit & Design Fees</Text>
          <Text style={styles.effectiveValue}>{formatEuro(permitDesignFee)}</Text>
        </View>
        <Text style={styles.effectiveFormula}>
          Based on {quality.name} quality · {permitDesignEffectiveArea.toFixed(0)} m² effective project area
        </Text>
        {isLargeProject && (
          <View style={styles.permitDesignAdvisory}>
            <Info size={13} color={Colors.accent} />
            <Text style={styles.permitDesignAdvisoryText}>{PERMIT_DESIGN_LARGE_PROJECT_MESSAGE}</Text>
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

      <View style={styles.sectionHeader}>
        <Settings size={16} color={Colors.accent} />
        <Text style={styles.sectionTitle}>Contractor & Contingency</Text>
      </View>
      <View style={styles.card}>
        <SliderInput
          label="Contractor Overhead & Profit"
          subtitle={`${contractorPercent.toFixed(1)}% of construction = ${formatEuro(contractorCost)}`}
          value={contractorPercent}
          onChangeValue={setContractorPercent}
          min={CONTRACTOR_MIN_PERCENTAGE}
          max={CONTRACTOR_MAX_PERCENTAGE}
          step={CONTRACTOR_STEP}
          suffix="%"
          testID="slider-contractor-percent"
        />
        <View style={styles.divider} />
        <View style={styles.costHintRow}>
          <ShieldAlert size={13} color={Colors.accent} />
          <Text style={styles.costHint}>
            Construction contingency ({Math.round(contingencyPercent * 100)}%) is applied to KG 300–600 based on {quality.name} quality level.
          </Text>
        </View>
      </View>

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
        <Text style={styles.disclaimerText}>{DISCLAIMER_TEXT}</Text>
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
    flexDirection: 'row' as const,
    paddingHorizontal: 16,
    gap: 10,
  },
  qualityCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center' as const,
  },
  qualityCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentBg,
  },
  qualityName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  qualityNameSelected: {
    color: Colors.accent,
  },
  qualityPrice: {
    fontSize: 20,
    fontWeight: '800' as const,
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
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
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
  costInputUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
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
  sizeCorrectionRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  sizeCorrectionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  sizeCorrectionValue: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  sizeCorrectionUp: {
    color: Colors.warning,
  },
  sizeCorrectionDown: {
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },
  effectiveRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 4,
    flexWrap: 'wrap' as const,
    gap: 4,
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
  },
  effectiveFormula: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
    textAlign: 'center' as const,
  },
  optionRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  optionInfo: {
    flex: 1,
    minWidth: 150,
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
  },
  disclaimer: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    paddingHorizontal: 20,
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
    alignItems: 'center' as const,
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
    backgroundColor: 'rgba(242, 161, 50, 0.16)',
  },
  siteCondName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  siteCondNameSelected: {
    color: Colors.accent,
  },
  siteCondDesc: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
    flex: 1,
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
    marginHorizontal: 16,
    marginTop: 20,
    gap: 8,
    paddingVertical: 14,
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
  costBasisNote: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 6,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  costBasisNoteText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textTertiary,
    lineHeight: 16,
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
    alignItems: 'center' as const,
    paddingVertical: 4,
    gap: 8,
  },
  integerInfo: {
    flex: 1,
  },
  integerLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  integerBaseline: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  integerControls: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
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
    minWidth: '45%' as unknown as number,
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
    gap: 12,
    marginTop: 10,
  },
  poolCustomField: {
    flex: 1,
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



