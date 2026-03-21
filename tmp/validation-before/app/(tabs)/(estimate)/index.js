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
exports.default = EstimateScreen;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const Haptics = __importStar(require("expo-haptics"));
const lucide_react_native_1 = require("lucide-react-native");
const SliderInput_1 = __importDefault(require("@/components/SliderInput"));
const ScenarioBar_1 = __importDefault(require("@/components/ScenarioBar"));
const expo_router_1 = require("expo-router");
const react_native_svg_1 = __importStar(require("react-native-svg"));
const colors_1 = __importDefault(require("@/constants/colors"));
const EstimateContext_1 = require("@/contexts/EstimateContext");
const construction_1 = require("@/constants/construction");
const format_1 = require("@/utils/format");
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
];
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
];
function sanitizeEstimateText(value) {
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
function getFeesQualityLabel(qualityId) {
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
function formatEditableDecimal(value, digits = 1) {
    if (Number.isInteger(value)) {
        return (0, format_1.formatNumber)(value);
    }
    return (0, format_1.formatDecimal)(value, digits);
}
function parseDecimalInput(text) {
    const normalized = text.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    const firstDotIndex = normalized.indexOf('.');
    const safeValue = firstDotIndex === -1
        ? normalized
        : `${normalized.slice(0, firstDotIndex + 1)}${normalized.slice(firstDotIndex + 1).replace(/\./g, '')}`;
    const parsed = parseFloat(safeValue);
    return Number.isNaN(parsed) ? 0 : parsed;
}
function OverrideValueField({ value, onChangeText, editable, unit, helperText, onSetEditable, automaticLabel = 'Automatic', editableLabel = 'Manual', inputTestID, actionTestID, keyboardType = 'numeric', }) {
    const displayUnit = unit.trim();
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.overrideInputRow, !editable && styles.costInputRowDisabled], children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.overrideModeSegment, testID: actionTestID, children: [(0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, onPress: () => onSetEditable(false), style: [
                                    styles.overrideModeOption,
                                    !editable ? styles.overrideModeOptionActive : styles.overrideModeOptionInactive,
                                ], testID: actionTestID ? `${actionTestID}-automatic` : undefined, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                        styles.overrideModeOptionText,
                                        !editable ? styles.overrideModeOptionTextActive : styles.overrideModeOptionTextInactive,
                                    ], children: automaticLabel }) }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, onPress: () => onSetEditable(true), style: [
                                    styles.overrideModeOption,
                                    editable ? styles.overrideModeOptionActive : styles.overrideModeOptionInactive,
                                ], testID: actionTestID ? `${actionTestID}-manual` : undefined, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                        styles.overrideModeOptionText,
                                        editable ? styles.overrideModeOptionTextActive : styles.overrideModeOptionTextInactive,
                                    ], children: editableLabel }) })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.overrideInputValueWrap, children: [(0, jsx_runtime_1.jsx)(react_native_1.TextInput, { style: [styles.costInput, !editable && styles.costInputDisabled], value: value, onChangeText: onChangeText, keyboardType: keyboardType, editable: editable, placeholder: "0", placeholderTextColor: colors_1.default.textTertiary, testID: inputTestID }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.costInputUnit, !editable && styles.costInputUnitDisabled], children: displayUnit })] })] }), helperText ? ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: helperText })) : null] }));
}
function SiteConditionIcon({ conditionId, size = 40, color }) {
    const secondaryColor = color + '66';
    const groundColor = color;
    switch (conditionId) {
        case 'flat_normal':
            return ((0, jsx_runtime_1.jsxs)(react_native_svg_1.default, { width: size, height: size, viewBox: "0 0 40 40", children: [(0, jsx_runtime_1.jsx)(react_native_svg_1.Line, { x1: "4", y1: "26", x2: "36", y2: "26", stroke: groundColor, strokeWidth: "2" }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Rect, { x: "8", y: "16", width: "6", height: "10", rx: "1", fill: secondaryColor }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Rect, { x: "17", y: "12", width: "8", height: "14", rx: "1", fill: groundColor }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Rect, { x: "28", y: "18", width: "5", height: "8", rx: "1", fill: secondaryColor }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Line, { x1: "4", y1: "30", x2: "36", y2: "30", stroke: secondaryColor, strokeWidth: "1", strokeDasharray: "3,2" }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Line, { x1: "4", y1: "33", x2: "36", y2: "33", stroke: secondaryColor, strokeWidth: "1", strokeDasharray: "3,2" })] }));
        case 'flat_rocky':
            return ((0, jsx_runtime_1.jsxs)(react_native_svg_1.default, { width: size, height: size, viewBox: "0 0 40 40", children: [(0, jsx_runtime_1.jsx)(react_native_svg_1.Line, { x1: "4", y1: "26", x2: "36", y2: "26", stroke: groundColor, strokeWidth: "2" }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Rect, { x: "14", y: "14", width: "12", height: "12", rx: "1", fill: secondaryColor }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: "M6 33 L10 28 L14 31 L18 27 L22 30 L26 27 L30 29 L34 27 L36 33 Z", fill: groundColor, opacity: 0.3 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: "10", cy: "30", r: "2", fill: groundColor, opacity: 0.5 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: "20", cy: "32", r: "1.5", fill: groundColor, opacity: 0.5 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: "30", cy: "30", r: "2.5", fill: groundColor, opacity: 0.5 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: "15", cy: "31", r: "1", fill: groundColor, opacity: 0.4 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: "25", cy: "31", r: "1.8", fill: groundColor, opacity: 0.4 })] }));
        case 'inclined_normal':
            return ((0, jsx_runtime_1.jsxs)(react_native_svg_1.default, { width: size, height: size, viewBox: "0 0 40 40", children: [(0, jsx_runtime_1.jsx)(react_native_svg_1.Line, { x1: "4", y1: "32", x2: "36", y2: "20", stroke: groundColor, strokeWidth: "2" }), (0, jsx_runtime_1.jsxs)(react_native_svg_1.G, { transform: "translate(18, 10) rotate(0)", children: [(0, jsx_runtime_1.jsx)(react_native_svg_1.Rect, { x: "0", y: "0", width: "10", height: "12", rx: "1", fill: secondaryColor }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: "M0 0 L5 -4 L10 0 Z", fill: groundColor, opacity: 0.6 })] }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Line, { x1: "4", y1: "36", x2: "36", y2: "24", stroke: secondaryColor, strokeWidth: "1", strokeDasharray: "3,2" }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Line, { x1: "4", y1: "39", x2: "36", y2: "27", stroke: secondaryColor, strokeWidth: "1", strokeDasharray: "3,2" })] }));
        case 'inclined_rocky':
            return ((0, jsx_runtime_1.jsxs)(react_native_svg_1.default, { width: size, height: size, viewBox: "0 0 40 40", children: [(0, jsx_runtime_1.jsx)(react_native_svg_1.Line, { x1: "4", y1: "32", x2: "36", y2: "20", stroke: groundColor, strokeWidth: "2" }), (0, jsx_runtime_1.jsxs)(react_native_svg_1.G, { transform: "translate(18, 10)", children: [(0, jsx_runtime_1.jsx)(react_native_svg_1.Rect, { x: "0", y: "0", width: "10", height: "12", rx: "1", fill: secondaryColor }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: "M0 0 L5 -4 L10 0 Z", fill: groundColor, opacity: 0.6 })] }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: "M4 38 L10 33 L14 36 L20 31 L26 34 L32 29 L36 32 L36 38 Z", fill: groundColor, opacity: 0.3 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: "8", cy: "35", r: "2", fill: groundColor, opacity: 0.5 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: "18", cy: "33", r: "1.5", fill: groundColor, opacity: 0.5 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: "28", cy: "28", r: "2", fill: groundColor, opacity: 0.5 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: "33", cy: "26", r: "1.2", fill: groundColor, opacity: 0.4 })] }));
        case 'inclined_sandy':
            return ((0, jsx_runtime_1.jsxs)(react_native_svg_1.default, { width: size, height: size, viewBox: "0 0 40 40", children: [(0, jsx_runtime_1.jsx)(react_native_svg_1.Line, { x1: "4", y1: "32", x2: "36", y2: "20", stroke: groundColor, strokeWidth: "2" }), (0, jsx_runtime_1.jsxs)(react_native_svg_1.G, { transform: "translate(18, 10)", children: [(0, jsx_runtime_1.jsx)(react_native_svg_1.Rect, { x: "0", y: "0", width: "10", height: "12", rx: "1", fill: secondaryColor }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: "M0 0 L5 -4 L10 0 Z", fill: groundColor, opacity: 0.6 })] }), [6, 10, 14, 18, 22, 26, 30, 34].map((x, i) => ((0, jsx_runtime_1.jsxs)(react_native_svg_1.G, { children: [(0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: x, cy: 34 - (x - 4) * 0.375 + 1, r: "0.8", fill: groundColor, opacity: 0.35 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: x + 2, cy: 34 - (x - 2) * 0.375 + 3, r: "0.6", fill: groundColor, opacity: 0.3 }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Circle, { cx: x - 1, cy: 34 - (x - 5) * 0.375 + 5, r: "0.7", fill: groundColor, opacity: 0.25 })] }, i))), (0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: "M4 34 Q10 33 14 35 Q20 32 26 34 Q30 31 36 33 L36 38 L4 38 Z", fill: groundColor, opacity: 0.15 })] }));
        default:
            return null;
    }
}
function IntegerInputRow({ label, value, onChangeValue, min = 0, mode, onReset, }) {
    const handleDecrement = () => {
        if (react_native_1.Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onChangeValue(Math.max(min, value - 1));
    };
    const handleIncrement = () => {
        if (react_native_1.Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onChangeValue(value + 1);
    };
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.integerRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.integerInfo, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.integerLabelRow, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.integerLabel, children: label }) }), mode ? ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.integerStatusRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.integerStatus, mode === 'manual' && styles.integerStatusManual], children: mode === 'manual' ? 'Manual' : 'Auto' }), mode === 'manual' && onReset ? ((0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, onPress: () => {
                                    if (react_native_1.Platform.OS !== 'web') {
                                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }
                                    onReset();
                                }, testID: `reset-${label.toLowerCase()}`, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.integerReset, children: "Reset" }) })) : null] })) : null] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.integerControls, children: [(0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { style: [styles.integerBtn, value <= min && styles.integerBtnDisabled], onPress: handleDecrement, disabled: value <= min, activeOpacity: 0.7, testID: `decrement-${label.toLowerCase()}`, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.integerBtnText, value <= min && styles.integerBtnTextDisabled], children: MINUS_SYMBOL }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.integerValue, children: value }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { style: styles.integerBtn, onPress: handleIncrement, activeOpacity: 0.7, testID: `increment-${label.toLowerCase()}`, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.integerBtnText, children: "+" }) })] })] }));
}
function parseOptionalCurrencyInput(text) {
    const cleaned = text.replace(/[^0-9]/g, '');
    const parsed = parseInt(cleaned, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
function CollapsibleGroup({ title, icon, expanded, onToggle, children, }) {
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupWrap, children: [(0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { style: styles.groupHeader, activeOpacity: 0.85, onPress: onToggle, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupHeaderLeft, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.groupIconWrap, children: icon }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupTitle, children: title })] }), expanded ? ((0, jsx_runtime_1.jsx)(lucide_react_native_1.ChevronUp, { size: 18, color: colors_1.default.textSecondary })) : ((0, jsx_runtime_1.jsx)(lucide_react_native_1.ChevronDown, { size: 18, color: colors_1.default.textSecondary }))] }), expanded ? (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.groupBody, children: children }) : null] }));
}
function HighlightSummaryRow({ label, value, subtitle, }) {
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.summaryHighlightCard, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.summaryHighlightHeader, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.summaryHighlightLabel, children: label }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.summaryHighlightValue, children: value })] }), subtitle ? ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.summaryHighlightSubtext, children: subtitle })) : null] }));
}
function EstimateScreen() {
    var _a, _b, _c, _d, _e, _f;
    const router = (0, expo_router_1.useRouter)();
    const { locationId, setLocationId, qualityId, selectQuality, benchmarkOverridePerSqm, setBenchmarkOverridePerSqm, mainArea, setMainArea, terraceArea, setTerraceArea, balconyArea, setBalconyArea, storageBasementArea, setStorageBasementArea, parkingBasementArea, setParkingBasementArea, habitableBasementArea, setHabitableBasementArea, basementArea, includePool, setIncludePool, poolSizeId, setPoolSizeId, poolCustomArea, setPoolCustomArea, poolCustomDepth, setPoolCustomDepth, poolQualityId, setPoolQualityId, poolQualityOption, poolTypeId, setPoolTypeId, poolTypeOption, poolArea, poolDepth, contractorPercent, setContractorPercent, vatPercent, setVatPercent, vatAmount, setEfkaInsuranceManualCost, efkaInsuranceAutoCost, efkaInsuranceAmount, efkaInsuranceManualOverrideActive, setManualContingencyPercent, appliedContingencyPercent, siteConditionId, setSiteConditionId, siteCondition, landscapingArea, setLandscapingArea, landscapingCost, landValue, setLandValue, landAcquisitionCosts, setLandAcquisitionCosts, landAcquisitionAmount, landAcquisitionRatePercent, landAcquisitionCostsMode, setLandAcquisitionCostsMode, bathrooms, bathroomsMode, setBathrooms, resetBathrooms, wcs, wcsMode, setWcs, resetWcs, bedroomCount, bedroomCountMode, setBedroomCount, resetBedroomCount, kitchenCount, kitchenCountMode, setKitchenCount, resetKitchenCount, customKitchenUnitCost, setCustomKitchenUnitCost, generalFurniture, setGeneralFurniture, generalFurnitureCustomized, setGeneralFurnitureMode, dataSecurityPackageLevel, setDataSecurityPackageLevel, dataSecurityManualQuote, setDataSecurityManualQuote, dataSecurityDefaultPackageCost, dataSecurityAppliedPackageCost, automationPackageLevel, setAutomationPackageLevel, automationManualQuote, setAutomationManualQuote, automationDefaultPackageCost, automationAppliedPackageCost, hvacSelections, toggleHvacOption, hvacCosts, totalHvacCost, location, quality, buildingArea, benchmarkPreviewPerQuality, plotSize, setPlotSize, sizeCorrectionFactor, correctedCostPerSqm, finalCostPerSqm, contractorCost, poolCost, permitDesignFee, totalCost, utilityConnectionId, setUtilityConnectionId, customUtilityCost, setCustomUtilityCost, utilityConnectionCost, contingencyPercent, recommendedContingencyCost, permitDesignBuildingArea, groundwaterConditionId, setGroundwaterConditionId, siteAccessibilityId, setSiteAccessibilityId, siteAccessibility, constructionSubtotal, contingencyCost, suggestedKitchenUnitCost, suggestedGeneralFurniture, kitchenUnitCost, } = (0, EstimateContext_1.useEstimate)();
    const { width: windowWidth } = (0, react_native_1.useWindowDimensions)();
    const benchmarkInputRef = react_1.default.useRef(null);
    const isLargeProject = permitDesignBuildingArea > construction_1.PERMIT_DESIGN_BASELINE_AREA_MAX;
    const sizeCorrectionLabel = (0, construction_1.formatSizeCorrectionFactorLabel)(sizeCorrectionFactor);
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
    const referenceBenchmarkPerSqm = finalCostPerSqm;
    const useStackedBenchmarkCardLayout = windowWidth < 560;
    const qualityBenchmarkOptions = [
        {
            id: 'economy',
            title: 'Economy',
            descriptor: 'Cost-conscious residential benchmark',
            benchmarkValue: (_a = benchmarkPreviewPerQuality.economy) !== null && _a !== void 0 ? _a : 0,
            benchmarkLabel: `${(0, format_1.formatCurrency)((_b = benchmarkPreviewPerQuality.economy) !== null && _b !== void 0 ? _b : 0)} /${SQUARE_METER_UNIT}`,
        },
        {
            id: 'midRange',
            title: 'Mid-Range',
            descriptor: 'Balanced residential benchmark',
            benchmarkValue: (_c = benchmarkPreviewPerQuality.midRange) !== null && _c !== void 0 ? _c : 0,
            benchmarkLabel: `${(0, format_1.formatCurrency)((_d = benchmarkPreviewPerQuality.midRange) !== null && _d !== void 0 ? _d : 0)} /${SQUARE_METER_UNIT}`,
        },
        {
            id: 'luxury',
            title: 'Luxury',
            descriptor: 'High-spec residential benchmark',
            benchmarkValue: (_e = benchmarkPreviewPerQuality.luxury) !== null && _e !== void 0 ? _e : 0,
            benchmarkLabel: `${(0, format_1.formatCurrency)((_f = benchmarkPreviewPerQuality.luxury) !== null && _f !== void 0 ? _f : 0)} /${SQUARE_METER_UNIT}`,
        },
    ];
    const handleLocationSelect = (0, react_1.useCallback)((id) => {
        if (react_native_1.Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setLocationId(id);
    }, [setLocationId]);
    const handleQualitySelect = (0, react_1.useCallback)((id, benchmarkValue) => {
        if (react_native_1.Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        if (benchmarkMode === 'manual') {
            setBenchmarkOverridePerSqm(benchmarkValue);
        }
        selectQuality(id);
    }, [benchmarkMode, selectQuality, setBenchmarkOverridePerSqm]);
    const activateManualBenchmarkOverride = (0, react_1.useCallback)((benchmarkValue) => {
        if (react_native_1.Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        if (!hasBenchmarkOverride) {
            setBenchmarkOverridePerSqm(benchmarkValue);
        }
        requestAnimationFrame(() => {
            var _a;
            (_a = benchmarkInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        });
    }, [hasBenchmarkOverride, setBenchmarkOverridePerSqm]);
    const handleSiteConditionSelect = (0, react_1.useCallback)((id) => {
        if (react_native_1.Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setSiteConditionId(id);
    }, [setSiteConditionId]);
    const [showCostBasisInfo, setShowCostBasisInfo] = react_1.default.useState(false);
    const [showSiteConditionInfo, setShowSiteConditionInfo] = react_1.default.useState(false);
    const [showHvacInfo, setShowHvacInfo] = react_1.default.useState(false);
    const [showPoolInfo, setShowPoolInfo] = react_1.default.useState(false);
    const [showPermitDesignInfo, setShowPermitDesignInfo] = react_1.default.useState(false);
    const [showUtilityInfo, setShowUtilityInfo] = react_1.default.useState(false);
    const [showGroundwaterInfo, setShowGroundwaterInfo] = react_1.default.useState(false);
    const [showAccessibilityInfo, setShowAccessibilityInfo] = react_1.default.useState(false);
    const [showLandPlotGroup, setShowLandPlotGroup] = react_1.default.useState(true);
    const [showBuildingInteriorGroup, setShowBuildingInteriorGroup] = react_1.default.useState(true);
    const [showPlotExternalGroup, setShowPlotExternalGroup] = react_1.default.useState(true);
    const [showBenchmarkGroup, setShowBenchmarkGroup] = react_1.default.useState(true);
    const [showOutdoorAdditionsGroup, setShowOutdoorAdditionsGroup] = react_1.default.useState(true);
    const [showSystemsUpgradesGroup, setShowSystemsUpgradesGroup] = react_1.default.useState(true);
    const [showFeesMarginsGroup, setShowFeesMarginsGroup] = react_1.default.useState(true);
    const renderLandPlotGroup = () => ((0, jsx_runtime_1.jsxs)(CollapsibleGroup, { title: "Land & Plot", icon: (0, jsx_runtime_1.jsx)(lucide_react_native_1.LandPlot, { size: 16, color: colors_1.default.accent }), expanded: showLandPlotGroup, onToggle: () => setShowLandPlotGroup((prev) => !prev), children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.groupSection, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.card, children: [(0, jsx_runtime_1.jsx)(SliderInput_1.default, { label: "Land cost", subtitle: (0, format_1.formatCurrency)(landValue), value: landValue, onChangeValue: setLandValue, min: 10000, max: 1500000, step: 1000, suffix: ` ${EURO_SYMBOL}`, testID: "slider-land-value" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.poolSubsectionTitle, children: "Incidental Land Acquisition Costs" }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, style: [styles.utilityOptionRow, landAcquisitionCostsMode === 'auto' && styles.utilityOptionRowSelected], onPress: () => {
                                if (react_native_1.Platform.OS !== 'web') {
                                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }
                                setLandAcquisitionCostsMode('auto');
                            }, testID: "land-acquisition-mode-auto", children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.optionInfo, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.optionLabel, landAcquisitionCostsMode === 'auto' && { color: colors_1.default.accent }], children: `Auto estimate (${(0, format_1.formatPercent)(landAcquisitionRatePercent)})` }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: `Derived from land cost ${MULTIPLY_SYMBOL} ${(0, format_1.formatDecimal)(landAcquisitionRatePercent / 100, 2)}` })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.radioOuter, landAcquisitionCostsMode === 'auto' && styles.radioOuterSelected], children: landAcquisitionCostsMode === 'auto' && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.radioInner }) })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, style: [styles.utilityOptionRow, landAcquisitionCostsMode === 'manual' && styles.utilityOptionRowSelected], onPress: () => {
                                if (react_native_1.Platform.OS !== 'web') {
                                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }
                                if (landAcquisitionCostsMode === 'auto') {
                                    setLandAcquisitionCosts(landAcquisitionAmount);
                                }
                                setLandAcquisitionCostsMode('manual');
                            }, testID: "land-acquisition-mode-manual", children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.optionInfo, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.optionLabel, landAcquisitionCostsMode === 'manual' && { color: colors_1.default.accent }], children: "Manual override" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: "Enter incidental acquisition costs directly" })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.radioOuter, landAcquisitionCostsMode === 'manual' && styles.radioOuterSelected], children: landAcquisitionCostsMode === 'manual' && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.radioInner }) })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), landAcquisitionCostsMode === 'manual' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.costInputRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.TextInput, { style: styles.costInput, value: landAcquisitionCosts > 0 ? (0, format_1.formatNumber)(landAcquisitionCosts) : '', onChangeText: (text) => {
                                                const cleaned = text.replace(/[^0-9]/g, '');
                                                setLandAcquisitionCosts(parseInt(cleaned, 10) || 0);
                                            }, keyboardType: "numeric", placeholder: "0", placeholderTextColor: colors_1.default.textTertiary, testID: "land-acquisition-costs-input" }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.costInputUnit, children: [" ", EURO_SYMBOL] })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider })] })) : null, (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.effectiveRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveLabel, children: "Estimated Acquisition Costs" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveValue, children: (0, format_1.formatCurrency)(displayedLandAcquisitionCosts) })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveFormula, children: landAcquisitionCostsMode === 'auto'
                                ? `${(0, format_1.formatCurrency)(displayedLandAcquisitionCosts)} (${(0, format_1.formatPercent)(landAcquisitionRatePercent)} of ${(0, format_1.formatCurrency)(landValue)})`
                                : 'Manual override value' })] }) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSection, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionTitle, children: "Plot Size" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.card, children: (0, jsx_runtime_1.jsx)(SliderInput_1.default, { label: "Plot size", subtitle: "", value: plotSize, onChangeValue: setPlotSize, min: 500, max: 10000, step: 100, suffix: SQUARE_METER_UNIT, testID: "slider-plot-size" }) })] })] }));
    const renderBuildingDefinitionGroup = () => ((0, jsx_runtime_1.jsxs)(CollapsibleGroup, { title: "Building Definition", icon: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Home, { size: 16, color: colors_1.default.accent }), expanded: showBuildingInteriorGroup, onToggle: () => setShowBuildingInteriorGroup((prev) => !prev), children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSection, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionTitle, children: "Building Size" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.card, styles.cardCompactTop], children: [(0, jsx_runtime_1.jsx)(SliderInput_1.default, { label: "Building Area", subtitle: "Total above-ground building area, including walls, measured to the outer face of the exterior structural walls. Basement, covered terraces, and balconies are entered separately.", value: mainArea, onChangeValue: setMainArea, min: 80, max: 400, step: 5, testID: "slider-living-area" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.inlineSubsectionLabel, children: "Basement" }), (0, jsx_runtime_1.jsx)(SliderInput_1.default, { label: "Storage/Technical Basement Area", subtitle: "Technical rooms, storage, utility spaces", value: storageBasementArea, onChangeValue: setStorageBasementArea, min: 0, max: 250, step: 5, badge: "50%", testID: "slider-storage-basement-area" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(SliderInput_1.default, { label: "Parking Basement Area", subtitle: "Garage and vehicle storage areas", value: parkingBasementArea, onChangeValue: setParkingBasementArea, min: 0, max: 250, step: 5, badge: "65%", testID: "slider-parking-basement-area" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(SliderInput_1.default, { label: "Habitable Basement Area", subtitle: "Basement floor area used as habitable interior space. Storage and parking basement areas are treated separately if applicable.", value: habitableBasementArea, onChangeValue: setHabitableBasementArea, min: 0, max: 250, step: 5, badge: "85%", testID: "slider-habitable-basement-area" }), basementArea > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.effectiveRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveLabel, children: "Basement Mix" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveValue, children: `${(0, format_1.formatNumber)(basementArea)} ${SQUARE_METER_UNIT}` })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveFormula, children: `${storageBasementArea > 0 ? `${(0, format_1.formatNumber)(storageBasementArea)} ${SQUARE_METER_UNIT} Storage/Technical Basement Area` : ''}${storageBasementArea > 0 && (parkingBasementArea > 0 || habitableBasementArea > 0) ? ` ${MIDDLE_DOT} ` : ''}${parkingBasementArea > 0 ? `${(0, format_1.formatNumber)(parkingBasementArea)} ${SQUARE_METER_UNIT} Parking Basement Area` : ''}${parkingBasementArea > 0 && habitableBasementArea > 0 ? ` ${MIDDLE_DOT} ` : ''}${habitableBasementArea > 0 ? `${(0, format_1.formatNumber)(habitableBasementArea)} ${SQUARE_METER_UNIT} Habitable Basement Area` : ''}` })] })), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(SliderInput_1.default, { label: "Covered Terraces", subtitle: "Counted at 50% of area", value: terraceArea, onChangeValue: setTerraceArea, badge: "50%", min: 0, max: 120, step: 5, testID: "slider-terrace-area" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(SliderInput_1.default, { label: "Balcony Area", subtitle: "Open balconies, cantilevered spaces", value: balconyArea, onChangeValue: setBalconyArea, badge: "30%", min: 0, max: 80, step: 5, testID: "slider-balcony-area" })] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSection, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionTitle, children: "Interior Program & Furnishing" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.card, styles.cardCompactTop], children: [(0, jsx_runtime_1.jsx)(IntegerInputRow, { label: "Bedrooms", value: bedroomCount, onChangeValue: setBedroomCount, min: 1, mode: bedroomCountMode, onReset: resetBedroomCount }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(IntegerInputRow, { label: "Bathrooms", value: bathrooms, onChangeValue: setBathrooms, min: 0, mode: bathroomsMode, onReset: resetBathrooms }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(IntegerInputRow, { label: "WCs (guest WC)", value: wcs, onChangeValue: setWcs, min: 0, mode: wcsMode, onReset: resetWcs })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.card, styles.cardCompactTop], children: [(0, jsx_runtime_1.jsx)(IntegerInputRow, { label: "Kitchens", value: kitchenCount, onChangeValue: setKitchenCount, min: 0, mode: kitchenCountMode, onReset: resetKitchenCount }), kitchenCount > 0 ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.cardHeader, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.cardTitle, children: "Kitchen Unit Cost" }) }), (0, jsx_runtime_1.jsx)(OverrideValueField, { value: (0, format_1.formatNumber)(kitchenUnitCost), onChangeText: (text) => {
                                            const cleaned = text.replace(/[^0-9]/g, '');
                                            const num = parseInt(cleaned, 10);
                                            if (isNaN(num) || num <= 0) {
                                                setCustomKitchenUnitCost(null);
                                            }
                                            else {
                                                setCustomKitchenUnitCost(num);
                                            }
                                        }, editable: customKitchenUnitCost !== null, unit: ` ${EURO_SYMBOL}`, helperText: customKitchenUnitCost !== null
                                            ? `Automatic reference: ${(0, format_1.formatCurrency)(suggestedKitchenUnitCost)} quality and area adjusted.`
                                            : `Suggested ${(0, format_1.formatCurrency)(suggestedKitchenUnitCost)} ${MIDDLE_DOT} quality and area adjusted`, onSetEditable: (nextEditable) => {
                                            if (react_native_1.Platform.OS !== 'web') {
                                                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }
                                            setCustomKitchenUnitCost(nextEditable ? suggestedKitchenUnitCost : null);
                                        }, inputTestID: "kitchen-unit-cost-input", actionTestID: "kitchen-unit-cost-toggle" })] })) : null, (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.cardHeader, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.cardTitle, children: "KG 610 Furniture Allowance" }) }), (0, jsx_runtime_1.jsx)(OverrideValueField, { value: (0, format_1.formatNumber)(appliedGeneralFurniture), onChangeText: (text) => {
                                    const cleaned = text.replace(/[^0-9]/g, '');
                                    setGeneralFurniture(parseInt(cleaned, 10) || 0);
                                }, editable: generalFurnitureCustomized, unit: ` ${EURO_SYMBOL}`, helperText: generalFurnitureCustomized
                                    ? `Automatic reference: ${(0, format_1.formatCurrency)(suggestedGeneralFurniture)} based on bedrooms, building area, kitchen count, and quality.`
                                    : 'Automatically recommended from bedrooms, building area, kitchen count, and quality.', onSetEditable: (nextEditable) => {
                                    if (react_native_1.Platform.OS !== 'web') {
                                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }
                                    setGeneralFurnitureMode(nextEditable);
                                }, inputTestID: "general-furniture-base-input", actionTestID: "general-furniture-manual-toggle" })] })] })] }));
    const renderSystemsUpgradesGroup = () => ((0, jsx_runtime_1.jsxs)(CollapsibleGroup, { title: "Systems & Upgrades", icon: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Settings, { size: 16, color: colors_1.default.accent }), expanded: showSystemsUpgradesGroup, onToggle: () => setShowSystemsUpgradesGroup((prev) => !prev), children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSection, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionTitle, children: "Digital Infrastructure & Security" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionSubtitle, children: "Essential level is included in the base benchmark (0% adjustment)." }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.card, children: [DATA_SECURITY_LEVEL_OPTIONS.map((option, index) => {
                                const isSelected = dataSecurityPackageLevel === option.id;
                                return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [index > 0 && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, style: [styles.utilityOptionRow, isSelected && styles.utilityOptionRowSelected], onPress: () => {
                                                if (react_native_1.Platform.OS !== 'web') {
                                                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                }
                                                setDataSecurityPackageLevel(option.id);
                                            }, testID: `data-security-package-${option.id}`, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.optionInfo, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.optionLabel, isSelected && { color: colors_1.default.accent }], children: option.label }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: option.description })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.radioOuter, isSelected && styles.radioOuterSelected], children: isSelected && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.radioInner }) })] })] }, option.id));
                            }), dataSecurityPackageLevel === 'custom' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: "Enter a custom uplift above the benchmark-included baseline for Digital Infrastructure & Security." }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.costInputRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.TextInput, { style: styles.costInput, value: dataSecurityManualQuote !== null ? (0, format_1.formatNumber)(dataSecurityManualQuote) : '', onChangeText: (text) => {
                                                    setDataSecurityManualQuote(parseOptionalCurrencyInput(text));
                                                }, keyboardType: "numeric", placeholder: "0", placeholderTextColor: colors_1.default.textTertiary, testID: "data-security-quote-input" }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.costInputUnit, children: [" ", EURO_SYMBOL] })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: "Custom uplift above baseline" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: `Total subgroup amount with custom uplift: ${(0, format_1.formatCurrency)(dataSecurityAppliedPackageCost)}` })] })) : dataSecurityPackageLevel !== 'essential' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: `Total subgroup amount for selected level: ${(0, format_1.formatCurrency)(dataSecurityDefaultPackageCost)}.` })] })) : null] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSection, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionTitle, children: "Smart Control & Automation" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionSubtitle, children: "No automation applies the base assumption (0% adjustment)." }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.card, children: [AUTOMATION_LEVEL_OPTIONS.map((option, index) => {
                                const isSelected = automationPackageLevel === option.id;
                                return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [index > 0 && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, style: [styles.utilityOptionRow, isSelected && styles.utilityOptionRowSelected], onPress: () => {
                                                if (react_native_1.Platform.OS !== 'web') {
                                                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                }
                                                setAutomationPackageLevel(option.id);
                                            }, testID: `automation-package-${option.id}`, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.optionInfo, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.optionLabel, isSelected && { color: colors_1.default.accent }], children: option.label }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: option.description })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.radioOuter, isSelected && styles.radioOuterSelected], children: isSelected && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.radioInner }) })] })] }, option.id));
                            }), automationPackageLevel === 'custom' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: "Enter a custom amount for Smart Control & Automation." }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.costInputRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.TextInput, { style: styles.costInput, value: automationManualQuote !== null ? (0, format_1.formatNumber)(automationManualQuote) : '', onChangeText: (text) => {
                                                    setAutomationManualQuote(parseOptionalCurrencyInput(text));
                                                }, keyboardType: "numeric", placeholder: "0", placeholderTextColor: colors_1.default.textTertiary, testID: "automation-quote-input" }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.costInputUnit, children: [" ", EURO_SYMBOL] })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: "Custom amount used in the calculation" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: `Total subgroup amount with custom input: ${(0, format_1.formatCurrency)(automationAppliedPackageCost)}` })] })) : automationPackageLevel !== 'none' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: `Fixed uplift amount for selected level: ${(0, format_1.formatCurrency)(automationDefaultPackageCost)}.` })] })) : null] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSection, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSectionHeader, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionHeaderTitle, children: "Energy Systems" }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: () => setShowHvacInfo(!showHvacInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "hvac-info-btn", children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Info, { size: 15, color: colors_1.default.textTertiary }) })] }), showHvacInfo && ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tooltipCard, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tooltipText, children: sanitizeEstimateText(construction_1.HVAC_TOOLTIP) }) })), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.card, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.hvacBaseNote, children: "Base: Heat pump + fan-coil / VRV system included" }), construction_1.HVAC_OPTIONS.map((opt, idx) => {
                                var _a;
                                const isEnabled = (_a = hvacSelections[opt.id]) !== null && _a !== void 0 ? _a : false;
                                const hvacItem = hvacCosts.find((h) => h.option.id === opt.id);
                                return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [idx > 0 && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.optionRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.optionInfo, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionLabel, children: opt.name }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: isEnabled && hvacItem
                                                                ? `${(0, format_1.formatCurrency)(hvacItem.cost)} ${MIDDLE_DOT} ${opt.description}`
                                                                : opt.description })] }), (0, jsx_runtime_1.jsx)(react_native_1.Switch, { value: isEnabled, onValueChange: () => {
                                                        if (react_native_1.Platform.OS !== 'web') {
                                                            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                        }
                                                        toggleHvacOption(opt.id);
                                                    }, trackColor: { false: colors_1.default.border, true: colors_1.default.accent }, thumbColor: colors_1.default.white, testID: `hvac-toggle-${opt.id}` })] })] }, opt.id));
                            }), totalHvacCost > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.effectiveRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveLabel, children: "Energy Systems Total" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveValue, children: (0, format_1.formatCurrency)(totalHvacCost) })] })] }))] })] })] }));
    const renderSiteParametersGroup = () => ((0, jsx_runtime_1.jsx)(CollapsibleGroup, { title: "Site Parameters", icon: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Mountain, { size: 16, color: colors_1.default.accent }), expanded: showPlotExternalGroup, onToggle: () => setShowPlotExternalGroup((prev) => !prev), children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSection, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionTitle, children: "Site Conditions & Infrastructure" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupNestedBlock, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupInlineHeader, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupInlineTitle, children: "Slope & Soil Type" }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: () => setShowSiteConditionInfo(!showSiteConditionInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "site-condition-info-btn", children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Info, { size: 15, color: colors_1.default.textTertiary }) })] }), showSiteConditionInfo && ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tooltipCard, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tooltipText, children: sanitizeEstimateText(construction_1.SITE_CONDITIONS_TOOLTIP) }) })), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.siteConditionsGrid, children: construction_1.SITE_CONDITIONS.map((cond) => {
                                const isSelected = siteConditionId === cond.id;
                                return ((0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, style: [styles.siteCondCard, isSelected && styles.siteCondCardSelected], onPress: () => handleSiteConditionSelect(cond.id), testID: `site-condition-${cond.id}`, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.siteCondIconWrap, isSelected && styles.siteCondIconWrapSelected], children: (0, jsx_runtime_1.jsx)(SiteConditionIcon, { conditionId: cond.id, size: 40, color: isSelected ? colors_1.default.accent : colors_1.default.primary }) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.siteCondTextWrap, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.siteCondName, isSelected && styles.siteCondNameSelected], children: cond.name }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.siteCondDesc, isSelected && styles.siteCondDescSelected], children: cond.description })] })] }, cond.id));
                            }) }), siteConditionId === 'inclined_sandy' && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.warningCard, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.AlertTriangle, { size: 16, color: colors_1.default.warning }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.warningContent, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.warningTitle, children: "Important notice" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.warningText, children: sanitizeEstimateText(construction_1.UNSTABLE_SOIL_WARNING) })] })] }))] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupNestedBlock, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupInlineHeader, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupInlineTitle, children: "Groundwater" }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: () => setShowGroundwaterInfo(!showGroundwaterInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "groundwater-info-btn", children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Info, { size: 15, color: colors_1.default.textTertiary }) })] }), showGroundwaterInfo && ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tooltipCard, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tooltipText, children: sanitizeEstimateText(construction_1.GROUNDWATER_TOOLTIP) }) })), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.card, children: construction_1.GROUNDWATER_CONDITIONS.map((gw, idx) => {
                                const isSelected = groundwaterConditionId === gw.id;
                                return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [idx > 0 && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, style: [styles.utilityOptionRow, isSelected && styles.utilityOptionRowSelected], onPress: () => {
                                                if (react_native_1.Platform.OS !== 'web') {
                                                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                }
                                                setGroundwaterConditionId(gw.id);
                                            }, testID: `groundwater-${gw.id}`, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.optionInfo, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.optionLabel, isSelected && { color: colors_1.default.accent }], children: gw.name }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: gw.description })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.radioOuter, isSelected && styles.radioOuterSelected], children: isSelected && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.radioInner }) })] })] }, gw.id));
                            }) }), groundwaterConditionId === 'high' && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.warningCard, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.AlertTriangle, { size: 16, color: colors_1.default.warning }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.warningContent, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.warningTitle, children: "Important notice" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.warningText, children: sanitizeEstimateText(construction_1.HIGH_GROUNDWATER_WARNING) })] })] }))] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupNestedBlock, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupInlineHeader, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupInlineTitle, children: "Accessibility" }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: () => setShowAccessibilityInfo(!showAccessibilityInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "accessibility-info-btn", children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Info, { size: 15, color: colors_1.default.textTertiary }) })] }), showAccessibilityInfo && ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tooltipCard, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tooltipText, children: sanitizeEstimateText(construction_1.SITE_ACCESSIBILITY_TOOLTIP) }) })), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.card, children: construction_1.SITE_ACCESSIBILITY_OPTIONS.map((acc, idx) => {
                                const isSelected = siteAccessibilityId === acc.id;
                                return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [idx > 0 && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, style: [styles.utilityOptionRow, isSelected && styles.utilityOptionRowSelected], onPress: () => {
                                                if (react_native_1.Platform.OS !== 'web') {
                                                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                }
                                                setSiteAccessibilityId(acc.id);
                                            }, testID: `accessibility-${acc.id}`, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.optionInfo, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.optionLabel, isSelected && { color: colors_1.default.accent }], children: acc.name }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: acc.description })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.radioOuter, isSelected && styles.radioOuterSelected], children: isSelected && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.radioInner }) })] })] }, acc.id));
                            }) }), (siteAccessibilityId === 'difficult' || siteAccessibilityId === 'very_difficult') && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.warningCard, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.AlertTriangle, { size: 16, color: colors_1.default.warning }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.warningContent, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.warningText, children: sanitizeEstimateText(siteAccessibilityId === 'very_difficult' ? construction_1.VERY_DIFFICULT_ACCESS_WARNING : construction_1.DIFFICULT_ACCESS_WARNING) }) })] }))] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupNestedBlock, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupInlineHeader, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupInlineTitle, children: "Utility Network Connections" }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: () => setShowUtilityInfo(!showUtilityInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "utility-info-btn", children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Info, { size: 15, color: colors_1.default.textTertiary }) })] }), showUtilityInfo && ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tooltipCard, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tooltipText, children: sanitizeEstimateText(construction_1.UTILITY_CONNECTION_TOOLTIP) }) })), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.card, children: [construction_1.UTILITY_CONNECTION_OPTIONS.map((opt, idx) => {
                                    const isSelected = utilityConnectionId === opt.id;
                                    return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [idx > 0 && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, style: [styles.utilityOptionRow, isSelected && styles.utilityOptionRowSelected], onPress: () => {
                                                    if (react_native_1.Platform.OS !== 'web') {
                                                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    }
                                                    setUtilityConnectionId(opt.id);
                                                }, testID: `utility-${opt.id}`, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.optionInfo, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.optionLabel, isSelected && { color: colors_1.default.accent }], children: opt.name }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: opt.id !== 'custom' ? `${(0, format_1.formatCurrency)(opt.cost)} ${MIDDLE_DOT} ${opt.description}` : opt.description })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.radioOuter, isSelected && styles.radioOuterSelected], children: isSelected && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.radioInner }) })] })] }, opt.id));
                                }), utilityConnectionId === 'custom' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.costInputRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.TextInput, { style: styles.costInput, value: customUtilityCost > 0 ? (0, format_1.formatNumber)(customUtilityCost) : '', onChangeText: (text) => {
                                                        const cleaned = text.replace(/[^0-9]/g, '');
                                                        setCustomUtilityCost(parseInt(cleaned, 10) || 0);
                                                    }, keyboardType: "numeric", placeholder: "0", placeholderTextColor: colors_1.default.textTertiary, testID: "utility-custom-cost" }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.costInputUnit, children: [" ", EURO_SYMBOL] })] })] })), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.effectiveRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveLabel, children: "Connection Cost" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveValue, children: (0, format_1.formatCurrency)(utilityConnectionCost) })] })] })] })] }) }));
    const renderOutdoorAdditionsGroup = () => ((0, jsx_runtime_1.jsxs)(CollapsibleGroup, { title: "Outdoor & Additions", icon: (0, jsx_runtime_1.jsx)(lucide_react_native_1.TreePine, { size: 16, color: colors_1.default.accent }), expanded: showOutdoorAdditionsGroup, onToggle: () => setShowOutdoorAdditionsGroup((prev) => !prev), children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSection, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionTitle, children: "Landscape & Outdoor Works" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.card, children: [(0, jsx_runtime_1.jsx)(SliderInput_1.default, { label: "Landscaping Area", subtitle: "Garden, driveways, outdoor areas", value: landscapingArea, onChangeValue: setLandscapingArea, min: 0, max: 1500, step: 10, testID: "slider-landscaping-area" }), landscapingArea > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.effectiveRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveLabel, children: "Landscaping Cost" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveValue, children: (0, format_1.formatCurrency)(landscapingCost) })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveFormula, children: `Based on ${(0, format_1.formatCurrency)(40)} /${SQUARE_METER_UNIT} ${MIDDLE_DOT} ${siteCondition.name}` })] }))] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSection, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSectionHeader, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionHeaderTitle, children: "Swimming Pool" }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: () => setShowPoolInfo(!showPoolInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "pool-info-btn", children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Info, { size: 15, color: colors_1.default.textTertiary }) })] }), showPoolInfo && ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tooltipCard, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tooltipText, children: sanitizeEstimateText(construction_1.POOL_TOOLTIP) }) })), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.card, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.optionRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.optionInfo, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionLabel, children: "Include Swimming Pool" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: includePool
                                                    ? `${(0, format_1.formatCurrency)(poolCost)} ${MIDDLE_DOT} ${poolQualityOption.name}`
                                                    : 'Not included in estimate' })] }), (0, jsx_runtime_1.jsx)(react_native_1.Switch, { value: includePool, onValueChange: (val) => {
                                            if (react_native_1.Platform.OS !== 'web') {
                                                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }
                                            setIncludePool(val);
                                        }, trackColor: { false: colors_1.default.border, true: colors_1.default.accent }, thumbColor: colors_1.default.white, testID: "pool-toggle" })] }), includePool && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.poolSubsectionTitle, children: "Pool Size" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.poolSizeGrid, children: construction_1.POOL_SIZE_OPTIONS.map((opt) => {
                                            const isSelected = poolSizeId === opt.id;
                                            return ((0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, style: [styles.poolSizeBtn, isSelected && styles.poolSizeBtnSelected], onPress: () => {
                                                    if (react_native_1.Platform.OS !== 'web') {
                                                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    }
                                                    setPoolSizeId(opt.id);
                                                }, testID: `pool-size-${opt.id}`, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.poolSizeName, isSelected && styles.poolSizeNameSelected], children: opt.name }), opt.area > 0 && ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.poolSizeArea, isSelected && styles.poolSizeAreaSelected], children: `${(0, format_1.formatNumber)(opt.area)} ${SQUARE_METER_UNIT}` }))] }, opt.id));
                                        }) }), poolSizeId === 'custom' && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.poolCustomRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.poolCustomField, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.poolCustomLabel, children: "Pool Area" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.poolCustomInputWrap, children: [(0, jsx_runtime_1.jsx)(react_native_1.TextInput, { style: styles.poolCustomInput, value: poolCustomArea > 0 ? (0, format_1.formatNumber)(poolCustomArea) : '', onChangeText: (text) => {
                                                                    const cleaned = text.replace(/[^0-9]/g, '');
                                                                    setPoolCustomArea(parseInt(cleaned, 10) || 0);
                                                                }, keyboardType: "numeric", placeholder: "0", placeholderTextColor: colors_1.default.textTertiary, testID: "pool-custom-area" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.poolCustomUnit, children: SQUARE_METER_UNIT })] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.poolCustomField, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.poolCustomLabel, children: "Pool Depth" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.poolCustomInputWrap, children: [(0, jsx_runtime_1.jsx)(react_native_1.TextInput, { style: styles.poolCustomInput, value: poolCustomDepth > 0 ? (0, format_1.formatDecimal)(poolCustomDepth, 2) : '', onChangeText: (text) => {
                                                                    const cleaned = text.replace(/[^0-9,]/g, '').replace(',', '.');
                                                                    const num = parseFloat(cleaned);
                                                                    setPoolCustomDepth(isNaN(num) ? 0 : num);
                                                                }, keyboardType: "decimal-pad", placeholder: (0, format_1.formatDecimal)(1.4, 2), placeholderTextColor: colors_1.default.textTertiary, testID: "pool-custom-depth" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.poolCustomUnit, children: "m" })] })] })] })), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.poolSubsectionTitle, children: "Pool Quality" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.poolOptionGrid, children: construction_1.POOL_QUALITY_OPTIONS.map((opt) => {
                                            const isSelected = poolQualityId === opt.id;
                                            return ((0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, style: [styles.poolOptionBtn, isSelected && styles.poolOptionBtnSelected], onPress: () => {
                                                    if (react_native_1.Platform.OS !== 'web') {
                                                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    }
                                                    setPoolQualityId(opt.id);
                                                }, testID: `pool-quality-${opt.id}`, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.poolOptionName, isSelected && styles.poolOptionNameSelected], children: opt.name }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.poolOptionDesc, isSelected && styles.poolOptionDescSelected], children: opt.description })] }, opt.id));
                                        }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.poolSubsectionTitle, children: "Pool Type" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.poolOptionGrid, children: construction_1.POOL_TYPE_OPTIONS.map((opt) => {
                                            const isSelected = poolTypeId === opt.id;
                                            return ((0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, style: [styles.poolOptionBtn, isSelected && styles.poolOptionBtnSelected], onPress: () => {
                                                    if (react_native_1.Platform.OS !== 'web') {
                                                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    }
                                                    setPoolTypeId(opt.id);
                                                }, testID: `pool-type-${opt.id}`, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.poolOptionName, isSelected && styles.poolOptionNameSelected], children: opt.name }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.poolOptionDesc, isSelected && styles.poolOptionDescSelected], children: opt.description })] }, opt.id));
                                        }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.effectiveRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveLabel, children: "Pool Cost" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveValue, children: (0, format_1.formatCurrency)(poolCost) })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveFormula, children: `${(0, format_1.formatNumber)(poolArea)} ${SQUARE_METER_UNIT} ${MIDDLE_DOT} ${(0, format_1.formatDecimal)(poolDepth, 2)} m depth ${MIDDLE_DOT} ${poolQualityOption.name} ${MIDDLE_DOT} ${poolTypeOption.name}` })] }))] })] })] }));
    const renderConstructionBenchmarkGroup = () => ((0, jsx_runtime_1.jsxs)(CollapsibleGroup, { title: "Construction Benchmark", icon: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Ruler, { size: 16, color: colors_1.default.accent }), expanded: showBenchmarkGroup, onToggle: () => setShowBenchmarkGroup((prev) => !prev), children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSection, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionTitle, children: "Location" }), (0, jsx_runtime_1.jsx)(react_native_1.ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: styles.chipsRow, children: construction_1.LOCATIONS.map((loc) => {
                            const isSelected = locationId === loc.id;
                            return ((0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, style: [styles.chip, isSelected && styles.chipSelected], onPress: () => handleLocationSelect(loc.id), testID: `location-${loc.id}`, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.chipName, isSelected && styles.chipNameSelected], children: loc.name }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: [styles.chipMult, isSelected && styles.chipMultSelected], children: [MULTIPLY_SYMBOL, (0, format_1.formatDecimal)(loc.multiplier, 2)] })] }, loc.id));
                        }) })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSection, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSectionHeader, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionHeaderTitle, children: "Quality Benchmark Selection" }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: () => setShowCostBasisInfo(!showCostBasisInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "cost-basis-info-btn", children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Info, { size: 15, color: colors_1.default.textTertiary }) })] }), showCostBasisInfo && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.costBasisCard, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.costBasisTitle, children: construction_1.COST_BASIS_TITLE }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.costBasisText, children: sanitizeEstimateText(construction_1.COST_BASIS_TEXT) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.costBasisDivider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.costBasisTitle, children: construction_1.COST_BASIS_SCOPE_TITLE }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.costBasisText, children: sanitizeEstimateText(construction_1.COST_BASIS_SCOPE_TEXT) })] })), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.card, styles.cardCompactTop], children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.qualityRow, children: qualityBenchmarkOptions.map((option, index) => {
                                const isSelected = qualityId === option.id;
                                return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [index > 0 && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), isSelected ? ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [
                                                styles.qualityCard,
                                                styles.qualityCardSelected,
                                                useStackedBenchmarkCardLayout && styles.qualityCardStacked,
                                            ], testID: `quality-${option.id}`, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.qualityCardText, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.qualityName, styles.qualityNameSelected], children: option.title }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.qualityDescriptor, children: option.descriptor })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [
                                                        styles.qualityCardValue,
                                                        styles.qualityCardValueSelected,
                                                        useStackedBenchmarkCardLayout && styles.qualityCardValueStacked,
                                                    ], children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [
                                                            styles.qualityInlineValueRow,
                                                            useStackedBenchmarkCardLayout && styles.qualityInlineValueRowStacked,
                                                        ], children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [
                                                                    styles.qualityModeInline,
                                                                    useStackedBenchmarkCardLayout && styles.qualityModeInlineStacked,
                                                                ], testID: "benchmark-reference-toggle", children: [(0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, onPress: () => {
                                                                            if (react_native_1.Platform.OS !== 'web') {
                                                                                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                                            }
                                                                            setBenchmarkOverridePerSqm(null);
                                                                        }, style: [
                                                                            styles.qualityModeInlineOption,
                                                                            benchmarkMode === 'default'
                                                                                ? styles.qualityModeInlineOptionActive
                                                                                : styles.qualityModeInlineOptionInactive,
                                                                        ], testID: "benchmark-reference-default", children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                                                                styles.qualityModeInlineText,
                                                                                benchmarkMode === 'default'
                                                                                    ? styles.qualityModeInlineTextActive
                                                                                    : styles.qualityModeInlineTextInactive,
                                                                            ], children: "Default" }) }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, onPress: () => activateManualBenchmarkOverride(option.benchmarkValue), style: [
                                                                            styles.qualityModeInlineOption,
                                                                            benchmarkMode === 'manual'
                                                                                ? styles.qualityModeInlineOptionActive
                                                                                : styles.qualityModeInlineOptionInactive,
                                                                        ], testID: "benchmark-reference-manual", children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                                                                styles.qualityModeInlineText,
                                                                                benchmarkMode === 'manual'
                                                                                    ? styles.qualityModeInlineTextActive
                                                                                    : styles.qualityModeInlineTextInactive,
                                                                            ], children: "Manual" }) })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [
                                                                    styles.qualityInlineInputWrap,
                                                                    benchmarkMode === 'default' && styles.qualityInlineInputWrapReadonly,
                                                                    useStackedBenchmarkCardLayout && styles.qualityInlineInputWrapStacked,
                                                                ], children: [(0, jsx_runtime_1.jsx)(react_native_1.TextInput, { ref: benchmarkInputRef, style: [
                                                                            styles.qualityInlineInput,
                                                                            benchmarkMode === 'default' && styles.qualityInlineInputReadonly,
                                                                        ], value: (0, format_1.formatNumber)(referenceBenchmarkPerSqm), onChangeText: (text) => {
                                                                            const cleaned = text.replace(/[^0-9]/g, '');
                                                                            if (!cleaned)
                                                                                return;
                                                                            setBenchmarkOverridePerSqm(parseInt(cleaned, 10) || option.benchmarkValue);
                                                                        }, keyboardType: "numeric", editable: benchmarkMode === 'manual', selectTextOnFocus: benchmarkMode === 'manual', placeholder: "0", placeholderTextColor: colors_1.default.textTertiary, testID: "benchmark-reference-input" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                                                            styles.qualityInlineInputUnit,
                                                                            benchmarkMode === 'default' && styles.qualityInlineInputUnitReadonly,
                                                                        ], children: `${EURO_SYMBOL}/${SQUARE_METER_UNIT}` })] })] }) })] })) : ((0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, style: styles.qualityCard, onPress: () => {
                                                handleQualitySelect(option.id, option.benchmarkValue);
                                            }, testID: `quality-${option.id}`, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.qualityCardText, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.qualityName, children: option.title }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.qualityDescriptor, children: option.descriptor })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.qualityCardValue, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.qualityPrice, children: option.benchmarkLabel }) })] }))] }, option.id));
                            }) }) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.card, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.cardTitle, children: "Correction based on Building Size" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.sizeCorrectionRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.adjustmentText, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: `Smaller projects usually cost more per ${SQUARE_METER_UNIT}, while larger projects benefit from scale.` }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                            styles.sizeCorrectionValue,
                                            sizeCorrectionFactor > 1 ? styles.sizeCorrectionUp : styles.sizeCorrectionDown,
                                        ], children: `${displaySizeCorrectionLabel} ${ARROW_SYMBOL} ${(0, format_1.formatCurrency)(correctedCostPerSqm)} /${SQUARE_METER_UNIT}` })] })] })] })] }));
    const renderFeesMarginsGroup = () => ((0, jsx_runtime_1.jsxs)(CollapsibleGroup, { title: "Fees & Margins", icon: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Shield, { size: 16, color: colors_1.default.accent }), expanded: showFeesMarginsGroup, onToggle: () => setShowFeesMarginsGroup((prev) => !prev), children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSection, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSectionHeader, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionHeaderTitle, children: "Permits & Professional Fees" }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: () => setShowPermitDesignInfo(!showPermitDesignInfo), hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, testID: "permit-design-info-btn", children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Info, { size: 15, color: colors_1.default.textTertiary }) })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionSubtitle, children: `Based on ${feesQualityLabel} quality ${MIDDLE_DOT} ${(0, format_1.formatNumber)(permitDesignBuildingArea)} ${SQUARE_METER_UNIT} building area` }), showPermitDesignInfo && ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tooltipCard, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tooltipText, children: sanitizeEstimateText(construction_1.PERMIT_DESIGN_TOOLTIP) }) })), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.card, styles.cardCompactTop], children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.valueOnlyRow, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveValue, children: (0, format_1.formatCurrency)(permitDesignFee) }) }), isLargeProject && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.permitDesignAdvisory, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.Info, { size: 13, color: colors_1.default.accent }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.permitDesignAdvisoryText, children: sanitizeEstimateText(construction_1.PERMIT_DESIGN_LARGE_PROJECT_MESSAGE) })] })), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { style: styles.permitDesignLink, onPress: () => react_native_1.Linking.openURL(construction_1.PERMIT_DESIGN_CONTACT_URL), activeOpacity: 0.7, testID: "permit-design-contact-link", children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.permitDesignLinkText, children: construction_1.PERMIT_DESIGN_CONTACT_LABEL }), (0, jsx_runtime_1.jsx)(lucide_react_native_1.ExternalLink, { size: 14, color: colors_1.default.accent })] })] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSection, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionTitle, children: "Contractor Margin" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.card, children: (0, jsx_runtime_1.jsx)(SliderInput_1.default, { label: "Margin rate", subtitle: `${(0, format_1.formatDecimal)(contractorPercent, 1)}% of construction = ${(0, format_1.formatCurrency)(contractorCost)}`, value: contractorPercent, onChangeValue: setContractorPercent, min: construction_1.CONTRACTOR_MIN_PERCENTAGE, max: construction_1.CONTRACTOR_MAX_PERCENTAGE, step: construction_1.CONTRACTOR_STEP, suffix: "%", testID: "slider-contractor-percent" }) })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSection, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionTitle, children: "Insurance & Taxes" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.card, children: [(0, jsx_runtime_1.jsx)(SliderInput_1.default, { label: "VAT rate", subtitle: `Reference only: ${formatEditableDecimal(vatPercent, 1)}% of subtotal before VAT = ${(0, format_1.formatCurrency)(vatAmount)}`, value: vatPercent, onChangeValue: (value) => setVatPercent(Math.max(0, value)), min: 0, max: 40, step: 0.5, suffix: "%", testID: "slider-vat-percent" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.moduleSupportText, children: "VAT is tracked here as an editable planning reference and is not added to the current estimator total." }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.divider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.cardTitle, children: "e-EFKA worker insurance" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.optionSubtext, children: "Automatic estimate for mandatory owner-paid worker insurance based on building area." }), (0, jsx_runtime_1.jsx)(OverrideValueField, { value: (0, format_1.formatNumber)(efkaInsuranceAmount), onChangeText: (text) => setEfkaInsuranceManualCost(parseInt(text.replace(/[^0-9]/g, ''), 10) || 0), editable: efkaInsuranceManualOverrideActive, unit: ` ${EURO_SYMBOL}`, helperText: efkaInsuranceManualOverrideActive
                                    ? `Automatic reference: ${(0, format_1.formatCurrency)(efkaInsuranceAutoCost)}.`
                                    : '', onSetEditable: (nextEditable) => {
                                    if (react_native_1.Platform.OS !== 'web') {
                                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }
                                    setEfkaInsuranceManualCost(nextEditable ? efkaInsuranceAutoCost : null);
                                }, inputTestID: "efka-insurance-cost-input", actionTestID: "efka-insurance-manual-toggle" })] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupSection, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSectionTitle, children: "Construction Contingency" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.card, children: [(0, jsx_runtime_1.jsx)(SliderInput_1.default, { label: "Applied rate", subtitle: `Recommended rate for ${feesQualityLabel} quality: ${formatEditableDecimal(contingencyPercent * 100, 1)}%`, value: Math.round(appliedContingencyPercent * 10) / 10, onChangeValue: (value) => {
                                    setManualContingencyPercent(Math.max(0, value));
                                }, min: 0, max: 20, step: 0.5, suffix: "%", testID: "slider-contingency-rate" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.effectiveFormula, children: `Contingency cost: ${(0, format_1.formatCurrency)(contingencyCost)}` })] })] })] }));
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.outerContainer, children: [(0, jsx_runtime_1.jsx)(ScenarioBar_1.default, {}), (0, jsx_runtime_1.jsxs)(react_native_1.ScrollView, { style: styles.container, contentContainerStyle: styles.content, showsVerticalScrollIndicator: false, keyboardShouldPersistTaps: "handled", children: [renderLandPlotGroup(), renderConstructionBenchmarkGroup(), renderBuildingDefinitionGroup(), renderOutdoorAdditionsGroup(), renderSystemsUpgradesGroup(), renderSiteParametersGroup(), renderFeesMarginsGroup(), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { style: styles.transparencyLink, onPress: () => router.push('/how-it-works'), activeOpacity: 0.7, testID: "how-it-works-btn", children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.BookOpen, { size: 16, color: colors_1.default.accent }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.transparencyLinkText, children: "How the Estimate Works" })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.disclaimer, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.Info, { size: 14, color: colors_1.default.textTertiary, style: styles.disclaimerIcon }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.disclaimerText, children: sanitizeEstimateText(construction_1.DISCLAIMER_TEXT) })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.bottomSpacer })] })] }));
}
const styles = react_native_1.StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: colors_1.default.background,
    },
    container: {
        flex: 1,
        backgroundColor: colors_1.default.background,
    },
    content: {
        paddingBottom: 40,
        paddingHorizontal: 16,
        alignItems: 'center',
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
        color: colors_1.default.text,
        letterSpacing: 0.3,
    },
    groupWrap: {
        marginTop: 20,
        width: '100%',
        maxWidth: 1040,
        alignSelf: 'center',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors_1.default.border,
        backgroundColor: colors_1.default.card,
        overflow: 'hidden',
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    groupHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        paddingRight: 12,
        minWidth: 0,
    },
    groupIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors_1.default.accentBg,
    },
    groupTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: colors_1.default.text,
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
        fontWeight: '700',
        color: colors_1.default.text,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        lineHeight: 20,
    },
    groupSectionSubtitle: {
        fontSize: 12,
        color: colors_1.default.textTertiary,
        marginHorizontal: 16,
        marginBottom: 8,
        lineHeight: 18,
    },
    groupSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        gap: 8,
    },
    groupSectionHeaderTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        color: colors_1.default.text,
        lineHeight: 20,
    },
    groupNestedBlock: {
        marginTop: 8,
    },
    groupInlineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        gap: 8,
    },
    groupInlineTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: colors_1.default.textSecondary,
        lineHeight: 18,
        flex: 1,
    },
    inlineSubsectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: colors_1.default.textSecondary,
        marginBottom: 4,
    },
    summaryHighlightCard: {
        backgroundColor: colors_1.default.accentBg,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: colors_1.default.accent,
    },
    summaryHighlightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    summaryHighlightLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        color: colors_1.default.accent,
    },
    summaryHighlightValue: {
        fontSize: 18,
        fontWeight: '800',
        color: colors_1.default.accent,
        flexShrink: 1,
        textAlign: 'right',
    },
    summaryHighlightSubtext: {
        fontSize: 11,
        color: colors_1.default.textSecondary,
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
        backgroundColor: colors_1.default.card,
        borderWidth: 1.5,
        borderColor: colors_1.default.border,
        alignItems: 'center',
        minWidth: 80,
    },
    chipSelected: {
        backgroundColor: colors_1.default.accentBg,
        borderColor: colors_1.default.accent,
    },
    chipName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors_1.default.text,
    },
    chipNameSelected: {
        color: colors_1.default.accent,
    },
    chipMult: {
        fontSize: 11,
        color: colors_1.default.textTertiary,
        marginTop: 2,
    },
    chipMultSelected: {
        color: colors_1.default.accent,
    },
    qualityRow: {
        flexDirection: 'column',
        gap: 10,
    },
    qualityCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 6,
        gap: 10,
    },
    qualityCardSelected: {
        backgroundColor: colors_1.default.accentBg,
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    qualityCardStacked: {
        alignItems: 'stretch',
    },
    qualityCardText: {
        flex: 1,
        paddingRight: 12,
    },
    qualityCardValue: {
        alignItems: 'flex-end',
        flexShrink: 1,
        minWidth: 120,
    },
    qualityCardValueSelected: {
        minWidth: 0,
        flexShrink: 0,
        alignItems: 'flex-end',
    },
    qualityCardValueStacked: {
        width: '100%',
        marginTop: 10,
        alignItems: 'flex-start',
    },
    qualityInlineValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        flexWrap: 'nowrap',
        minHeight: 40,
    },
    qualityInlineValueRowStacked: {
        width: '100%',
        justifyContent: 'space-between',
    },
    qualityModeInline: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors_1.default.card,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors_1.default.border,
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
        borderColor: colors_1.default.textTertiary,
    },
    qualityModeInlineOptionInactive: {
        backgroundColor: 'transparent',
    },
    qualityModeInlineText: {
        fontSize: 11,
        color: colors_1.default.textSecondary,
    },
    qualityModeInlineTextActive: {
        color: colors_1.default.text,
        fontWeight: '700',
    },
    qualityModeInlineTextInactive: {
        color: colors_1.default.textSecondary,
        fontWeight: '500',
    },
    qualityInlineInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors_1.default.card,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors_1.default.accent,
        paddingHorizontal: 10,
        paddingVertical: 6,
        width: 140,
        justifyContent: 'flex-end',
        flexShrink: 0,
        overflow: 'hidden',
    },
    qualityInlineInputWrapStacked: {
        width: 140,
    },
    qualityInlineInputWrapReadonly: {
        borderColor: colors_1.default.border,
    },
    qualityInlineInput: {
        flex: 1,
        minWidth: 0,
        paddingVertical: 0,
        paddingHorizontal: 0,
        margin: 0,
        borderWidth: 0,
        backgroundColor: 'transparent',
        textAlign: 'right',
        fontSize: 14,
        fontWeight: '700',
        color: colors_1.default.accent,
    },
    qualityInlineInputReadonly: {
        color: colors_1.default.accent,
    },
    qualityInlineInputUnit: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '600',
        color: colors_1.default.accent,
    },
    qualityInlineInputUnitReadonly: {
        color: colors_1.default.accent,
    },
    qualityName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors_1.default.text,
        marginBottom: 4,
    },
    qualityNameSelected: {
        color: colors_1.default.accent,
    },
    qualityDescriptor: {
        fontSize: 12,
        color: colors_1.default.textSecondary,
    },
    qualityPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: colors_1.default.text,
    },
    qualityPriceSelected: {
        color: colors_1.default.accent,
    },
    qualityUnit: {
        fontSize: 12,
        color: colors_1.default.textTertiary,
        marginTop: 1,
    },
    qualityUnitSelected: {
        color: colors_1.default.accent,
    },
    card: {
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: colors_1.default.card,
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors_1.default.text,
        lineHeight: 20,
        flexShrink: 1,
    },
    resetLink: {
        fontSize: 13,
        fontWeight: '600',
        color: colors_1.default.accent,
    },
    costInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        minHeight: 48,
    },
    costInputRowDisabled: {
        opacity: 0.7,
    },
    overrideInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        minHeight: 48,
        gap: 10,
    },
    overrideInputValueWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 120,
    },
    overrideModeSegment: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        backgroundColor: colors_1.default.card,
        borderWidth: 1,
        borderColor: colors_1.default.border,
        overflow: 'hidden',
    },
    overrideModeOption: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        minHeight: 32,
        justifyContent: 'center',
    },
    overrideModeOptionActive: {
        backgroundColor: colors_1.default.accent,
    },
    overrideModeOptionInactive: {
        backgroundColor: colors_1.default.card,
    },
    overrideModeOptionText: {
        fontSize: 12,
        fontWeight: '600',
    },
    overrideModeOptionTextActive: {
        color: colors_1.default.white,
    },
    overrideModeOptionTextInactive: {
        color: colors_1.default.textSecondary,
    },
    euroSign: {
        fontSize: 18,
        fontWeight: '700',
        color: colors_1.default.primary,
        marginRight: 4,
    },
    costInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: colors_1.default.primary,
        padding: 0,
    },
    costInputDisabled: {
        color: colors_1.default.textSecondary,
    },
    costInputUnit: {
        fontSize: 14,
        color: colors_1.default.textSecondary,
        marginLeft: 4,
    },
    costInputUnitDisabled: {
        color: colors_1.default.textTertiary,
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
        color: colors_1.default.textTertiary,
        lineHeight: 16,
    },
    moduleSupportText: {
        marginTop: 10,
        fontSize: 12,
        color: colors_1.default.textTertiary,
        lineHeight: 16,
    },
    sizeCorrectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        marginTop: 10,
        paddingHorizontal: 0,
        gap: 12,
    },
    adjustmentText: {
        flex: 1,
    },
    sizeCorrectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors_1.default.textSecondary,
    },
    sizeCorrectionValue: {
        fontSize: 12,
        fontWeight: '700',
        flexShrink: 1,
        textAlign: 'right',
    },
    sizeCorrectionUp: {
        color: colors_1.default.warning,
    },
    sizeCorrectionDown: {
        color: colors_1.default.success,
    },
    finalBenchmarkRow: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
    },
    finalBenchmarkValue: {
        fontSize: 28,
        fontWeight: '800',
        color: colors_1.default.accent,
    },
    finalBenchmarkUnit: {
        fontSize: 14,
        color: colors_1.default.textSecondary,
        marginLeft: 6,
        marginBottom: 3,
    },
    divider: {
        height: 1,
        backgroundColor: colors_1.default.borderLight,
        marginVertical: 12,
    },
    effectiveRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 4,
        flexWrap: 'wrap',
        gap: 8,
    },
    valueOnlyRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingVertical: 4,
    },
    effectiveLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: colors_1.default.primary,
        flexShrink: 1,
    },
    effectiveValue: {
        fontSize: 18,
        fontWeight: '800',
        color: colors_1.default.primary,
        flexShrink: 1,
        textAlign: 'right',
    },
    effectiveFormula: {
        fontSize: 11,
        color: colors_1.default.textTertiary,
        marginTop: 4,
        lineHeight: 16,
        textAlign: 'left',
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionInfo: {
        flex: 1,
        minWidth: 0,
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors_1.default.text,
    },
    optionSubtext: {
        fontSize: 12,
        color: colors_1.default.textTertiary,
        marginTop: 3,
        lineHeight: 17,
    },
    disclaimer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%',
        maxWidth: 1040,
        alignSelf: 'center',
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
        color: colors_1.default.textTertiary,
        lineHeight: 16,
    },
    tooltipCard: {
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 10,
        padding: 12,
    },
    tooltipText: {
        fontSize: 12,
        color: colors_1.default.textSecondary,
        lineHeight: 17,
    },
    siteConditionsGrid: {
        paddingHorizontal: 16,
        gap: 8,
    },
    siteCondCard: {
        backgroundColor: colors_1.default.card,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors_1.default.border,
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    siteCondCardSelected: {
        borderColor: colors_1.default.accent,
        backgroundColor: colors_1.default.accentBg,
    },
    siteCondIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: colors_1.default.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
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
        fontWeight: '700',
        color: colors_1.default.text,
        lineHeight: 18,
    },
    siteCondNameSelected: {
        color: colors_1.default.accent,
    },
    siteCondDesc: {
        fontSize: 11,
        color: colors_1.default.textTertiary,
        marginTop: 2,
        lineHeight: 16,
    },
    siteCondDescSelected: {
        color: colors_1.default.accent,
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
        color: colors_1.default.text,
    },
    basementTooltip: {
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
    },
    basementTooltipText: {
        fontSize: 11,
        color: colors_1.default.textSecondary,
        lineHeight: 16,
    },
    basementTypeOptions: {
        gap: 6,
    },
    basementTypeBtn: {
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    basementTypeBtnSelected: {
        backgroundColor: colors_1.default.accentBg,
        borderColor: colors_1.default.accent,
    },
    basementTypeName: {
        fontSize: 13,
        fontWeight: '700',
        color: colors_1.default.text,
    },
    basementTypeNameSelected: {
        color: colors_1.default.accent,
    },
    basementTypeDesc: {
        fontSize: 11,
        color: colors_1.default.textTertiary,
        marginTop: 1,
    },
    basementTypeDescSelected: {
        color: colors_1.default.accent,
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
        color: colors_1.default.textSecondary,
    },
    basementCostValue: {
        fontSize: 12,
        fontWeight: '600',
        color: colors_1.default.textSecondary,
    },
    basementCostTotal: {
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: colors_1.default.borderLight,
    },
    basementCostTotalLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: colors_1.default.primary,
    },
    basementCostTotalValue: {
        fontSize: 14,
        fontWeight: '700',
        color: colors_1.default.primary,
    },
    hvacBaseNote: {
        fontSize: 12,
        color: colors_1.default.textTertiary,
        marginBottom: 12,
        fontStyle: 'italic',
    },
    permitDesignAdvisory: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors_1.default.accentBg,
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
        gap: 8,
    },
    permitDesignAdvisoryText: {
        flex: 1,
        fontSize: 12,
        color: colors_1.default.accent,
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
        backgroundColor: colors_1.default.accentBg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors_1.default.accent,
    },
    permitDesignLinkText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors_1.default.accent,
    },
    transparencyLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 1040,
        alignSelf: 'center',
        marginTop: 20,
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: colors_1.default.card,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors_1.default.border,
    },
    transparencyLinkText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors_1.default.accent,
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
        borderColor: colors_1.default.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: colors_1.default.accent,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors_1.default.accent,
    },
    costBasisCard: {
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 10,
        padding: 14,
    },
    costBasisTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: colors_1.default.text,
        marginBottom: 6,
    },
    costBasisText: {
        fontSize: 12,
        color: colors_1.default.textSecondary,
        lineHeight: 18,
    },
    costBasisDivider: {
        height: 1,
        backgroundColor: colors_1.default.borderLight,
        marginVertical: 10,
    },
    warningCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginHorizontal: 16,
        marginTop: 10,
        backgroundColor: colors_1.default.warningBg,
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
        color: colors_1.default.warning,
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
        alignItems: 'flex-start',
        flexWrap: 'wrap',
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
        color: colors_1.default.text,
    },
    integerStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 4,
    },
    integerStatus: {
        fontSize: 11,
        fontWeight: '600',
        color: colors_1.default.textTertiary,
    },
    integerStatusManual: {
        color: colors_1.default.accent,
    },
    integerReset: {
        fontSize: 11,
        fontWeight: '600',
        color: colors_1.default.accent,
    },
    integerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        alignSelf: 'flex-start',
    },
    integerBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors_1.default.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors_1.default.border,
    },
    integerBtnDisabled: {
        opacity: 0.35,
    },
    integerBtnText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors_1.default.primary,
    },
    integerBtnTextDisabled: {
        color: colors_1.default.textTertiary,
    },
    integerValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors_1.default.primary,
        minWidth: 28,
        textAlign: 'center',
    },
    poolSubsectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: colors_1.default.text,
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
        minWidth: 140,
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1.5,
        borderColor: 'transparent',
        alignItems: 'center',
    },
    poolSizeBtnSelected: {
        backgroundColor: colors_1.default.accentBg,
        borderColor: colors_1.default.accent,
    },
    poolSizeName: {
        fontSize: 13,
        fontWeight: '700',
        color: colors_1.default.text,
    },
    poolSizeNameSelected: {
        color: colors_1.default.accent,
    },
    poolSizeArea: {
        fontSize: 11,
        color: colors_1.default.textTertiary,
        marginTop: 2,
    },
    poolSizeAreaSelected: {
        color: colors_1.default.accent,
    },
    poolCustomRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 10,
    },
    poolCustomField: {
        flex: 1,
        minWidth: 150,
    },
    poolCustomLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors_1.default.textSecondary,
        marginBottom: 6,
    },
    poolCustomInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    poolCustomInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: colors_1.default.primary,
        padding: 0,
        textAlign: 'right',
    },
    poolCustomUnit: {
        fontSize: 13,
        color: colors_1.default.textSecondary,
        marginLeft: 4,
    },
    poolOptionGrid: {
        gap: 6,
    },
    poolOptionBtn: {
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    poolOptionBtnSelected: {
        backgroundColor: colors_1.default.accentBg,
        borderColor: colors_1.default.accent,
    },
    poolOptionName: {
        fontSize: 13,
        fontWeight: '700',
        color: colors_1.default.text,
    },
    poolOptionNameSelected: {
        color: colors_1.default.accent,
    },
    poolOptionDesc: {
        fontSize: 11,
        color: colors_1.default.textTertiary,
        marginTop: 1,
    },
    poolOptionDescSelected: {
        color: colors_1.default.accent,
    },
});
