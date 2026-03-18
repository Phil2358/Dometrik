import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Switch, Platform, Linking, Alert, } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MapPin, Ruler, Info, Mountain, TreePine, Bath, Flame, Waves, FileText, ExternalLink, Plug, ShieldAlert, Droplets, Truck, AlertTriangle, Home, Wrench, Settings, BookOpen, RotateCcw, LandPlot, Sofa } from 'lucide-react-native';
import SliderInput from '@/components/SliderInput';
import ScenarioBar from '@/components/ScenarioBar';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect, Circle, Line, G } from 'react-native-svg';
import Colors from '@/constants/colors';
import { useEstimate } from '@/contexts/EstimateContext';
import { LOCATIONS, QUALITY_LEVELS, DISCLAIMER_TEXT, SITE_CONDITIONS, SITE_CONDITIONS_TOOLTIP, HVAC_OPTIONS, HVAC_TOOLTIP, POOL_SIZE_OPTIONS, POOL_QUALITY_OPTIONS, POOL_TYPE_OPTIONS, POOL_TOOLTIP, COST_BASIS_TITLE, COST_BASIS_TEXT, COST_BASIS_SCOPE_TITLE, COST_BASIS_SCOPE_TEXT, PERMIT_DESIGN_TOOLTIP, PERMIT_DESIGN_LARGE_PROJECT_MESSAGE, PERMIT_DESIGN_CONTACT_URL, PERMIT_DESIGN_CONTACT_LABEL, PERMIT_DESIGN_BASELINE_AREA_MAX, UTILITY_CONNECTION_OPTIONS, UTILITY_CONNECTION_TOOLTIP, GROUNDWATER_CONDITIONS, GROUNDWATER_TOOLTIP, HIGH_GROUNDWATER_WARNING, UNSTABLE_SOIL_WARNING, SITE_ACCESSIBILITY_OPTIONS, SITE_ACCESSIBILITY_TOOLTIP, DIFFICULT_ACCESS_WARNING, VERY_DIFFICULT_ACCESS_WARNING, CONTRACTOR_MIN_PERCENTAGE, CONTRACTOR_MAX_PERCENTAGE, CONTRACTOR_STEP, getSizeCorrectionLabel, } from '@/constants/construction';
import { formatCurrency, formatDecimal, formatNumber } from '@/utils/format';
function sanitizeEstimateText(value) {
    return value
        .replace(/Ãƒâ€”/g, '×')
        .replace(/Ã—/g, '×')
        .replace(/Ã¢â€šÂ¬/g, '€')
        .replace(/â‚¬/g, '€')
        .replace(/mÂ²/g, 'm²')
        .replace(/âˆ’/g, '−')
        .replace(/â€“/g, '–')
        .replace(/â†’/g, '→')
        .replace(/Â·/g, '·');
}
const EURO_SYMBOL = '\u20AC';
const MULTIPLY_SYMBOL = '\u00D7';
const MIDDLE_DOT = '\u00B7';
const EN_DASH = '\u2013';
const MINUS_SYMBOL = '\u2212';
const ARROW_SYMBOL = '\u2192';
const SQUARE_METER_UNIT = 'm\u00B2';
function SiteConditionIcon({ conditionId, size = 40, color }) {
    const secondaryColor = color + '66';
    const groundColor = color;
    switch (conditionId) {
        case 'flat_normal':
            return (_jsxs(Svg, { width: size, height: size, viewBox: "0 0 40 40", children: [_jsx(Line, { x1: "4", y1: "26", x2: "36", y2: "26", stroke: groundColor, strokeWidth: "2" }), _jsx(Rect, { x: "8", y: "16", width: "6", height: "10", rx: "1", fill: secondaryColor }), _jsx(Rect, { x: "17", y: "12", width: "8", height: "14", rx: "1", fill: groundColor }), _jsx(Rect, { x: "28", y: "18", width: "5", height: "8", rx: "1", fill: secondaryColor }), _jsx(Line, { x1: "4", y1: "30", x2: "36", y2: "30", stroke: secondaryColor, strokeWidth: "1", strokeDasharray: "3,2" }), _jsx(Line, { x1: "4", y1: "33", x2: "36", y2: "33", stroke: secondaryColor, strokeWidth: "1", strokeDasharray: "3,2" })] }));
        case 'flat_rocky':
            return (_jsxs(Svg, { width: size, height: size, viewBox: "0 0 40 40", children: [_jsx(Line, { x1: "4", y1: "26", x2: "36", y2: "26", stroke: groundColor, strokeWidth: "2" }), _jsx(Rect, { x: "14", y: "14", width: "12", height: "12", rx: "1", fill: secondaryColor }), _jsx(Path, { d: "M6 33 L10 28 L14 31 L18 27 L22 30 L26 27 L30 29 L34 27 L36 33 Z", fill: groundColor, opacity: 0.3 }), _jsx(Circle, { cx: "10", cy: "30", r: "2", fill: groundColor, opacity: 0.5 }), _jsx(Circle, { cx: "20", cy: "32", r: "1.5", fill: groundColor, opacity: 0.5 }), _jsx(Circle, { cx: "30", cy: "30", r: "2.5", fill: groundColor, opacity: 0.5 }), _jsx(Circle, { cx: "15", cy: "31", r: "1", fill: groundColor, opacity: 0.4 }), _jsx(Circle, { cx: "25", cy: "31", r: "1.8", fill: groundColor, opacity: 0.4 })] }));
        case 'inclined_normal':
            return (_jsxs(Svg, { width: size, height: size, viewBox: "0 0 40 40", children: [_jsx(Line, { x1: "4", y1: "32", x2: "36", y2: "20", stroke: groundColor, strokeWidth: "2" }), _jsxs(G, { transform: "translate(18, 10) rotate(0)", children: [_jsx(Rect, { x: "0", y: "0", width: "10", height: "12", rx: "1", fill: secondaryColor }), _jsx(Path, { d: "M0 0 L5 -4 L10 0 Z", fill: groundColor, opacity: 0.6 })] }), _jsx(Line, { x1: "4", y1: "36", x2: "36", y2: "24", stroke: secondaryColor, strokeWidth: "1", strokeDasharray: "3,2" }), _jsx(Line, { x1: "4", y1: "39", x2: "36", y2: "27", stroke: secondaryColor, strokeWidth: "1", strokeDasharray: "3,2" })] }));
        case 'inclined_rocky':
            return (_jsxs(Svg, { width: size, height: size, viewBox: "0 0 40 40", children: [_jsx(Line, { x1: "4", y1: "32", x2: "36", y2: "20", stroke: groundColor, strokeWidth: "2" }), _jsxs(G, { transform: "translate(18, 10)", children: [_jsx(Rect, { x: "0", y: "0", width: "10", height: "12", rx: "1", fill: secondaryColor }), _jsx(Path, { d: "M0 0 L5 -4 L10 0 Z", fill: groundColor, opacity: 0.6 })] }), _jsx(Path, { d: "M4 38 L10 33 L14 36 L20 31 L26 34 L32 29 L36 32 L36 38 Z", fill: groundColor, opacity: 0.3 }), _jsx(Circle, { cx: "8", cy: "35", r: "2", fill: groundColor, opacity: 0.5 }), _jsx(Circle, { cx: "18", cy: "33", r: "1.5", fill: groundColor, opacity: 0.5 }), _jsx(Circle, { cx: "28", cy: "28", r: "2", fill: groundColor, opacity: 0.5 }), _jsx(Circle, { cx: "33", cy: "26", r: "1.2", fill: groundColor, opacity: 0.4 })] }));
        case 'inclined_sandy':
            return (_jsxs(Svg, { width: size, height: size, viewBox: "0 0 40 40", children: [_jsx(Line, { x1: "4", y1: "32", x2: "36", y2: "20", stroke: groundColor, strokeWidth: "2" }), _jsxs(G, { transform: "translate(18, 10)", children: [_jsx(Rect, { x: "0", y: "0", width: "10", height: "12", rx: "1", fill: secondaryColor }), _jsx(Path, { d: "M0 0 L5 -4 L10 0 Z", fill: groundColor, opacity: 0.6 })] }), [6, 10, 14, 18, 22, 26, 30, 34].map((x, i) => (_jsxs(G, { children: [_jsx(Circle, { cx: x, cy: 34 - (x - 4) * 0.375 + 1, r: "0.8", fill: groundColor, opacity: 0.35 }), _jsx(Circle, { cx: x + 2, cy: 34 - (x - 2) * 0.375 + 3, r: "0.6", fill: groundColor, opacity: 0.3 }), _jsx(Circle, { cx: x - 1, cy: 34 - (x - 5) * 0.375 + 5, r: "0.7", fill: groundColor, opacity: 0.25 })] }, i))), _jsx(Path, { d: "M4 34 Q10 33 14 35 Q20 32 26 34 Q30 31 36 33 L36 38 L4 38 Z", fill: groundColor, opacity: 0.15 })] }));
        default:
            return null;
    }
}
function IntegerInputRow({ label, value, onChangeValue, min = 0, subtitle, infoText, }) {
    const [showInfo, setShowInfo] = React.useState(false);
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
    return (_jsxs(View, { style: styles.integerRow, children: [_jsxs(View, { style: styles.integerInfo, children: [_jsxs(View, { style: styles.integerLabelRow, children: [_jsx(Text, { style: styles.integerLabel, children: label }), infoText ? (_jsx(TouchableOpacity, { onPress: () => setShowInfo((prev) => !prev), hitSlop: { top: 8, bottom: 8, left: 8, right: 8 }, testID: `info-${label.toLowerCase()}`, children: _jsx(Info, { size: 13, color: Colors.textTertiary }) })) : null] }), subtitle ? (_jsx(Text, { style: styles.integerBaseline, children: subtitle })) : null, showInfo && infoText ? (_jsx(Text, { style: styles.integerHelpText, children: infoText })) : null] }), _jsxs(View, { style: styles.integerControls, children: [_jsx(TouchableOpacity, { style: [styles.integerBtn, value <= min && styles.integerBtnDisabled], onPress: handleDecrement, disabled: value <= min, activeOpacity: 0.7, testID: `decrement-${label.toLowerCase()}`, children: _jsx(Text, { style: [styles.integerBtnText, value <= min && styles.integerBtnTextDisabled], children: MINUS_SYMBOL }) }), _jsx(Text, { style: styles.integerValue, children: value }), _jsx(TouchableOpacity, { style: styles.integerBtn, onPress: handleIncrement, activeOpacity: 0.7, testID: `increment-${label.toLowerCase()}`, children: _jsx(Text, { style: styles.integerBtnText, children: "+" }) })] })] }));
}
function formatProgramSubtitle({ baseline, actual, singular, plural, }) {
    const baselineLabel = baseline === 1 ? singular : plural;
    const delta = actual - baseline;
    if (delta === 0) {
        return `Included in base: ${baseline} ${baselineLabel}`;
    }
    const deltaLabel = Math.abs(delta) === 1 ? '1' : String(Math.abs(delta));
    return `Included in base: ${baseline} ${baselineLabel} ${MIDDLE_DOT} ${deltaLabel} ${delta > 0 ? 'added manually' : 'reduced manually'}`;
}
export default function EstimateScreen() {
    var _a;
    const router = useRouter();
    const { locationId, setLocationId, qualityId, selectQuality, customCostPerSqm, setCustomCostPerSqm, mainArea, setMainArea, terraceArea, setTerraceArea, balconyArea, setBalconyArea, storageBasementArea, setStorageBasementArea, parkingBasementArea, setParkingBasementArea, habitableBasementArea, setHabitableBasementArea, basementArea, includePool, setIncludePool, poolSizeId, setPoolSizeId, poolCustomArea, setPoolCustomArea, poolCustomDepth, setPoolCustomDepth, poolQualityId, setPoolQualityId, poolQualityOption, poolTypeId, setPoolTypeId, poolTypeOption, poolArea, poolDepth, contractorPercent, setContractorPercent, siteConditionId, setSiteConditionId, siteCondition, landscapingArea, setLandscapingArea, landscapingCost, landValue, setLandValue, landAcquisitionCosts, setLandAcquisitionCosts, landAcquisitionCostsMode, setLandAcquisitionCostsMode, bathrooms, setBathrooms, wcs, setWcs, bedroomCount, setBedroomCount, kitchenCount, setKitchenCount, customKitchenUnitCost, setCustomKitchenUnitCost, generalFurnitureBaseAmount, setGeneralFurnitureBaseAmount, hvacSelections, toggleHvacOption, hvacCosts, totalHvacCost, quality, effectiveArea, baseCostPerSqm, plotSize, setPlotSize, sizeCorrectionFactor, correctedCostPerSqm, contractorCost, poolCost, permitDesignFee, utilityConnectionId, setUtilityConnectionId, customUtilityCost, setCustomUtilityCost, utilityConnectionCost, contingencyPercent, permitDesignEffectiveArea, groundwaterConditionId, setGroundwaterConditionId, siteAccessibilityId, setSiteAccessibilityId, siteAccessibility, kg600Cost, residentialProgramBaseline, suggestedKitchenUnitCost, kitchenUnitCost, kitchenPackageCost, wardrobePackageCost, generalFurniturePackageCost, bathroomWcFurnishingSliceCost, includedWardrobes, resetAllData, } = useEstimate();
    const isLargeProject = permitDesignEffectiveArea > PERMIT_DESIGN_BASELINE_AREA_MAX;
    const sizeCorrectionLabel = getSizeCorrectionLabel(mainArea);
    const displaySizeCorrectionLabel = sanitizeEstimateText(sizeCorrectionLabel);
    const displayedLandAcquisitionCosts = landAcquisitionCostsMode === 'auto'
        ? landValue * 0.06
        : landAcquisitionCosts;
    const bedroomSubtitle = formatProgramSubtitle({
        baseline: residentialProgramBaseline.bedrooms,
        actual: bedroomCount,
        singular: 'bedroom',
        plural: 'bedrooms',
    });
    const bathroomSubtitle = formatProgramSubtitle({
        baseline: residentialProgramBaseline.bathrooms,
        actual: bathrooms,
        singular: 'bathroom',
        plural: 'bathrooms',
    });
    const wcSubtitle = formatProgramSubtitle({
        baseline: residentialProgramBaseline.wcs,
        actual: wcs,
        singular: 'WC',
        plural: 'WCs',
    });
    const handleLocationSelect = useCallback((id) => {
        if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setLocationId(id);
    }, [setLocationId]);
    const handleQualitySelect = useCallback((id) => {
        if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        selectQuality(id);
    }, [selectQuality]);
    const handleSiteConditionSelect = useCallback((id) => {
        if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setSiteConditionId(id);
    }, [setSiteConditionId]);
    const [showCostBasisInfo, setShowCostBasisInfo] = React.useState(false);
    const [showSiteConditionInfo, setShowSiteConditionInfo] = React.useState(false);
    const [showHvacInfo, setShowHvacInfo] = React.useState(false);
    const [showPoolInfo, setShowPoolInfo] = React.useState(false);
    const [showPermitDesignInfo, setShowPermitDesignInfo] = React.useState(false);
    const [showUtilityInfo, setShowUtilityInfo] = React.useState(false);
    const [showGroundwaterInfo, setShowGroundwaterInfo] = React.useState(false);
    const [showAccessibilityInfo, setShowAccessibilityInfo] = React.useState(false);
    return (_jsxs(View, { style: styles.outerContainer, children: [_jsx(ScenarioBar, {}), _jsxs(ScrollView, { style: styles.container, contentContainerStyle: styles.content, showsVerticalScrollIndicator: false, keyboardShouldPersistTaps: "handled", children: [_jsxs(View, { style: styles.sectionHeader, children: [_jsx(MapPin, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Location" })] }), _jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: styles.chipsRow, children: LOCATIONS.map((loc) => {
                            const isSelected = locationId === loc.id;
                            return (_jsxs(TouchableOpacity, { activeOpacity: 0.7, style: [styles.chip, isSelected && styles.chipSelected], onPress: () => handleLocationSelect(loc.id), testID: `location-${loc.id}`, children: [_jsx(Text, { style: [styles.chipName, isSelected && styles.chipNameSelected], children: loc.name }), _jsxs(Text, { style: [styles.chipMult, isSelected && styles.chipMultSelected], children: [MULTIPLY_SYMBOL, formatDecimal(loc.multiplier, 2)] })] }, loc.id));
                        }) }), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(LandPlot, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Land Acquisition" })] }), _jsxs(View, { style: styles.card, children: [_jsx(View, { style: styles.cardHeader, children: _jsx(Text, { style: styles.cardTitle, children: "Land Value" }) }), _jsxs(View, { style: styles.costInputRow, children: [_jsx(TextInput, { style: styles.costInput, value: landValue > 0 ? formatNumber(landValue) : '', onChangeText: (text) => {
                                            const cleaned = text.replace(/[^0-9]/g, '');
                                            setLandValue(parseInt(cleaned, 10) || 0);
                                        }, keyboardType: "numeric", placeholder: "0", placeholderTextColor: Colors.textTertiary, testID: "land-value-input" }), _jsxs(Text, { style: styles.costInputUnit, children: [" ", EURO_SYMBOL] })] }), _jsx(View, { style: styles.divider }), _jsx(Text, { style: styles.poolSubsectionTitle, children: "Incidental Land Acquisition Costs" }), _jsxs(TouchableOpacity, { activeOpacity: 0.7, style: [styles.utilityOptionRow, landAcquisitionCostsMode === 'auto' && styles.utilityOptionRowSelected], onPress: () => {
                                    if (Platform.OS !== 'web') {
                                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }
                                    setLandAcquisitionCostsMode('auto');
                                }, testID: "land-acquisition-mode-auto", children: [_jsxs(View, { style: styles.optionInfo, children: [_jsx(Text, { style: [styles.optionLabel, landAcquisitionCostsMode === 'auto' && { color: Colors.accent }], children: "Auto estimate (6%)" }), _jsxs(Text, { style: styles.optionSubtext, children: ["Derived from land value ", MULTIPLY_SYMBOL, " ", formatDecimal(0.06, 2)] })] }), _jsx(View, { style: [styles.radioOuter, landAcquisitionCostsMode === 'auto' && styles.radioOuterSelected], children: landAcquisitionCostsMode === 'auto' && _jsx(View, { style: styles.radioInner }) })] }), _jsx(View, { style: styles.divider }), _jsxs(TouchableOpacity, { activeOpacity: 0.7, style: [styles.utilityOptionRow, landAcquisitionCostsMode === 'manual' && styles.utilityOptionRowSelected], onPress: () => {
                                    if (Platform.OS !== 'web') {
                                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }
                                    setLandAcquisitionCostsMode('manual');
                                }, testID: "land-acquisition-mode-manual", children: [_jsxs(View, { style: styles.optionInfo, children: [_jsx(Text, { style: [styles.optionLabel, landAcquisitionCostsMode === 'manual' && { color: Colors.accent }], children: "Manual override" }), _jsx(Text, { style: styles.optionSubtext, children: "Enter incidental acquisition costs directly" })] }), _jsx(View, { style: [styles.radioOuter, landAcquisitionCostsMode === 'manual' && styles.radioOuterSelected], children: landAcquisitionCostsMode === 'manual' && _jsx(View, { style: styles.radioInner }) })] }), _jsx(View, { style: styles.divider }), landAcquisitionCostsMode === 'manual' ? (_jsxs(_Fragment, { children: [_jsxs(View, { style: styles.costInputRow, children: [_jsx(TextInput, { style: styles.costInput, value: landAcquisitionCosts > 0 ? formatNumber(landAcquisitionCosts) : '', onChangeText: (text) => {
                                                    const cleaned = text.replace(/[^0-9]/g, '');
                                                    setLandAcquisitionCosts(parseInt(cleaned, 10) || 0);
                                                }, keyboardType: "numeric", placeholder: "0", placeholderTextColor: Colors.textTertiary, testID: "land-acquisition-costs-input" }), _jsxs(Text, { style: styles.costInputUnit, children: [" ", EURO_SYMBOL] })] }), _jsx(View, { style: styles.divider })] })) : null, _jsxs(View, { style: styles.effectiveRow, children: [_jsx(Text, { style: styles.effectiveLabel, children: "Estimated Acquisition Costs" }), _jsx(Text, { style: styles.effectiveValue, children: formatCurrency(displayedLandAcquisitionCosts) })] }), _jsx(Text, { style: styles.effectiveFormula, children: landAcquisitionCostsMode === 'auto'
                                    ? `${formatCurrency(displayedLandAcquisitionCosts)} (6% of ${formatCurrency(landValue)})`
                                    : 'Manual override value' })] }), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(Ruler, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Quality Standard" }), _jsx(TouchableOpacity, { onPress: () => setShowCostBasisInfo(!showCostBasisInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "cost-basis-info-btn", children: _jsx(Info, { size: 15, color: Colors.textTertiary }) })] }), showCostBasisInfo && (_jsxs(View, { style: styles.costBasisCard, children: [_jsx(Text, { style: styles.costBasisTitle, children: COST_BASIS_TITLE }), _jsx(Text, { style: styles.costBasisText, children: sanitizeEstimateText(COST_BASIS_TEXT) }), _jsx(View, { style: styles.costBasisDivider }), _jsx(Text, { style: styles.costBasisTitle, children: COST_BASIS_SCOPE_TITLE }), _jsx(Text, { style: styles.costBasisText, children: sanitizeEstimateText(COST_BASIS_SCOPE_TEXT) })] })), _jsx(View, { style: styles.qualityRow, children: QUALITY_LEVELS.map((q) => {
                            const isSelected = qualityId === q.id;
                            return (_jsxs(TouchableOpacity, { activeOpacity: 0.7, style: [styles.qualityCard, isSelected && styles.qualityCardSelected], onPress: () => handleQualitySelect(q.id), testID: `quality-${q.id}`, children: [_jsx(Text, { style: [styles.qualityName, isSelected && styles.qualityNameSelected], children: q.name }), _jsx(Text, { style: [styles.qualityPrice, isSelected && styles.qualityPriceSelected], children: formatCurrency(q.baseCostPerSqm) }), _jsx(Text, { style: [styles.qualityUnit, isSelected && styles.qualityUnitSelected], children: ` /${SQUARE_METER_UNIT}` })] }, q.id));
                        }) }), _jsxs(View, { style: styles.costBasisNote, children: [_jsx(Info, { size: 12, color: Colors.textTertiary }), _jsx(Text, { style: styles.costBasisNoteText, children: "Base construction costs represent direct building construction costs (KG 300 + 400 + 600). Contractor overhead, professional fees, and VAT are calculated separately." })] }), _jsxs(View, { style: styles.card, children: [_jsxs(View, { style: styles.cardHeader, children: [_jsx(Text, { style: styles.cardTitle, children: `Base Cost per ${SQUARE_METER_UNIT}` }), customCostPerSqm !== null && (_jsx(TouchableOpacity, { onPress: () => setCustomCostPerSqm(null), children: _jsx(Text, { style: styles.resetLink, children: "Reset" }) }))] }), _jsxs(View, { style: styles.costInputRow, children: [_jsx(TextInput, { style: styles.costInput, value: formatNumber(baseCostPerSqm), onChangeText: (text) => {
                                            const cleaned = text.replace(/[^0-9]/g, '');
                                            const num = parseInt(cleaned, 10);
                                            if (isNaN(num) || num <= 0) {
                                                setCustomCostPerSqm(null);
                                            }
                                            else {
                                                setCustomCostPerSqm(num);
                                            }
                                        }, keyboardType: "numeric", testID: "cost-per-sqm-input" }), _jsx(Text, { style: styles.costInputUnit, children: ` ${EURO_SYMBOL} /${SQUARE_METER_UNIT} (base)` })] }), sizeCorrectionFactor !== 1.0 && (_jsxs(View, { style: styles.sizeCorrectionRow, children: [_jsx(Text, { style: styles.sizeCorrectionLabel, children: "Size correction" }), _jsx(Text, { style: [
                                            styles.sizeCorrectionValue,
                                            sizeCorrectionFactor > 1 ? styles.sizeCorrectionUp : styles.sizeCorrectionDown,
                                        ], children: `${displaySizeCorrectionLabel} ${ARROW_SYMBOL} ${formatCurrency(correctedCostPerSqm)} /${SQUARE_METER_UNIT}` })] })), _jsxs(View, { style: styles.costHintRow, children: [_jsx(Info, { size: 13, color: Colors.textTertiary }), _jsxs(Text, { style: styles.costHint, children: ["Adjust freely. Quality presets: Standard ", formatCurrency(1200), " ", MIDDLE_DOT, " Premium ", formatCurrency(1500), " ", MIDDLE_DOT, " Luxury ", formatCurrency(2000), ". Size correction applies automatically."] })] })] }), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(Home, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Building Size" })] }), _jsxs(View, { style: styles.card, children: [_jsx(SliderInput, { label: "Living Area", subtitle: "Full interior floor area measured to outer face of structural walls", value: mainArea, onChangeValue: setMainArea, min: 80, max: 400, step: 5, testID: "slider-living-area" }), _jsx(View, { style: styles.divider }), _jsx(SliderInput, { label: "Covered Terraces", subtitle: "Counted at 50% of area", value: terraceArea, onChangeValue: setTerraceArea, badge: "50%", min: 0, max: 120, step: 5, testID: "slider-terrace-area" }), _jsx(View, { style: styles.divider }), _jsx(SliderInput, { label: "Balcony Area", subtitle: "Open balconies, cantilevered spaces", value: balconyArea, onChangeValue: setBalconyArea, badge: "30%", min: 0, max: 80, step: 5, testID: "slider-balcony-area" }), _jsx(View, { style: styles.divider }), _jsxs(View, { style: styles.effectiveRow, children: [_jsx(Text, { style: styles.effectiveLabel, children: "Effective Area" }), _jsx(Text, { style: styles.effectiveValue, children: `${formatNumber(effectiveArea)} ${SQUARE_METER_UNIT}` })] }), _jsx(Text, { style: styles.effectiveFormula, children: `${formatNumber(mainArea)} + (${formatNumber(terraceArea)} ${MULTIPLY_SYMBOL} ${formatDecimal(0.5, 1)})${balconyArea > 0 ? ` + (${formatNumber(balconyArea)} ${MULTIPLY_SYMBOL} ${formatDecimal(0.3, 2)})` : ''}${storageBasementArea > 0 ? ` + (${formatNumber(storageBasementArea)} ${MULTIPLY_SYMBOL} ${formatDecimal(0.5, 1)})` : ''}${parkingBasementArea > 0 ? ` + (${formatNumber(parkingBasementArea)} ${MULTIPLY_SYMBOL} ${formatDecimal(0.65, 2)})` : ''}${habitableBasementArea > 0 ? ` + (${formatNumber(habitableBasementArea)} ${MULTIPLY_SYMBOL} ${formatDecimal(0.85, 2)})` : ''} = ${formatNumber(effectiveArea)} ${SQUARE_METER_UNIT}` })] }), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(Wrench, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Basement" })] }), _jsxs(View, { style: styles.card, children: [_jsx(SliderInput, { label: "Storage Basement Area", subtitle: "Technical rooms, storage, utility spaces", value: storageBasementArea, onChangeValue: setStorageBasementArea, min: 0, max: 250, step: 5, badge: "50%", testID: "slider-storage-basement-area" }), _jsx(View, { style: styles.divider }), _jsx(SliderInput, { label: "Parking Basement Area", subtitle: "Garage and vehicle storage areas", value: parkingBasementArea, onChangeValue: setParkingBasementArea, min: 0, max: 250, step: 5, badge: "65%", testID: "slider-parking-basement-area" }), _jsx(View, { style: styles.divider }), _jsx(SliderInput, { label: "Habitable Basement Area", subtitle: "Guest rooms, recreation, living-quality basement space", value: habitableBasementArea, onChangeValue: setHabitableBasementArea, min: 0, max: 250, step: 5, badge: "85%", testID: "slider-habitable-basement-area" }), basementArea > 0 && (_jsxs(_Fragment, { children: [_jsx(View, { style: styles.divider }), _jsxs(View, { style: styles.effectiveRow, children: [_jsx(Text, { style: styles.effectiveLabel, children: "Basement Mix" }), _jsx(Text, { style: styles.effectiveValue, children: `${formatNumber(basementArea)} ${SQUARE_METER_UNIT}` })] }), _jsx(Text, { style: styles.effectiveFormula, children: `${storageBasementArea > 0 ? `${formatNumber(storageBasementArea)} ${SQUARE_METER_UNIT} storage` : ''}${storageBasementArea > 0 && (parkingBasementArea > 0 || habitableBasementArea > 0) ? ` ${MIDDLE_DOT} ` : ''}${parkingBasementArea > 0 ? `${formatNumber(parkingBasementArea)} ${SQUARE_METER_UNIT} parking` : ''}${parkingBasementArea > 0 && habitableBasementArea > 0 ? ` ${MIDDLE_DOT} ` : ''}${habitableBasementArea > 0 ? `${formatNumber(habitableBasementArea)} ${SQUARE_METER_UNIT} habitable` : ''}` })] }))] }), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(Mountain, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Site Conditions" }), _jsx(TouchableOpacity, { onPress: () => setShowSiteConditionInfo(!showSiteConditionInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "site-condition-info-btn", children: _jsx(Info, { size: 15, color: Colors.textTertiary }) })] }), showSiteConditionInfo && (_jsx(View, { style: styles.tooltipCard, children: _jsx(Text, { style: styles.tooltipText, children: sanitizeEstimateText(SITE_CONDITIONS_TOOLTIP) }) })), _jsx(View, { style: styles.siteConditionsGrid, children: SITE_CONDITIONS.map((cond) => {
                            const isSelected = siteConditionId === cond.id;
                            return (_jsxs(TouchableOpacity, { activeOpacity: 0.7, style: [styles.siteCondCard, isSelected && styles.siteCondCardSelected], onPress: () => handleSiteConditionSelect(cond.id), testID: `site-condition-${cond.id}`, children: [_jsx(View, { style: [styles.siteCondIconWrap, isSelected && styles.siteCondIconWrapSelected], children: _jsx(SiteConditionIcon, { conditionId: cond.id, size: 40, color: isSelected ? Colors.accent : Colors.primary }) }), _jsx(Text, { style: [styles.siteCondName, isSelected && styles.siteCondNameSelected], children: cond.name }), _jsx(Text, { style: [styles.siteCondDesc, isSelected && styles.siteCondDescSelected], children: cond.description })] }, cond.id));
                        }) }), siteConditionId === 'inclined_sandy' && (_jsxs(View, { style: styles.warningCard, children: [_jsx(AlertTriangle, { size: 16, color: Colors.warning }), _jsxs(View, { style: styles.warningContent, children: [_jsx(Text, { style: styles.warningTitle, children: "Important notice" }), _jsx(Text, { style: styles.warningText, children: sanitizeEstimateText(UNSTABLE_SOIL_WARNING) })] })] })), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(Droplets, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Groundwater Conditions" }), _jsx(TouchableOpacity, { onPress: () => setShowGroundwaterInfo(!showGroundwaterInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "groundwater-info-btn", children: _jsx(Info, { size: 15, color: Colors.textTertiary }) })] }), showGroundwaterInfo && (_jsx(View, { style: styles.tooltipCard, children: _jsx(Text, { style: styles.tooltipText, children: sanitizeEstimateText(GROUNDWATER_TOOLTIP) }) })), _jsx(View, { style: styles.card, children: GROUNDWATER_CONDITIONS.map((gw, idx) => {
                            const isSelected = groundwaterConditionId === gw.id;
                            return (_jsxs(React.Fragment, { children: [idx > 0 && _jsx(View, { style: styles.divider }), _jsxs(TouchableOpacity, { activeOpacity: 0.7, style: [styles.utilityOptionRow, isSelected && styles.utilityOptionRowSelected], onPress: () => {
                                            if (Platform.OS !== 'web') {
                                                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }
                                            setGroundwaterConditionId(gw.id);
                                        }, testID: `groundwater-${gw.id}`, children: [_jsxs(View, { style: styles.optionInfo, children: [_jsx(Text, { style: [styles.optionLabel, isSelected && { color: Colors.accent }], children: gw.name }), _jsx(Text, { style: styles.optionSubtext, children: gw.description })] }), _jsx(View, { style: [styles.radioOuter, isSelected && styles.radioOuterSelected], children: isSelected && _jsx(View, { style: styles.radioInner }) })] })] }, gw.id));
                        }) }), groundwaterConditionId === 'high' && (_jsxs(View, { style: styles.warningCard, children: [_jsx(AlertTriangle, { size: 16, color: Colors.warning }), _jsxs(View, { style: styles.warningContent, children: [_jsx(Text, { style: styles.warningTitle, children: "Important notice" }), _jsx(Text, { style: styles.warningText, children: sanitizeEstimateText(HIGH_GROUNDWATER_WARNING) })] })] })), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(Ruler, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Plot size" })] }), _jsx(View, { style: styles.card, children: _jsx(SliderInput, { label: "Plot size", subtitle: "", value: plotSize, onChangeValue: setPlotSize, min: 500, max: 10000, step: 100, suffix: SQUARE_METER_UNIT, testID: "slider-plot-size" }) }), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(Truck, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Site Accessibility" }), _jsx(TouchableOpacity, { onPress: () => setShowAccessibilityInfo(!showAccessibilityInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "accessibility-info-btn", children: _jsx(Info, { size: 15, color: Colors.textTertiary }) })] }), showAccessibilityInfo && (_jsx(View, { style: styles.tooltipCard, children: _jsx(Text, { style: styles.tooltipText, children: sanitizeEstimateText(SITE_ACCESSIBILITY_TOOLTIP) }) })), _jsx(View, { style: styles.card, children: SITE_ACCESSIBILITY_OPTIONS.map((acc, idx) => {
                            const isSelected = siteAccessibilityId === acc.id;
                            return (_jsxs(React.Fragment, { children: [idx > 0 && _jsx(View, { style: styles.divider }), _jsxs(TouchableOpacity, { activeOpacity: 0.7, style: [styles.utilityOptionRow, isSelected && styles.utilityOptionRowSelected], onPress: () => {
                                            if (Platform.OS !== 'web') {
                                                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }
                                            setSiteAccessibilityId(acc.id);
                                        }, testID: `accessibility-${acc.id}`, children: [_jsxs(View, { style: styles.optionInfo, children: [_jsx(Text, { style: [styles.optionLabel, isSelected && { color: Colors.accent }], children: acc.name }), _jsx(Text, { style: styles.optionSubtext, children: acc.description })] }), _jsx(View, { style: [styles.radioOuter, isSelected && styles.radioOuterSelected], children: isSelected && _jsx(View, { style: styles.radioInner }) })] })] }, acc.id));
                        }) }), (siteAccessibilityId === 'difficult' || siteAccessibilityId === 'very_difficult') && (_jsxs(View, { style: styles.warningCard, children: [_jsx(AlertTriangle, { size: 16, color: Colors.warning }), _jsx(View, { style: styles.warningContent, children: _jsx(Text, { style: styles.warningText, children: sanitizeEstimateText(siteAccessibilityId === 'very_difficult' ? VERY_DIFFICULT_ACCESS_WARNING : DIFFICULT_ACCESS_WARNING) }) })] })), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(TreePine, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Landscaping" })] }), _jsxs(View, { style: styles.card, children: [_jsx(SliderInput, { label: "Landscaping Area", subtitle: "Garden, driveways, outdoor areas", value: landscapingArea, onChangeValue: setLandscapingArea, min: 0, max: 1500, step: 10, testID: "slider-landscaping-area" }), landscapingArea > 0 && (_jsxs(_Fragment, { children: [_jsx(View, { style: styles.divider }), _jsxs(View, { style: styles.effectiveRow, children: [_jsx(Text, { style: styles.effectiveLabel, children: "Landscaping Cost" }), _jsx(Text, { style: styles.effectiveValue, children: formatCurrency(landscapingCost) })] }), _jsx(Text, { style: styles.effectiveFormula, children: `Based on ${formatCurrency(40)} /${SQUARE_METER_UNIT} ${MIDDLE_DOT} ${siteCondition.name}` })] }))] }), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(Flame, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "HVAC & Energy Systems" }), _jsx(TouchableOpacity, { onPress: () => setShowHvacInfo(!showHvacInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "hvac-info-btn", children: _jsx(Info, { size: 15, color: Colors.textTertiary }) })] }), showHvacInfo && (_jsx(View, { style: styles.tooltipCard, children: _jsx(Text, { style: styles.tooltipText, children: sanitizeEstimateText(HVAC_TOOLTIP) }) })), _jsxs(View, { style: styles.card, children: [_jsx(Text, { style: styles.hvacBaseNote, children: "Base: Heat pump + fan-coil / VRV system included" }), HVAC_OPTIONS.map((opt, idx) => {
                                var _a;
                                const isEnabled = (_a = hvacSelections[opt.id]) !== null && _a !== void 0 ? _a : false;
                                const hvacItem = hvacCosts.find((h) => h.option.id === opt.id);
                                return (_jsxs(React.Fragment, { children: [idx > 0 && _jsx(View, { style: styles.divider }), _jsxs(View, { style: styles.optionRow, children: [_jsxs(View, { style: styles.optionInfo, children: [_jsx(Text, { style: styles.optionLabel, children: opt.name }), _jsx(Text, { style: styles.optionSubtext, children: isEnabled && hvacItem
                                                                ? `${formatCurrency(hvacItem.cost)} ${MIDDLE_DOT} ${opt.description}`
                                                                : opt.description })] }), _jsx(Switch, { value: isEnabled, onValueChange: () => {
                                                        if (Platform.OS !== 'web') {
                                                            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                        }
                                                        toggleHvacOption(opt.id);
                                                    }, trackColor: { false: Colors.border, true: Colors.accent }, thumbColor: Colors.white, testID: `hvac-toggle-${opt.id}` })] })] }, opt.id));
                            }), totalHvacCost > 0 && (_jsxs(_Fragment, { children: [_jsx(View, { style: styles.divider }), _jsxs(View, { style: styles.effectiveRow, children: [_jsx(Text, { style: styles.effectiveLabel, children: "Energy Systems Total" }), _jsx(Text, { style: styles.effectiveValue, children: formatCurrency(totalHvacCost) })] })] }))] }), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(Bath, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Interior Program" })] }), _jsxs(View, { style: styles.card, children: [_jsx(IntegerInputRow, { label: "Bedrooms", value: bedroomCount, onChangeValue: setBedroomCount, min: 1, subtitle: bedroomSubtitle, infoText: "Bedrooms here are used for built-in wardrobes only. Loose bedroom furniture is included in the General Furniture Base Amount." }), _jsx(View, { style: styles.divider }), _jsx(IntegerInputRow, { label: "Bathrooms", value: bathrooms, onChangeValue: setBathrooms, min: 0, subtitle: bathroomSubtitle }), _jsx(View, { style: styles.divider }), _jsx(IntegerInputRow, { label: "WCs (guest WC)", value: wcs, onChangeValue: setWcs, min: 0, subtitle: wcSubtitle })] }), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(Sofa, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Furnishings" })] }), _jsxs(View, { style: styles.card, children: [_jsx(IntegerInputRow, { label: "Kitchens", value: kitchenCount, onChangeValue: setKitchenCount, min: 0, subtitle: "Kitchens are typically not included in the base contractor offer. Each kitchen is counted separately using the unit cost shown below." }), _jsx(View, { style: styles.divider }), _jsxs(View, { style: styles.cardHeader, children: [_jsx(Text, { style: styles.cardTitle, children: "Kitchen Unit Cost" }), customKitchenUnitCost !== null && (_jsx(TouchableOpacity, { onPress: () => setCustomKitchenUnitCost(null), children: _jsx(Text, { style: styles.resetLink, children: "Reset" }) }))] }), _jsxs(View, { style: styles.costInputRow, children: [_jsx(TextInput, { style: styles.costInput, value: formatNumber(kitchenUnitCost), onChangeText: (text) => {
                                            const cleaned = text.replace(/[^0-9]/g, '');
                                            const num = parseInt(cleaned, 10);
                                            if (isNaN(num) || num <= 0) {
                                                setCustomKitchenUnitCost(null);
                                            }
                                            else {
                                                setCustomKitchenUnitCost(num);
                                            }
                                        }, keyboardType: "numeric", testID: "kitchen-unit-cost-input" }), _jsxs(Text, { style: styles.costInputUnit, children: [" ", EURO_SYMBOL] })] }), _jsx(Text, { style: styles.optionSubtext, children: `Suggested ${formatCurrency(suggestedKitchenUnitCost)} ${MIDDLE_DOT} quality and area adjusted` }), _jsx(View, { style: styles.divider }), _jsx(View, { style: styles.cardHeader, children: _jsx(Text, { style: styles.cardTitle, children: "General Furniture Base Amount" }) }), _jsxs(View, { style: styles.costInputRow, children: [_jsx(TextInput, { style: styles.costInput, value: generalFurnitureBaseAmount > 0 ? formatNumber(generalFurnitureBaseAmount) : '', onChangeText: (text) => {
                                            const cleaned = text.replace(/[^0-9]/g, '');
                                            setGeneralFurnitureBaseAmount(parseInt(cleaned, 10) || 0);
                                        }, keyboardType: "numeric", placeholder: "0", placeholderTextColor: Colors.textTertiary, testID: "general-furniture-base-input" }), _jsxs(Text, { style: styles.costInputUnit, children: [" ", EURO_SYMBOL] })] }), _jsx(Text, { style: styles.optionSubtext, children: `Loose furniture package. Recommended amount is based on bedrooms and effective area. This value is editable.` }), _jsx(View, { style: styles.divider }), _jsxs(View, { style: styles.effectiveRow, children: [_jsx(Text, { style: styles.effectiveLabel, children: "KG600 Furnishings Total" }), _jsx(Text, { style: styles.effectiveValue, children: formatCurrency(kg600Cost) })] }), _jsx(Text, { style: styles.effectiveFormula, children: `${formatCurrency(kitchenPackageCost)} kitchen${wardrobePackageCost > 0 ? ` + ${formatCurrency(wardrobePackageCost)} wardrobes (${includedWardrobes})` : ''}${generalFurniturePackageCost > 0 ? ` + ${formatCurrency(generalFurniturePackageCost)} general furniture` : ''}${bathroomWcFurnishingSliceCost > 0 ? ` + ${formatCurrency(bathroomWcFurnishingSliceCost)} bath/WC furnishing slices` : ''}` })] }), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(Waves, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Swimming Pool" }), _jsx(TouchableOpacity, { onPress: () => setShowPoolInfo(!showPoolInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "pool-info-btn", children: _jsx(Info, { size: 15, color: Colors.textTertiary }) })] }), showPoolInfo && (_jsx(View, { style: styles.tooltipCard, children: _jsx(Text, { style: styles.tooltipText, children: sanitizeEstimateText(POOL_TOOLTIP) }) })), _jsxs(View, { style: styles.card, children: [_jsxs(View, { style: styles.optionRow, children: [_jsxs(View, { style: styles.optionInfo, children: [_jsx(Text, { style: styles.optionLabel, children: "Include Swimming Pool" }), _jsx(Text, { style: styles.optionSubtext, children: includePool
                                                    ? `${formatCurrency(poolCost)} ${MIDDLE_DOT} ${poolQualityOption.name}`
                                                    : 'Not included in estimate' })] }), _jsx(Switch, { value: includePool, onValueChange: (val) => {
                                            if (Platform.OS !== 'web') {
                                                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }
                                            setIncludePool(val);
                                        }, trackColor: { false: Colors.border, true: Colors.accent }, thumbColor: Colors.white, testID: "pool-toggle" })] }), includePool && (_jsxs(_Fragment, { children: [_jsx(View, { style: styles.divider }), _jsx(Text, { style: styles.poolSubsectionTitle, children: "Pool Size" }), _jsx(View, { style: styles.poolSizeGrid, children: POOL_SIZE_OPTIONS.map((opt) => {
                                            const isSelected = poolSizeId === opt.id;
                                            return (_jsxs(TouchableOpacity, { activeOpacity: 0.7, style: [styles.poolSizeBtn, isSelected && styles.poolSizeBtnSelected], onPress: () => {
                                                    if (Platform.OS !== 'web') {
                                                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    }
                                                    setPoolSizeId(opt.id);
                                                }, testID: `pool-size-${opt.id}`, children: [_jsx(Text, { style: [styles.poolSizeName, isSelected && styles.poolSizeNameSelected], children: opt.name }), opt.area > 0 && (_jsx(Text, { style: [styles.poolSizeArea, isSelected && styles.poolSizeAreaSelected], children: `${formatNumber(opt.area)} ${SQUARE_METER_UNIT}` }))] }, opt.id));
                                        }) }), poolSizeId === 'custom' && (_jsxs(View, { style: styles.poolCustomRow, children: [_jsxs(View, { style: styles.poolCustomField, children: [_jsx(Text, { style: styles.poolCustomLabel, children: "Pool Area" }), _jsxs(View, { style: styles.poolCustomInputWrap, children: [_jsx(TextInput, { style: styles.poolCustomInput, value: poolCustomArea > 0 ? formatNumber(poolCustomArea) : '', onChangeText: (text) => {
                                                                    const cleaned = text.replace(/[^0-9]/g, '');
                                                                    setPoolCustomArea(parseInt(cleaned, 10) || 0);
                                                                }, keyboardType: "numeric", placeholder: "0", placeholderTextColor: Colors.textTertiary, testID: "pool-custom-area" }), _jsx(Text, { style: styles.poolCustomUnit, children: SQUARE_METER_UNIT })] })] }), _jsxs(View, { style: styles.poolCustomField, children: [_jsx(Text, { style: styles.poolCustomLabel, children: "Pool Depth" }), _jsxs(View, { style: styles.poolCustomInputWrap, children: [_jsx(TextInput, { style: styles.poolCustomInput, value: poolCustomDepth > 0 ? formatDecimal(poolCustomDepth, 2) : '', onChangeText: (text) => {
                                                                    const cleaned = text.replace(/[^0-9,]/g, '').replace(',', '.');
                                                                    const num = parseFloat(cleaned);
                                                                    setPoolCustomDepth(isNaN(num) ? 0 : num);
                                                                }, keyboardType: "decimal-pad", placeholder: formatDecimal(1.4, 2), placeholderTextColor: Colors.textTertiary, testID: "pool-custom-depth" }), _jsx(Text, { style: styles.poolCustomUnit, children: "m" })] })] })] })), _jsx(View, { style: styles.divider }), _jsx(Text, { style: styles.poolSubsectionTitle, children: "Pool Quality" }), _jsx(View, { style: styles.poolOptionGrid, children: POOL_QUALITY_OPTIONS.map((opt) => {
                                            const isSelected = poolQualityId === opt.id;
                                            return (_jsxs(TouchableOpacity, { activeOpacity: 0.7, style: [styles.poolOptionBtn, isSelected && styles.poolOptionBtnSelected], onPress: () => {
                                                    if (Platform.OS !== 'web') {
                                                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    }
                                                    setPoolQualityId(opt.id);
                                                }, testID: `pool-quality-${opt.id}`, children: [_jsx(Text, { style: [styles.poolOptionName, isSelected && styles.poolOptionNameSelected], children: opt.name }), _jsx(Text, { style: [styles.poolOptionDesc, isSelected && styles.poolOptionDescSelected], children: opt.description })] }, opt.id));
                                        }) }), _jsx(View, { style: styles.divider }), _jsx(Text, { style: styles.poolSubsectionTitle, children: "Pool Type" }), _jsx(View, { style: styles.poolOptionGrid, children: POOL_TYPE_OPTIONS.map((opt) => {
                                            const isSelected = poolTypeId === opt.id;
                                            return (_jsxs(TouchableOpacity, { activeOpacity: 0.7, style: [styles.poolOptionBtn, isSelected && styles.poolOptionBtnSelected], onPress: () => {
                                                    if (Platform.OS !== 'web') {
                                                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    }
                                                    setPoolTypeId(opt.id);
                                                }, testID: `pool-type-${opt.id}`, children: [_jsx(Text, { style: [styles.poolOptionName, isSelected && styles.poolOptionNameSelected], children: opt.name }), _jsx(Text, { style: [styles.poolOptionDesc, isSelected && styles.poolOptionDescSelected], children: opt.description })] }, opt.id));
                                        }) }), _jsx(View, { style: styles.divider }), _jsxs(View, { style: styles.effectiveRow, children: [_jsx(Text, { style: styles.effectiveLabel, children: "Pool Cost" }), _jsx(Text, { style: styles.effectiveValue, children: formatCurrency(poolCost) })] }), _jsx(Text, { style: styles.effectiveFormula, children: `${formatNumber(poolArea)} ${SQUARE_METER_UNIT} ${MIDDLE_DOT} ${formatDecimal(poolDepth, 2)} m depth ${MIDDLE_DOT} ${poolQualityOption.name} ${MIDDLE_DOT} ${poolTypeOption.name}` })] }))] }), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(Plug, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Utility Network Connections" }), _jsx(TouchableOpacity, { onPress: () => setShowUtilityInfo(!showUtilityInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "utility-info-btn", children: _jsx(Info, { size: 15, color: Colors.textTertiary }) })] }), showUtilityInfo && (_jsx(View, { style: styles.tooltipCard, children: _jsx(Text, { style: styles.tooltipText, children: sanitizeEstimateText(UTILITY_CONNECTION_TOOLTIP) }) })), _jsxs(View, { style: styles.card, children: [UTILITY_CONNECTION_OPTIONS.map((opt, idx) => {
                                const isSelected = utilityConnectionId === opt.id;
                                return (_jsxs(React.Fragment, { children: [idx > 0 && _jsx(View, { style: styles.divider }), _jsxs(TouchableOpacity, { activeOpacity: 0.7, style: [styles.utilityOptionRow, isSelected && styles.utilityOptionRowSelected], onPress: () => {
                                                if (Platform.OS !== 'web') {
                                                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                }
                                                setUtilityConnectionId(opt.id);
                                            }, testID: `utility-${opt.id}`, children: [_jsxs(View, { style: styles.optionInfo, children: [_jsx(Text, { style: [styles.optionLabel, isSelected && { color: Colors.accent }], children: opt.name }), _jsx(Text, { style: styles.optionSubtext, children: opt.id !== 'custom' ? `${formatCurrency(opt.cost)} ${MIDDLE_DOT} ${opt.description}` : opt.description })] }), _jsx(View, { style: [styles.radioOuter, isSelected && styles.radioOuterSelected], children: isSelected && _jsx(View, { style: styles.radioInner }) })] })] }, opt.id));
                            }), utilityConnectionId === 'custom' && (_jsxs(_Fragment, { children: [_jsx(View, { style: styles.divider }), _jsxs(View, { style: styles.costInputRow, children: [_jsx(TextInput, { style: styles.costInput, value: customUtilityCost > 0 ? formatNumber(customUtilityCost) : '', onChangeText: (text) => {
                                                    const cleaned = text.replace(/[^0-9]/g, '');
                                                    setCustomUtilityCost(parseInt(cleaned, 10) || 0);
                                                }, keyboardType: "numeric", placeholder: "0", placeholderTextColor: Colors.textTertiary, testID: "utility-custom-cost" }), _jsxs(Text, { style: styles.costInputUnit, children: [" ", EURO_SYMBOL] })] })] })), _jsx(View, { style: styles.divider }), _jsxs(View, { style: styles.effectiveRow, children: [_jsx(Text, { style: styles.effectiveLabel, children: "Connection Cost" }), _jsx(Text, { style: styles.effectiveValue, children: formatCurrency(utilityConnectionCost) })] })] }), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(FileText, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Permit & Design Fees" }), _jsx(TouchableOpacity, { onPress: () => setShowPermitDesignInfo(!showPermitDesignInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "permit-design-info-btn", children: _jsx(Info, { size: 15, color: Colors.textTertiary }) })] }), showPermitDesignInfo && (_jsx(View, { style: styles.tooltipCard, children: _jsx(Text, { style: styles.tooltipText, children: sanitizeEstimateText(PERMIT_DESIGN_TOOLTIP) }) })), _jsxs(View, { style: styles.card, children: [_jsxs(View, { style: styles.effectiveRow, children: [_jsx(Text, { style: styles.effectiveLabel, children: "Permit & Design Fees" }), _jsx(Text, { style: styles.effectiveValue, children: formatCurrency(permitDesignFee) })] }), _jsx(Text, { style: styles.effectiveFormula, children: `Based on ${quality.name} quality ${MIDDLE_DOT} ${formatNumber(permitDesignEffectiveArea)} ${SQUARE_METER_UNIT} effective project area` }), isLargeProject && (_jsxs(View, { style: styles.permitDesignAdvisory, children: [_jsx(Info, { size: 13, color: Colors.accent }), _jsx(Text, { style: styles.permitDesignAdvisoryText, children: sanitizeEstimateText(PERMIT_DESIGN_LARGE_PROJECT_MESSAGE) })] })), _jsxs(TouchableOpacity, { style: styles.permitDesignLink, onPress: () => Linking.openURL(PERMIT_DESIGN_CONTACT_URL), activeOpacity: 0.7, testID: "permit-design-contact-link", children: [_jsx(Text, { style: styles.permitDesignLinkText, children: PERMIT_DESIGN_CONTACT_LABEL }), _jsx(ExternalLink, { size: 14, color: Colors.accent })] })] }), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(Settings, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Contractor & Contingency" })] }), _jsxs(View, { style: styles.card, children: [_jsx(SliderInput, { label: "Contractor Overhead & Profit", subtitle: `${formatDecimal(contractorPercent, 1)}% of construction = ${formatCurrency(contractorCost)}`, value: contractorPercent, onChangeValue: setContractorPercent, min: CONTRACTOR_MIN_PERCENTAGE, max: CONTRACTOR_MAX_PERCENTAGE, step: CONTRACTOR_STEP, suffix: "%", testID: "slider-contractor-percent" }), _jsx(View, { style: styles.divider }), _jsxs(View, { style: styles.costHintRow, children: [_jsx(ShieldAlert, { size: 13, color: Colors.accent }), _jsx(Text, { style: styles.costHint, children: `Construction contingency (${formatNumber(Math.round(contingencyPercent * 100))}%) is applied to KG 300${EN_DASH}600 based on ${quality.name} quality level.` })] })] }), _jsxs(TouchableOpacity, { style: styles.transparencyLink, onPress: () => router.push('/how-it-works'), activeOpacity: 0.7, testID: "how-it-works-btn", children: [_jsx(BookOpen, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.transparencyLinkText, children: "How the Estimate Works" })] }), _jsxs(View, { style: styles.disclaimer, children: [_jsx(Info, { size: 14, color: Colors.textTertiary, style: styles.disclaimerIcon }), _jsx(Text, { style: styles.disclaimerText, children: sanitizeEstimateText(DISCLAIMER_TEXT) })] }), _jsxs(TouchableOpacity, { style: styles.resetBtn, activeOpacity: 0.7, testID: "reset-project-btn", onPress: () => {
                            Alert.alert('Reset Project', 'This will delete all scenarios and restore the default configuration. This action cannot be undone.', [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Reset',
                                    style: 'destructive',
                                    onPress: () => {
                                        void resetAllData();
                                    },
                                },
                            ]);
                        }, children: [_jsx(RotateCcw, { size: 14, color: (_a = Colors.danger) !== null && _a !== void 0 ? _a : '#DC2626' }), _jsx(Text, { style: styles.resetBtnText, children: "Reset Project" })] }), _jsx(View, { style: styles.bottomSpacer })] })] }));
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 20,
        marginBottom: 10,
        gap: 6,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
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
        alignItems: 'center',
        minWidth: 80,
    },
    chipSelected: {
        backgroundColor: Colors.accentBg,
        borderColor: Colors.accent,
    },
    chipName: {
        fontSize: 14,
        fontWeight: '600',
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
        flexDirection: 'row',
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
        alignItems: 'center',
    },
    qualityCardSelected: {
        borderColor: Colors.accent,
        backgroundColor: Colors.accentBg,
    },
    qualityName: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 6,
    },
    qualityNameSelected: {
        color: Colors.accent,
    },
    qualityPrice: {
        fontSize: 20,
        fontWeight: '800',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
    },
    resetLink: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.accent,
    },
    costInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBg,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    euroSign: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
        marginRight: 4,
    },
    costInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
        padding: 0,
    },
    costInputUnit: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    costHintRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 4,
    },
    sizeCorrectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    sizeCorrectionValue: {
        fontSize: 12,
        fontWeight: '700',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
        flexWrap: 'wrap',
        gap: 4,
    },
    effectiveLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
        flexShrink: 1,
    },
    effectiveValue: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.primary,
    },
    effectiveFormula: {
        fontSize: 11,
        color: Colors.textTertiary,
        marginTop: 4,
        textAlign: 'center',
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionInfo: {
        flex: 1,
        minWidth: 150,
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    optionSubtext: {
        fontSize: 12,
        color: Colors.textTertiary,
        marginTop: 3,
    },
    disclaimer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
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
        flexDirection: 'row',
        alignItems: 'center',
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    siteCondIconWrapSelected: {
        backgroundColor: 'rgba(212, 120, 47, 0.12)',
    },
    siteCondName: {
        fontSize: 13,
        fontWeight: '700',
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    basementTypeTitle: {
        fontSize: 13,
        fontWeight: '600',
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
        fontWeight: '700',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    basementCostLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    basementCostValue: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    basementCostTotal: {
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
    },
    basementCostTotalLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primary,
    },
    basementCostTotalValue: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
    },
    hvacBaseNote: {
        fontSize: 12,
        color: Colors.textTertiary,
        marginBottom: 12,
        fontStyle: 'italic',
    },
    permitDesignAdvisory: {
        flexDirection: 'row',
        alignItems: 'flex-start',
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
        fontWeight: '500',
    },
    permitDesignLink: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
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
        fontWeight: '700',
        color: Colors.accent,
    },
    transparencyLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
        fontWeight: '700',
        color: Colors.accent,
    },
    resetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
        fontWeight: '600',
        color: '#DC2626',
    },
    bottomSpacer: {
        height: 20,
    },
    utilityOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
        alignItems: 'center',
        justifyContent: 'center',
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
        fontWeight: '700',
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
        flexDirection: 'row',
        alignItems: 'flex-start',
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
        flexDirection: 'row',
        alignItems: 'flex-start',
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
        fontWeight: '700',
        color: Colors.warning,
        marginBottom: 4,
    },
    warningText: {
        fontSize: 12,
        color: '#92400E',
        lineHeight: 17,
    },
    integerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
        gap: 8,
    },
    integerInfo: {
        flex: 1,
    },
    integerLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    integerLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    integerBaseline: {
        fontSize: 11,
        color: Colors.textTertiary,
        marginTop: 2,
    },
    integerHelpText: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginTop: 4,
        lineHeight: 16,
    },
    integerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    integerBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    integerBtnDisabled: {
        opacity: 0.35,
    },
    integerBtnText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.primary,
    },
    integerBtnTextDisabled: {
        color: Colors.textTertiary,
    },
    integerValue: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
        minWidth: 28,
        textAlign: 'center',
    },
    poolSubsectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
        marginTop: 4,
    },
    poolSizeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    poolSizeBtn: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: Colors.inputBg,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1.5,
        borderColor: 'transparent',
        alignItems: 'center',
    },
    poolSizeBtnSelected: {
        backgroundColor: Colors.accentBg,
        borderColor: Colors.accent,
    },
    poolSizeName: {
        fontSize: 13,
        fontWeight: '700',
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
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    poolCustomField: {
        flex: 1,
    },
    poolCustomLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 6,
    },
    poolCustomInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBg,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    poolCustomInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
        padding: 0,
        textAlign: 'right',
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
        fontWeight: '700',
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
