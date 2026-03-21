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
exports.default = CompareScreen;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const expo_router_1 = require("expo-router");
const lucide_react_native_1 = require("lucide-react-native");
const colors_1 = __importDefault(require("@/constants/colors"));
const EstimateContext_1 = require("@/contexts/EstimateContext");
const computeScenarioCosts_1 = require("@/utils/computeScenarioCosts");
const construction_1 = require("@/constants/construction");
const format_1 = require("@/utils/format");
const SQUARE_METER_UNIT = 'm\u00B2';
const COMPARE_COLORS = [
    '#2C5F6E',
    '#D4782F',
    '#2D8B55',
    '#8A5CF6',
    '#E5533D',
    '#3BA7B8'
];
const MUTED_ICON = '#9CA3AF';
function getParameterRows(scenarios) {
    const params = [
        { label: 'Location', getter: (s) => s.locationName },
        { label: 'Quality level', getter: (s) => s.qualityName },
        { label: 'Interior area', getter: (s) => `${(0, format_1.formatNumber)(s.mainArea)} ${SQUARE_METER_UNIT}` },
        { label: 'Covered terrace', getter: (s) => `${(0, format_1.formatNumber)(s.terraceArea)} ${SQUARE_METER_UNIT}` },
        { label: 'Balcony', getter: (s) => `${(0, format_1.formatNumber)(s.balconyArea)} ${SQUARE_METER_UNIT}` },
        {
            label: 'Basement',
            getter: (s) => s.basementArea > 0
                ? `${(0, format_1.formatNumber)(s.basementArea)} ${SQUARE_METER_UNIT} · ${(0, computeScenarioCosts_1.formatBasementSummary)(s.storageBasementArea, s.parkingBasementArea, s.habitableBasementArea)}`
                : 'None',
        },
        {
            label: 'Building area',
            getter: (s) => `${(0, format_1.formatNumber)(s.buildingArea)} ${SQUARE_METER_UNIT}`,
        },
        {
            label: 'Pool',
            getter: (s) => s.includePool
                ? `${s.poolSizeName} (${(0, format_1.formatNumber)(s.poolArea)} ${SQUARE_METER_UNIT})`
                : 'None',
        },
        { label: 'Site conditions', getter: (s) => s.siteConditionName },
        { label: 'Groundwater', getter: (s) => s.groundwaterConditionName },
        { label: 'Site access', getter: (s) => s.siteAccessibilityName },
        {
            label: 'Landscaping',
            getter: (s) => s.landscapingArea > 0
                ? `${(0, format_1.formatNumber)(s.landscapingArea)} ${SQUARE_METER_UNIT}`
                : 'None',
        },
        {
            label: 'HVAC add-ons',
            getter: (s) => s.hvacNames.length > 0
                ? s.hvacNames.join(', ')
                : 'Base only',
        },
        {
            label: 'Contractor overhead',
            getter: (s) => (0, format_1.formatPercent)(s.contractorPercent, 1),
        },
    ];
    return params.map((p) => {
        const values = scenarios.map(p.getter);
        const isDifferent = new Set(values).size > 1;
        return { label: p.label, values, isDifferent };
    });
}
function getGroupedCostRows(scenarios) {
    const rows = [];
    const makeRow = (label, getter, opts) => {
        const values = scenarios.map((s) => getter(s));
        const isDifferent = new Set(values).size > 1;
        return Object.assign({ label, values, isDifferent }, opts);
    };
    rows.push(makeRow('Land & acquisition', (s) => s.group100Total, { isGroupHeader: true }));
    rows.push(makeRow('Land + acquisition', (s) => s.group100Total));
    rows.push(makeRow('Construction', (s) => s.constructionSubtotal, { isGroupHeader: true }));
    rows.push(makeRow('Building construction', (s) => s.kg300Cost));
    rows.push(makeRow('Technical systems', (s) => s.kg400Total));
    rows.push(makeRow('Built-in equipment', (s) => s.kg600Cost));
    rows.push(makeRow('Basement traceability', (s) => s.basementBaseCost, { isGroupHeader: true }));
    rows.push(makeRow('Basement contribution (included in DIN)', (s) => s.basementBaseCost));
    rows.push(makeRow('Basement -> KG 300', (s) => s.basementKg300Total));
    rows.push(makeRow('Basement -> KG 400', (s) => s.basementKg400Total));
    rows.push(makeRow('Site & External', (s) => s.kg200Total + s.kg500Total, { isGroupHeader: true }));
    rows.push(makeRow('Site preparation', (s) => s.kg200Total));
    rows.push(makeRow('External works', (s) => s.kg500Total));
    rows.push(makeRow('Project costs', (s) => s.permitDesignFee + s.contractorCost + s.contingencyCost + s.efkaInsuranceAmount, { isGroupHeader: true }));
    rows.push(makeRow('Planning & fees', (s) => s.permitDesignFee));
    rows.push(makeRow('Contractor overhead', (s) => s.contractorCost));
    rows.push(makeRow('Construction contingency', (s) => s.contingencyCost));
    rows.push(makeRow('e-EFKA worker insurance', (s) => s.efkaInsuranceAmount));
    return rows;
}
function getLargestCostDriver(scenarios) {
    if (scenarios.length < 2)
        return null;
    const categories = [
        { label: 'Land & acquisition', getter: (s) => s.group100Total },
        { label: 'Building construction', getter: (s) => s.kg300Cost },
        { label: 'Technical systems', getter: (s) => s.kg400Total },
        { label: 'Built-in equipment', getter: (s) => s.kg600Cost },
        { label: 'Basement contribution', getter: (s) => s.basementBaseCost },
        { label: 'Site preparation', getter: (s) => s.kg200Total },
        { label: 'External works', getter: (s) => s.kg500Total },
        { label: 'Planning & fees', getter: (s) => s.permitDesignFee },
        { label: 'Contractor overhead', getter: (s) => s.contractorCost },
        { label: 'Construction contingency', getter: (s) => s.contingencyCost },
        { label: 'e-EFKA worker insurance', getter: (s) => s.efkaInsuranceAmount },
    ];
    let maxDiff = 0;
    let maxLabel = '';
    for (const cat of categories) {
        const vals = scenarios.map((s) => cat.getter(s));
        const diff = Math.max(...vals) - Math.min(...vals);
        if (diff > maxDiff) {
            maxDiff = diff;
            maxLabel = cat.label;
        }
    }
    return maxDiff > 0 ? { label: maxLabel, diff: maxDiff } : null;
}
function ScenarioSummaryCard({ scenario, index, rank, cheapestTotal, onEdit, onUseScenario }) {
    const color = COMPARE_COLORS[index];
    const totalWithVat = scenario.finalTotal;
    const cheapestWithVat = cheapestTotal;
    const diffFromCheapest = totalWithVat - cheapestWithVat;
    const diffPercent = cheapestWithVat > 0 ? Math.round((diffFromCheapest / cheapestWithVat) * 100) : 0;
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: summaryStyles.card, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [summaryStyles.accentBar, { backgroundColor: color }] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: summaryStyles.cardInner, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: summaryStyles.headerRow, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: summaryStyles.nameRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: summaryStyles.name, numberOfLines: 1, children: scenario.name }), rank === 'highest' && ((0, jsx_runtime_1.jsx)(react_native_1.View, { accessible: true, accessibilityLabel: "Highest cost scenario", children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Crown, { size: 14, color: MUTED_ICON }) })), rank === 'cheapest' && ((0, jsx_runtime_1.jsx)(react_native_1.View, { accessible: true, accessibilityLabel: "Lowest cost scenario", children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.CircleDollarSign, { size: 14, color: MUTED_ICON }) }))] }) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: summaryStyles.priceBlock, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: summaryStyles.totalCost, children: (0, construction_1.formatEuro)(totalWithVat) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: summaryStyles.vatLabel, children: " incl. VAT" })] }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: summaryStyles.subtotalLabel, children: [(0, construction_1.formatEuro)(scenario.preVatTotal), " excl. VAT"] }), rank === 'cheapest' && ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: summaryStyles.diffText, children: "baseline" })), rank !== 'cheapest' && diffFromCheapest > 0 && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: summaryStyles.diffBlock, children: [(0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: summaryStyles.diffText, children: ["+", (0, construction_1.formatEuro)(diffFromCheapest), " vs cheapest"] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: summaryStyles.diffPercent, children: `(+${(0, format_1.formatPercent)(diffPercent)})` })] })), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: summaryStyles.divider }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: summaryStyles.actions, children: [(0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { style: summaryStyles.actionBtn, onPress: onEdit, testID: `edit-scenario-${index}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.Pencil, { size: 13, color: colors_1.default.textSecondary }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: summaryStyles.actionText, children: "Edit" })] }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { style: summaryStyles.actionBtn, onPress: onUseScenario, testID: `use-scenario-${index}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.ArrowRight, { size: 13, color: colors_1.default.textSecondary }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: summaryStyles.actionText, children: "Use" })] })] })] })] }));
}
function CostBarChart({ scenarios }) {
    const maxCost = Math.max(...scenarios.map(s => s.finalTotal));
    const scaleSteps = (0, react_1.useMemo)(() => {
        const step = Math.ceil(maxCost / 4 / 50000) * 50000;
        const steps = [];
        for (let i = step; i <= maxCost + step; i += step) {
            steps.push(i);
        }
        return steps.slice(0, 4);
    }, [maxCost]);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: chartStyles.container, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: chartStyles.title, children: "Total Project Cost Comparison" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: chartStyles.scaleRow, children: scaleSteps.map((v) => ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: chartStyles.scaleLabel, children: (0, construction_1.formatEuro)(v) }, v))) }), scenarios.map((s, i) => {
                const totalWithVat = s.finalTotal;
                const pct = (totalWithVat / maxCost) * 100;
                return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: chartStyles.barRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: chartStyles.barLabelWrap, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [chartStyles.barDot, { backgroundColor: COMPARE_COLORS[i] }] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: chartStyles.barLabel, numberOfLines: 1, children: s.name })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: chartStyles.barTrack, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [chartStyles.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: COMPARE_COLORS[i] }] }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: chartStyles.barValue, children: (0, construction_1.formatEuro)(totalWithVat) })] }, i));
            }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: chartStyles.vatNote, children: "Amounts include scenario VAT" })] }));
}
function CompareScreen() {
    const { scenarios, getAllScenarioConfigs, switchScenario } = (0, EstimateContext_1.useEstimate)();
    const router = (0, expo_router_1.useRouter)();
    const [showAllParams, setShowAllParams] = (0, react_1.useState)(false);
    const allConfigs = (0, react_1.useMemo)(() => getAllScenarioConfigs(), [getAllScenarioConfigs]);
    const computed = (0, react_1.useMemo)(() => allConfigs.map(computeScenarioCosts_1.computeScenarioCosts), [allConfigs]);
    const handleEditScenario = (0, react_1.useCallback)((index) => {
        switchScenario(index);
        router.navigate('/(tabs)/(estimate)');
    }, [switchScenario, router]);
    const handleUseScenario = (0, react_1.useCallback)((index) => {
        switchScenario(index);
        router.navigate('/(tabs)/(estimate)');
    }, [switchScenario, router]);
    const paramRows = (0, react_1.useMemo)(() => computed.length >= 2 ? getParameterRows(computed) : [], [computed]);
    const groupedCostRows = (0, react_1.useMemo)(() => computed.length >= 2 ? getGroupedCostRows(computed) : [], [computed]);
    const totalValues = (0, react_1.useMemo)(() => computed.map((s) => s.finalTotal), [computed]);
    const minTotal = (0, react_1.useMemo)(() => totalValues.length > 0 ? Math.min(...totalValues) : 0, [totalValues]);
    const maxTotal = (0, react_1.useMemo)(() => totalValues.length > 0 ? Math.max(...totalValues) : 0, [totalValues]);
    const totalDiff = maxTotal - minTotal;
    const totalDiffWithVat = totalDiff;
    const sortedByTotal = (0, react_1.useMemo)(() => [...computed].sort((a, b) => a.finalTotal - b.finalTotal), [computed]);
    const cheapestName = sortedByTotal.length > 0 ? sortedByTotal[0].name : '';
    const highestName = sortedByTotal.length > 0 ? sortedByTotal[sortedByTotal.length - 1].name : '';
    const changedParams = (0, react_1.useMemo)(() => paramRows.filter((r) => r.isDifferent), [paramRows]);
    const displayedParams = showAllParams ? paramRows : changedParams;
    const costDriver = (0, react_1.useMemo)(() => getLargestCostDriver(computed), [computed]);
    const incrementalDiffs = (0, react_1.useMemo)(() => {
        if (sortedByTotal.length < 2)
            return [];
        const diffs = [];
        for (let i = 0; i < sortedByTotal.length - 1; i++) {
            const diff = sortedByTotal[i + 1].finalTotal - sortedByTotal[i].finalTotal;
            diffs.push({
                from: sortedByTotal[i].name,
                to: sortedByTotal[i + 1].name,
                diff,
            });
        }
        return diffs;
    }, [sortedByTotal]);
    if (scenarios.length < 2) {
        return ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.emptyContainer, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.emptyCard, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.GitCompareArrows, { size: 48, color: colors_1.default.textTertiary }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.emptyTitle, children: "Nothing to Compare" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.emptyText, children: "Create at least two scenarios using the Clone Scenario button on the Estimate tab." })] }) }));
    }
    return ((0, jsx_runtime_1.jsxs)(react_native_1.ScrollView, { style: styles.container, contentContainerStyle: styles.content, showsVerticalScrollIndicator: false, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.headerCard, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.headerTitle, children: "Scenario Comparison" }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.headerSubtext, children: ["Comparing ", computed.length, " scenarios"] })] }), computed.map((s, i) => {
                let rank = null;
                if (computed.length > 1) {
                    if (s.name === cheapestName && cheapestName !== highestName)
                        rank = 'cheapest';
                    else if (s.name === highestName && cheapestName !== highestName)
                        rank = 'highest';
                }
                return ((0, jsx_runtime_1.jsx)(ScenarioSummaryCard, { scenario: s, index: i, rank: rank, cheapestTotal: minTotal, onEdit: () => handleEditScenario(i), onUseScenario: () => handleUseScenario(i) }, s.name));
            }), totalDiff > 0 && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.diffCard, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.diffHeader, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.TrendingUp, { size: 16, color: colors_1.default.accent }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.diffHeaderText, children: "Cost Difference" })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.diffDivider }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.diffMainRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.diffExplanation, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.diffFromTo, children: "Cheapest \u2192 Most expensive" }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.diffNames, children: [cheapestName, " \u2192 ", highestName] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.diffMainValue, children: ["+", (0, construction_1.formatEuro)(totalDiffWithVat)] })] }), incrementalDiffs.length > 1 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.diffDivider }), incrementalDiffs.map((d, i) => ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.diffIncrementalRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.diffIncrementalLabel, children: [d.from, " \u2192 ", d.to] }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.diffIncrementalValue, children: ["+", (0, construction_1.formatEuro)(d.diff)] })] }, i)))] })), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.diffVatNote, children: "All amounts include scenario VAT" })] })), costDriver && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.costDriverCard, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.costDriverHeader, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.TrendingUp, { size: 14, color: colors_1.default.white }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.costDriverTitle, children: "Largest Cost Driver" })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.costDriverBody, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.costDriverLabel, children: costDriver.label }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.costDriverValue, children: ["+", (0, construction_1.formatEuro)(costDriver.diff)] })] })] })), (0, jsx_runtime_1.jsx)(CostBarChart, { scenarios: computed }), changedParams.length > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.sectionHeader, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.AlertTriangle, { size: 14, color: colors_1.default.accent }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.sectionTitle, children: "Key Differences" })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.changesCard, children: changedParams.map((row, idx) => ((0, jsx_runtime_1.jsxs)(react_native_1.View, { children: [idx > 0 && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.changeDivider }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.changeRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.changeLabel, children: row.label }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.changeArrowRow, children: row.values.map((v, i) => ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [i > 0 && (0, jsx_runtime_1.jsx)(lucide_react_native_1.ChevronRight, { size: 14, color: colors_1.default.textTertiary, style: { marginHorizontal: 2 } }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.changeValueWrap, { borderLeftColor: COMPARE_COLORS[i] }], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.changeValueText, numberOfLines: 2, children: v }) })] }, i))) })] })] }, row.label))) })] })), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.sectionHeader, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.sectionTitle, children: "Parameter Comparison" }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { style: styles.toggleBtn, onPress: () => setShowAllParams((p) => !p), testID: "toggle-all-params", children: [showAllParams ? (0, jsx_runtime_1.jsx)(lucide_react_native_1.EyeOff, { size: 14, color: colors_1.default.primary }) : (0, jsx_runtime_1.jsx)(lucide_react_native_1.Eye, { size: 14, color: colors_1.default.primary }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.toggleText, children: showAllParams ? 'Differences only' : 'Show all' })] })] }), (0, jsx_runtime_1.jsx)(react_native_1.ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.tableCard, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.tableHeaderRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tableLabelCell, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tableHeaderText, children: "Parameter" }) }), computed.map((s, i) => ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.tableValueCell, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.tableHeaderDot, { backgroundColor: COMPARE_COLORS[i] }] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tableHeaderText, numberOfLines: 1, children: s.name })] }, i)))] }), displayedParams.map((row, idx) => ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [
                                styles.tableRow,
                                row.isDifferent && styles.tableRowHighlight,
                                idx % 2 === 0 && !row.isDifferent && styles.tableRowEven,
                            ], children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tableLabelCell, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.tableLabelText, row.isDifferent && styles.tableLabelTextHighlight], children: row.label }) }), row.values.map((v, i) => ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tableValueCell, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.tableValueText, row.isDifferent && styles.tableValueTextHighlight], numberOfLines: 2, children: v }) }, i)))] }, row.label)))] }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.sectionHeader, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.sectionTitle, children: "Cost Comparison" }) }), (0, jsx_runtime_1.jsx)(react_native_1.ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.tableCard, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.tableHeaderRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tableLabelCellWide, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tableHeaderText, children: "Category" }) }), computed.map((s, i) => ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.tableValueCell, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.tableHeaderDot, { backgroundColor: COMPARE_COLORS[i] }] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tableHeaderText, numberOfLines: 1, children: s.name })] }, i)))] }), groupedCostRows.map((row, idx) => ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [
                                styles.tableRow,
                                row.isGroupHeader && styles.tableGroupHeaderRow,
                                row.isDifferent && !row.isGroupHeader && styles.tableRowHighlight,
                                !row.isGroupHeader && !row.isDifferent && idx % 2 === 0 && styles.tableRowEven,
                            ], children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tableLabelCellWide, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                            styles.tableLabelText,
                                            row.isGroupHeader && styles.tableGroupHeaderText,
                                            row.isDifferent && !row.isGroupHeader && styles.tableLabelTextHighlight,
                                        ], children: row.isGroupHeader ? row.label : `  ${row.label}` }) }), row.values.map((v, i) => ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tableValueCell, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                            styles.tableValueText,
                                            row.isGroupHeader && styles.tableGroupHeaderValueText,
                                            row.isDifferent && !row.isGroupHeader && styles.tableValueTextHighlight,
                                        ], children: (0, construction_1.formatEuro)(v) }) }, i)))] }, `${row.label}-${idx}`))), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.tableRow, styles.tableSubtotalRow], children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tableLabelCellWide, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tableSubtotalLabel, children: "Project Subtotal (excl. VAT)" }) }), computed.map((s, i) => ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tableValueCell, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tableSubtotalValue, children: (0, construction_1.formatEuro)(s.preVatTotal) }) }, i)))] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.tableRow, styles.tableVatRow], children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tableLabelCellWide, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tableVatLabel, children: "VAT" }) }), computed.map((s, i) => ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tableValueCell, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tableVatValue, children: (0, construction_1.formatEuro)(s.vatAmount) }) }, i)))] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.tableTotalRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tableLabelCellWide, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tableTotalLabel, children: "Total Project Cost (incl. VAT)" }) }), computed.map((s, i) => ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.tableValueCell, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.tableTotalValue, { color: COMPARE_COLORS[i] }], children: (0, construction_1.formatEuro)(s.finalTotal) }) }, i)))] })] }) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.vatInfoCard, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.Info, { size: 14, color: colors_1.default.primary }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.vatInfoText, children: "VAT is applied to each scenario's pre-VAT project subtotal and shown separately from the base cost categories." })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.bottomSpacer })] }));
}
const tabularFont = react_native_1.Platform.select({
    web: { fontVariant: ['tabular-nums'] },
    default: { fontVariant: ['tabular-nums'] },
});
const summaryStyles = react_native_1.StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginTop: 12,
        backgroundColor: colors_1.default.card,
        borderRadius: 14,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    accentBar: {
        width: 3,
    },
    cardInner: {
        flex: 1,
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        color: colors_1.default.text,
        flex: 1,
    },
    priceBlock: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    totalCost: Object.assign({ fontSize: 26, fontWeight: '800', color: colors_1.default.text, letterSpacing: -0.5 }, tabularFont),
    vatLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: colors_1.default.textTertiary,
        marginLeft: 2,
    },
    subtotalLabel: Object.assign({ fontSize: 13, color: colors_1.default.textSecondary, marginTop: 2 }, tabularFont),
    diffBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
    },
    diffText: Object.assign({ fontSize: 12, fontWeight: '500', color: '#9CA3AF', marginTop: 4 }, tabularFont),
    diffPercent: Object.assign({ fontSize: 12, fontWeight: '600', color: '#9CA3AF', marginTop: 4 }, tabularFont),
    divider: {
        height: 1,
        backgroundColor: colors_1.default.borderLight,
        marginTop: 14,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
        paddingTop: 12,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 7,
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors_1.default.borderLight,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors_1.default.textSecondary,
    },
});
const chartStyles = react_native_1.StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 14,
        backgroundColor: colors_1.default.card,
        borderRadius: 14,
        padding: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    title: {
        fontSize: 13,
        fontWeight: '700',
        color: colors_1.default.text,
        letterSpacing: 0.2,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    scaleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    scaleLabel: Object.assign({ fontSize: 10, color: colors_1.default.textTertiary, fontWeight: '500' }, tabularFont),
    barRow: {
        gap: 4,
    },
    barLabelWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
    },
    barDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    barLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors_1.default.text,
        flex: 1,
    },
    barTrack: {
        height: 24,
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 6,
        overflow: 'hidden',
    },
    barFill: {
        height: 24,
        borderRadius: 6,
        minWidth: 8,
    },
    barValue: Object.assign({ fontSize: 14, fontWeight: '700', color: colors_1.default.text, marginTop: 2 }, tabularFont),
    vatNote: {
        fontSize: 10,
        color: colors_1.default.textTertiary,
        textAlign: 'right',
        marginTop: 2,
    },
});
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors_1.default.background,
    },
    content: {
        paddingBottom: 40,
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: colors_1.default.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyCard: {
        backgroundColor: colors_1.default.card,
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors_1.default.text,
    },
    emptyText: {
        fontSize: 14,
        color: colors_1.default.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    headerCard: {
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: colors_1.default.primary,
        letterSpacing: -0.3,
    },
    headerSubtext: {
        fontSize: 13,
        color: colors_1.default.textSecondary,
        marginTop: 3,
    },
    diffCard: {
        marginHorizontal: 16,
        marginTop: 14,
        backgroundColor: colors_1.default.card,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: colors_1.default.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    diffHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    diffHeaderText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors_1.default.text,
    },
    diffDivider: {
        height: 1,
        backgroundColor: colors_1.default.borderLight,
        marginVertical: 10,
    },
    diffMainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    diffExplanation: {
        flex: 1,
        marginRight: 12,
    },
    diffFromTo: {
        fontSize: 12,
        fontWeight: '600',
        color: colors_1.default.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    diffNames: {
        fontSize: 13,
        fontWeight: '600',
        color: colors_1.default.textSecondary,
        marginTop: 2,
    },
    diffMainValue: Object.assign({ fontSize: 22, fontWeight: '800', color: colors_1.default.accent }, tabularFont),
    diffIncrementalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    diffIncrementalLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors_1.default.textSecondary,
    },
    diffIncrementalValue: Object.assign({ fontSize: 14, fontWeight: '700', color: colors_1.default.accent }, tabularFont),
    diffVatNote: {
        fontSize: 10,
        color: colors_1.default.textTertiary,
        marginTop: 8,
        textAlign: 'right',
    },
    costDriverCard: {
        marginHorizontal: 16,
        marginTop: 12,
        backgroundColor: colors_1.default.primary,
        borderRadius: 12,
        overflow: 'hidden',
    },
    costDriverHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 4,
    },
    costDriverTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: colors_1.default.heroText,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        opacity: 0.8,
    },
    costDriverBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingBottom: 12,
        paddingTop: 2,
    },
    costDriverLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: colors_1.default.heroText,
    },
    costDriverValue: Object.assign({ fontSize: 18, fontWeight: '800', color: '#FFD699' }, tabularFont),
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 20,
        marginBottom: 8,
        gap: 6,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors_1.default.text,
        letterSpacing: 0.3,
        flex: 1,
    },
    toggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 8,
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors_1.default.primary,
    },
    changesCard: {
        marginHorizontal: 16,
        backgroundColor: colors_1.default.card,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: colors_1.default.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    changeDivider: {
        height: 1,
        backgroundColor: colors_1.default.borderLight,
        marginVertical: 10,
    },
    changeRow: {
        gap: 6,
    },
    changeLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: colors_1.default.accent,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    changeArrowRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 4,
    },
    changeValueWrap: {
        borderLeftWidth: 3,
        paddingLeft: 8,
        paddingVertical: 4,
        paddingRight: 10,
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 6,
    },
    changeValueText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors_1.default.text,
        flexShrink: 1,
    },
    tableCard: {
        marginHorizontal: 16,
        backgroundColor: colors_1.default.card,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: colors_1.default.primary,
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    tableHeaderDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    tableHeaderText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors_1.default.heroText,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    tableLabelCell: {
        width: 130,
        paddingRight: 8,
        justifyContent: 'center',
    },
    tableLabelCellWide: {
        width: 165,
        paddingRight: 8,
        justifyContent: 'center',
    },
    tableValueCell: {
        width: 120,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 9,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors_1.default.borderLight,
    },
    tableRowEven: {
        backgroundColor: colors_1.default.inputBg,
    },
    tableRowHighlight: {
        backgroundColor: '#FFF8F2',
    },
    tableGroupHeaderRow: {
        backgroundColor: '#F0EBE5',
        borderBottomWidth: 1,
        borderBottomColor: colors_1.default.border,
    },
    tableGroupHeaderText: {
        fontSize: 13,
        fontWeight: '800',
        color: colors_1.default.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    tableGroupHeaderValueText: Object.assign({ fontWeight: '800', color: colors_1.default.primary, fontSize: 13 }, tabularFont),
    tableLabelText: {
        fontSize: 13,
        fontWeight: '500',
        color: colors_1.default.textSecondary,
    },
    tableLabelTextHighlight: {
        fontWeight: '700',
        color: colors_1.default.accent,
    },
    tableValueText: Object.assign({ fontSize: 13, fontWeight: '600', color: colors_1.default.text }, tabularFont),
    tableValueTextHighlight: {
        fontWeight: '700',
        color: colors_1.default.primary,
    },
    tableSubtotalRow: {
        backgroundColor: '#F0EBE5',
        borderBottomWidth: 0,
        paddingVertical: 12,
    },
    tableSubtotalLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: colors_1.default.text,
    },
    tableSubtotalValue: Object.assign({ fontSize: 13, fontWeight: '700', color: colors_1.default.text }, tabularFont),
    tableVatRow: {
        backgroundColor: colors_1.default.inputBg,
        borderBottomWidth: 0,
        paddingVertical: 10,
    },
    tableVatLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors_1.default.textSecondary,
    },
    tableVatValue: Object.assign({ fontSize: 12, fontWeight: '600', color: colors_1.default.textSecondary }, tabularFont),
    tableTotalRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 12,
        backgroundColor: colors_1.default.primary,
    },
    tableTotalLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: colors_1.default.heroText,
    },
    tableTotalValue: Object.assign({ fontSize: 14, fontWeight: '800', color: colors_1.default.heroText }, tabularFont),
    vatInfoCard: {
        marginHorizontal: 16,
        marginTop: 12,
        flexDirection: 'row',
        gap: 8,
        backgroundColor: colors_1.default.card,
        borderRadius: 10,
        padding: 12,
        alignItems: 'flex-start',
    },
    vatInfoText: {
        fontSize: 11,
        color: colors_1.default.textSecondary,
        lineHeight: 16,
        flex: 1,
    },
    bottomSpacer: {
        height: 20,
    },
});
