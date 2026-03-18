import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, } from 'react-native';
import { useRouter } from 'expo-router';
import { GitCompareArrows, AlertTriangle, ChevronRight, TrendingUp, Eye, EyeOff, Pencil, ArrowRight, Info, Crown, CircleDollarSign, } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useEstimate } from '@/contexts/EstimateContext';
import { computeScenarioCosts, formatBasementSummary } from '@/utils/computeScenarioCosts';
import { formatEuro } from '@/constants/construction';
import { formatNumber, formatPercent } from '@/utils/format';
const SQUARE_METER_UNIT = 'm\u00B2';
const VAT_RATE = 0.24;
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
        { label: 'Location', getter: (s) => { var _a; return (_a = s.locationName) !== null && _a !== void 0 ? _a : ''; } },
        { label: 'Quality level', getter: (s) => { var _a; return (_a = s.qualityName) !== null && _a !== void 0 ? _a : ''; } },
        { label: 'Interior area', getter: (s) => { var _a; return `${formatNumber((_a = s.mainArea) !== null && _a !== void 0 ? _a : 0)} ${SQUARE_METER_UNIT}`; } },
        { label: 'Covered terrace', getter: (s) => { var _a; return `${formatNumber((_a = s.terraceArea) !== null && _a !== void 0 ? _a : 0)} ${SQUARE_METER_UNIT}`; } },
        { label: 'Balcony', getter: (s) => { var _a; return `${formatNumber((_a = s.balconyArea) !== null && _a !== void 0 ? _a : 0)} ${SQUARE_METER_UNIT}`; } },
        {
            label: 'Basement',
            getter: (s) => {
                var _a, _b, _c, _d, _e;
                return ((_a = s.basementArea) !== null && _a !== void 0 ? _a : 0) > 0
                    ? `${formatNumber((_b = s.basementArea) !== null && _b !== void 0 ? _b : 0)} ${SQUARE_METER_UNIT} · ${formatBasementSummary((_c = s.storageBasementArea) !== null && _c !== void 0 ? _c : 0, (_d = s.parkingBasementArea) !== null && _d !== void 0 ? _d : 0, (_e = s.habitableBasementArea) !== null && _e !== void 0 ? _e : 0)}`
                    : 'None';
            },
        },
        {
            label: 'Effective area',
            getter: (s) => { var _a; return `${formatNumber((_a = s.effectiveArea) !== null && _a !== void 0 ? _a : 0)} ${SQUARE_METER_UNIT}`; },
        },
        {
            label: 'Pool',
            getter: (s) => {
                var _a, _b;
                return s.includePool
                    ? `${(_a = s.poolSizeName) !== null && _a !== void 0 ? _a : ''} (${formatNumber((_b = s.poolArea) !== null && _b !== void 0 ? _b : 0)} ${SQUARE_METER_UNIT})`
                    : 'None';
            },
        },
        { label: 'Site conditions', getter: (s) => { var _a; return (_a = s.siteConditionName) !== null && _a !== void 0 ? _a : ''; } },
        { label: 'Groundwater', getter: (s) => { var _a; return (_a = s.groundwaterConditionName) !== null && _a !== void 0 ? _a : ''; } },
        { label: 'Site access', getter: (s) => { var _a; return (_a = s.siteAccessibilityName) !== null && _a !== void 0 ? _a : ''; } },
        {
            label: 'Landscaping',
            getter: (s) => {
                var _a, _b;
                return ((_a = s.landscapingArea) !== null && _a !== void 0 ? _a : 0) > 0
                    ? `${formatNumber((_b = s.landscapingArea) !== null && _b !== void 0 ? _b : 0)} ${SQUARE_METER_UNIT}`
                    : 'None';
            },
        },
        {
            label: 'HVAC add-ons',
            getter: (s) => {
                var _a, _b;
                return ((_b = (_a = s.hvacNames) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0
                    ? s.hvacNames.join(', ')
                    : 'Base only';
            },
        },
        {
            label: 'Contractor overhead',
            getter: (s) => { var _a; return formatPercent((_a = s.contractorPercent) !== null && _a !== void 0 ? _a : 0, 1); },
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
        const values = scenarios.map((s) => { var _a; return (_a = getter(s)) !== null && _a !== void 0 ? _a : 0; });
        const isDifferent = new Set(values).size > 1;
        return Object.assign({ label, values, isDifferent }, opts);
    };
    rows.push(makeRow('Construction', (s) => s.rawBuildingCost, { isGroupHeader: true }));
    rows.push(makeRow('Building construction', (s) => s.rawBuildingCost));
    rows.push(makeRow('Technical systems', (s) => { var _a; return (_a = s.hvacExtrasCost) !== null && _a !== void 0 ? _a : 0; }));
    rows.push(makeRow('Built-in equipment', () => 0));
    rows.push(makeRow('Site & External', (s) => s.siteCost + s.landscapingCost, { isGroupHeader: true }));
    rows.push(makeRow('Site preparation', (s) => s.siteCost));
    rows.push(makeRow('External works', (s) => s.landscapingCost));
    rows.push(makeRow('Project costs', (s) => s.permitFee, { isGroupHeader: true }));
    rows.push(makeRow('Planning & fees', (s) => s.permitFee));
    rows.push(makeRow('Contractor overhead', () => 0));
    rows.push(makeRow('Construction contingency', () => 0));
    return rows;
}
function getLargestCostDriver(scenarios) {
    if (scenarios.length < 2)
        return null;
    const categories = [
        { label: 'Building construction', getter: (s) => { var _a; return (_a = s.kg300Cost) !== null && _a !== void 0 ? _a : 0; } },
        { label: 'Technical systems', getter: (s) => { var _a; return (_a = s.kg400Total) !== null && _a !== void 0 ? _a : 0; } },
        { label: 'Built-in equipment', getter: (s) => { var _a; return (_a = s.kg600Cost) !== null && _a !== void 0 ? _a : 0; } },
        { label: 'Site preparation', getter: (s) => { var _a; return (_a = s.kg200Total) !== null && _a !== void 0 ? _a : 0; } },
        { label: 'External works', getter: (s) => { var _a; return (_a = s.kg500Total) !== null && _a !== void 0 ? _a : 0; } },
        { label: 'Planning & fees', getter: (s) => { var _a; return (_a = s.permitDesignFee) !== null && _a !== void 0 ? _a : 0; } },
        { label: 'Contractor overhead', getter: (s) => { var _a; return (_a = s.contractorCost) !== null && _a !== void 0 ? _a : 0; } },
        { label: 'Construction contingency', getter: (s) => { var _a; return (_a = s.contingencyCost) !== null && _a !== void 0 ? _a : 0; } },
    ];
    let maxDiff = 0;
    let maxLabel = '';
    for (const cat of categories) {
        const vals = scenarios.map((s) => { var _a; return (_a = cat.getter(s)) !== null && _a !== void 0 ? _a : 0; });
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
    const vatAmount = Math.round(scenario.totalCost * VAT_RATE);
    const totalWithVat = scenario.totalCost + vatAmount;
    const cheapestWithVat = Math.round(cheapestTotal * (1 + VAT_RATE));
    const diffFromCheapest = totalWithVat - cheapestWithVat;
    const diffPercent = cheapestWithVat > 0 ? Math.round((diffFromCheapest / cheapestWithVat) * 100) : 0;
    return (_jsxs(View, { style: summaryStyles.card, children: [_jsx(View, { style: [summaryStyles.accentBar, { backgroundColor: color }] }), _jsxs(View, { style: summaryStyles.cardInner, children: [_jsx(View, { style: summaryStyles.headerRow, children: _jsxs(View, { style: summaryStyles.nameRow, children: [_jsx(Text, { style: summaryStyles.name, numberOfLines: 1, children: scenario.name }), rank === 'highest' && (_jsx(View, { accessible: true, accessibilityLabel: "Highest cost scenario", children: _jsx(Crown, { size: 14, color: MUTED_ICON }) })), rank === 'cheapest' && (_jsx(View, { accessible: true, accessibilityLabel: "Lowest cost scenario", children: _jsx(CircleDollarSign, { size: 14, color: MUTED_ICON }) }))] }) }), _jsxs(View, { style: summaryStyles.priceBlock, children: [_jsx(Text, { style: summaryStyles.totalCost, children: formatEuro(totalWithVat) }), _jsx(Text, { style: summaryStyles.vatLabel, children: " incl. VAT" })] }), _jsxs(Text, { style: summaryStyles.subtotalLabel, children: [formatEuro(scenario.totalCost), " excl. VAT"] }), rank === 'cheapest' && (_jsx(Text, { style: summaryStyles.diffText, children: "baseline" })), rank !== 'cheapest' && diffFromCheapest > 0 && (_jsxs(View, { style: summaryStyles.diffBlock, children: [_jsxs(Text, { style: summaryStyles.diffText, children: ["+", formatEuro(diffFromCheapest), " vs cheapest"] }), _jsx(Text, { style: summaryStyles.diffPercent, children: `(+${formatPercent(diffPercent)})` })] })), _jsx(View, { style: summaryStyles.divider }), _jsxs(View, { style: summaryStyles.actions, children: [_jsxs(TouchableOpacity, { style: summaryStyles.actionBtn, onPress: onEdit, testID: `edit-scenario-${index}`, children: [_jsx(Pencil, { size: 13, color: Colors.textSecondary }), _jsx(Text, { style: summaryStyles.actionText, children: "Edit" })] }), _jsxs(TouchableOpacity, { style: summaryStyles.actionBtn, onPress: onUseScenario, testID: `use-scenario-${index}`, children: [_jsx(ArrowRight, { size: 13, color: Colors.textSecondary }), _jsx(Text, { style: summaryStyles.actionText, children: "Use" })] })] })] })] }));
}
function CostBarChart({ scenarios }) {
    const maxCost = Math.max(...scenarios.map(s => { var _a; return ((_a = s.totalCost) !== null && _a !== void 0 ? _a : 0) * (1 + VAT_RATE); }));
    const scaleSteps = useMemo(() => {
        const step = Math.ceil(maxCost / 4 / 50000) * 50000;
        const steps = [];
        for (let i = step; i <= maxCost + step; i += step) {
            steps.push(i);
        }
        return steps.slice(0, 4);
    }, [maxCost]);
    return (_jsxs(View, { style: chartStyles.container, children: [_jsx(Text, { style: chartStyles.title, children: "Total Project Cost Comparison" }), _jsx(View, { style: chartStyles.scaleRow, children: scaleSteps.map((v) => (_jsx(Text, { style: chartStyles.scaleLabel, children: formatEuro(v) }, v))) }), scenarios.map((s, i) => {
                const totalWithVat = s.totalCost * (1 + VAT_RATE);
                const pct = (totalWithVat / maxCost) * 100;
                return (_jsxs(View, { style: chartStyles.barRow, children: [_jsxs(View, { style: chartStyles.barLabelWrap, children: [_jsx(View, { style: [chartStyles.barDot, { backgroundColor: COMPARE_COLORS[i] }] }), _jsx(Text, { style: chartStyles.barLabel, numberOfLines: 1, children: s.name })] }), _jsx(View, { style: chartStyles.barTrack, children: _jsx(View, { style: [chartStyles.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: COMPARE_COLORS[i] }] }) }), _jsx(Text, { style: chartStyles.barValue, children: formatEuro(totalWithVat) })] }, i));
            }), _jsx(Text, { style: chartStyles.vatNote, children: "Amounts include 24 % VAT" })] }));
}
export default function CompareScreen() {
    const { scenarios, getAllScenarioConfigs, switchScenario } = useEstimate();
    const router = useRouter();
    const [showAllParams, setShowAllParams] = useState(false);
    const allConfigs = useMemo(() => getAllScenarioConfigs(), [getAllScenarioConfigs]);
    const computed = useMemo(() => allConfigs.map(computeScenarioCosts), [allConfigs]);
    const handleEditScenario = useCallback((index) => {
        switchScenario(index);
        router.navigate('/(tabs)/(estimate)');
    }, [switchScenario, router]);
    const handleUseScenario = useCallback((index) => {
        switchScenario(index);
        router.navigate('/(tabs)/(estimate)');
    }, [switchScenario, router]);
    const paramRows = useMemo(() => computed.length >= 2 ? getParameterRows(computed) : [], [computed]);
    const groupedCostRows = useMemo(() => computed.length >= 2 ? getGroupedCostRows(computed) : [], [computed]);
    const totalValues = useMemo(() => computed.map((s) => s.totalCost), [computed]);
    const minTotal = useMemo(() => totalValues.length > 0 ? Math.min(...totalValues) : 0, [totalValues]);
    const maxTotal = useMemo(() => totalValues.length > 0 ? Math.max(...totalValues) : 0, [totalValues]);
    const totalDiff = maxTotal - minTotal;
    const totalDiffWithVat = Math.round(totalDiff * (1 + VAT_RATE));
    const sortedByTotal = useMemo(() => [...computed].sort((a, b) => a.totalCost - b.totalCost), [computed]);
    const cheapestName = sortedByTotal.length > 0 ? sortedByTotal[0].name : '';
    const highestName = sortedByTotal.length > 0 ? sortedByTotal[sortedByTotal.length - 1].name : '';
    const changedParams = useMemo(() => paramRows.filter((r) => r.isDifferent), [paramRows]);
    const displayedParams = showAllParams ? paramRows : changedParams;
    const costDriver = useMemo(() => getLargestCostDriver(computed), [computed]);
    const incrementalDiffs = useMemo(() => {
        if (sortedByTotal.length < 2)
            return [];
        const diffs = [];
        for (let i = 0; i < sortedByTotal.length - 1; i++) {
            const diff = sortedByTotal[i + 1].totalCost - sortedByTotal[i].totalCost;
            diffs.push({
                from: sortedByTotal[i].name,
                to: sortedByTotal[i + 1].name,
                diff: Math.round(diff * (1 + VAT_RATE)),
            });
        }
        return diffs;
    }, [sortedByTotal]);
    if (scenarios.length < 2) {
        return (_jsx(View, { style: styles.emptyContainer, children: _jsxs(View, { style: styles.emptyCard, children: [_jsx(GitCompareArrows, { size: 48, color: Colors.textTertiary }), _jsx(Text, { style: styles.emptyTitle, children: "Nothing to Compare" }), _jsx(Text, { style: styles.emptyText, children: "Create at least two scenarios using the Clone Scenario button on the Estimate tab." })] }) }));
    }
    return (_jsxs(ScrollView, { style: styles.container, contentContainerStyle: styles.content, showsVerticalScrollIndicator: false, children: [_jsxs(View, { style: styles.headerCard, children: [_jsx(Text, { style: styles.headerTitle, children: "Scenario Comparison" }), _jsxs(Text, { style: styles.headerSubtext, children: ["Comparing ", computed.length, " scenarios \u00B7 VAT 24 % included"] })] }), computed.map((s, i) => {
                let rank = null;
                if (computed.length > 1) {
                    if (s.name === cheapestName && cheapestName !== highestName)
                        rank = 'cheapest';
                    else if (s.name === highestName && cheapestName !== highestName)
                        rank = 'highest';
                }
                return (_jsx(ScenarioSummaryCard, { scenario: s, index: i, rank: rank, cheapestTotal: minTotal, onEdit: () => handleEditScenario(i), onUseScenario: () => handleUseScenario(i) }, s.name));
            }), totalDiff > 0 && (_jsxs(View, { style: styles.diffCard, children: [_jsxs(View, { style: styles.diffHeader, children: [_jsx(TrendingUp, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.diffHeaderText, children: "Cost Difference" })] }), _jsx(View, { style: styles.diffDivider }), _jsxs(View, { style: styles.diffMainRow, children: [_jsxs(View, { style: styles.diffExplanation, children: [_jsx(Text, { style: styles.diffFromTo, children: "Cheapest \u2192 Most expensive" }), _jsxs(Text, { style: styles.diffNames, children: [cheapestName, " \u2192 ", highestName] })] }), _jsxs(Text, { style: styles.diffMainValue, children: ["+", formatEuro(totalDiffWithVat)] })] }), incrementalDiffs.length > 1 && (_jsxs(_Fragment, { children: [_jsx(View, { style: styles.diffDivider }), incrementalDiffs.map((d, i) => (_jsxs(View, { style: styles.diffIncrementalRow, children: [_jsxs(Text, { style: styles.diffIncrementalLabel, children: [d.from, " \u2192 ", d.to] }), _jsxs(Text, { style: styles.diffIncrementalValue, children: ["+", formatEuro(d.diff)] })] }, i)))] })), _jsx(Text, { style: styles.diffVatNote, children: "All amounts include 24 % VAT" })] })), costDriver && (_jsxs(View, { style: styles.costDriverCard, children: [_jsxs(View, { style: styles.costDriverHeader, children: [_jsx(TrendingUp, { size: 14, color: Colors.white }), _jsx(Text, { style: styles.costDriverTitle, children: "Largest Cost Driver" })] }), _jsxs(View, { style: styles.costDriverBody, children: [_jsx(Text, { style: styles.costDriverLabel, children: costDriver.label }), _jsxs(Text, { style: styles.costDriverValue, children: ["+", formatEuro(costDriver.diff)] })] })] })), _jsx(CostBarChart, { scenarios: computed }), changedParams.length > 0 && (_jsxs(_Fragment, { children: [_jsxs(View, { style: styles.sectionHeader, children: [_jsx(AlertTriangle, { size: 14, color: Colors.accent }), _jsx(Text, { style: styles.sectionTitle, children: "Key Differences" })] }), _jsx(View, { style: styles.changesCard, children: changedParams.map((row, idx) => (_jsxs(View, { children: [idx > 0 && _jsx(View, { style: styles.changeDivider }), _jsxs(View, { style: styles.changeRow, children: [_jsx(Text, { style: styles.changeLabel, children: row.label }), _jsx(View, { style: styles.changeArrowRow, children: row.values.map((v, i) => (_jsxs(React.Fragment, { children: [i > 0 && _jsx(ChevronRight, { size: 14, color: Colors.textTertiary, style: { marginHorizontal: 2 } }), _jsx(View, { style: [styles.changeValueWrap, { borderLeftColor: COMPARE_COLORS[i] }], children: _jsx(Text, { style: styles.changeValueText, numberOfLines: 2, children: v }) })] }, i))) })] })] }, row.label))) })] })), _jsxs(View, { style: styles.sectionHeader, children: [_jsx(Text, { style: styles.sectionTitle, children: "Parameter Comparison" }), _jsxs(TouchableOpacity, { style: styles.toggleBtn, onPress: () => setShowAllParams((p) => !p), testID: "toggle-all-params", children: [showAllParams ? _jsx(EyeOff, { size: 14, color: Colors.primary }) : _jsx(Eye, { size: 14, color: Colors.primary }), _jsx(Text, { style: styles.toggleText, children: showAllParams ? 'Differences only' : 'Show all' })] })] }), _jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, children: _jsxs(View, { style: styles.tableCard, children: [_jsxs(View, { style: styles.tableHeaderRow, children: [_jsx(View, { style: styles.tableLabelCell, children: _jsx(Text, { style: styles.tableHeaderText, children: "Parameter" }) }), computed.map((s, i) => (_jsxs(View, { style: styles.tableValueCell, children: [_jsx(View, { style: [styles.tableHeaderDot, { backgroundColor: COMPARE_COLORS[i] }] }), _jsx(Text, { style: styles.tableHeaderText, numberOfLines: 1, children: s.name })] }, i)))] }), displayedParams.map((row, idx) => (_jsxs(View, { style: [
                                styles.tableRow,
                                row.isDifferent && styles.tableRowHighlight,
                                idx % 2 === 0 && !row.isDifferent && styles.tableRowEven,
                            ], children: [_jsx(View, { style: styles.tableLabelCell, children: _jsx(Text, { style: [styles.tableLabelText, row.isDifferent && styles.tableLabelTextHighlight], children: row.label }) }), row.values.map((v, i) => (_jsx(View, { style: styles.tableValueCell, children: _jsx(Text, { style: [styles.tableValueText, row.isDifferent && styles.tableValueTextHighlight], numberOfLines: 2, children: v }) }, i)))] }, row.label)))] }) }), _jsx(View, { style: styles.sectionHeader, children: _jsx(Text, { style: styles.sectionTitle, children: "Cost Comparison" }) }), _jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, children: _jsxs(View, { style: styles.tableCard, children: [_jsxs(View, { style: styles.tableHeaderRow, children: [_jsx(View, { style: styles.tableLabelCellWide, children: _jsx(Text, { style: styles.tableHeaderText, children: "Category" }) }), computed.map((s, i) => (_jsxs(View, { style: styles.tableValueCell, children: [_jsx(View, { style: [styles.tableHeaderDot, { backgroundColor: COMPARE_COLORS[i] }] }), _jsx(Text, { style: styles.tableHeaderText, numberOfLines: 1, children: s.name })] }, i)))] }), groupedCostRows.map((row, idx) => (_jsxs(View, { style: [
                                styles.tableRow,
                                row.isGroupHeader && styles.tableGroupHeaderRow,
                                row.isDifferent && !row.isGroupHeader && styles.tableRowHighlight,
                                !row.isGroupHeader && !row.isDifferent && idx % 2 === 0 && styles.tableRowEven,
                            ], children: [_jsx(View, { style: styles.tableLabelCellWide, children: _jsx(Text, { style: [
                                            styles.tableLabelText,
                                            row.isGroupHeader && styles.tableGroupHeaderText,
                                            row.isDifferent && !row.isGroupHeader && styles.tableLabelTextHighlight,
                                        ], children: row.isGroupHeader ? row.label : `  ${row.label}` }) }), row.values.map((v, i) => (_jsx(View, { style: styles.tableValueCell, children: _jsx(Text, { style: [
                                            styles.tableValueText,
                                            row.isGroupHeader && styles.tableGroupHeaderValueText,
                                            row.isDifferent && !row.isGroupHeader && styles.tableValueTextHighlight,
                                        ], children: formatEuro(v) }) }, i)))] }, `${row.label}-${idx}`))), _jsxs(View, { style: [styles.tableRow, styles.tableSubtotalRow], children: [_jsx(View, { style: styles.tableLabelCellWide, children: _jsx(Text, { style: styles.tableSubtotalLabel, children: "Project Subtotal (excl. VAT)" }) }), computed.map((s, i) => (_jsx(View, { style: styles.tableValueCell, children: _jsx(Text, { style: styles.tableSubtotalValue, children: formatEuro(s.totalCost) }) }, i)))] }), _jsxs(View, { style: [styles.tableRow, styles.tableVatRow], children: [_jsx(View, { style: styles.tableLabelCellWide, children: _jsx(Text, { style: styles.tableVatLabel, children: "VAT (24 %)" }) }), computed.map((s, i) => (_jsx(View, { style: styles.tableValueCell, children: _jsx(Text, { style: styles.tableVatValue, children: formatEuro(Math.round(s.totalCost * VAT_RATE)) }) }, i)))] }), _jsxs(View, { style: styles.tableTotalRow, children: [_jsx(View, { style: styles.tableLabelCellWide, children: _jsx(Text, { style: styles.tableTotalLabel, children: "Total Project Cost (incl. VAT)" }) }), computed.map((s, i) => (_jsx(View, { style: styles.tableValueCell, children: _jsx(Text, { style: [styles.tableTotalValue, { color: COMPARE_COLORS[i] }], children: formatEuro(Math.round(s.totalCost * (1 + VAT_RATE))) }) }, i)))] })] }) }), _jsxs(View, { style: styles.vatInfoCard, children: [_jsx(Info, { size: 14, color: Colors.primary }), _jsx(Text, { style: styles.vatInfoText, children: "VAT calculated using the current Greek construction VAT rate (24 %). VAT is applied to the full project subtotal and is not included in individual cost categories." })] }), _jsx(View, { style: styles.bottomSpacer })] }));
}
const tabularFont = Platform.select({
    web: { fontVariant: ['tabular-nums'] },
    default: { fontVariant: ['tabular-nums'] },
});
const summaryStyles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginTop: 12,
        backgroundColor: Colors.card,
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
        color: Colors.text,
        flex: 1,
    },
    priceBlock: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    totalCost: Object.assign({ fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 }, tabularFont),
    vatLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.textTertiary,
        marginLeft: 2,
    },
    subtotalLabel: Object.assign({ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }, tabularFont),
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
        backgroundColor: Colors.borderLight,
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
        backgroundColor: Colors.inputBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
});
const chartStyles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 14,
        backgroundColor: Colors.card,
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
        color: Colors.text,
        letterSpacing: 0.2,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    scaleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    scaleLabel: Object.assign({ fontSize: 10, color: Colors.textTertiary, fontWeight: '500' }, tabularFont),
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
        color: Colors.text,
        flex: 1,
    },
    barTrack: {
        height: 24,
        backgroundColor: Colors.inputBg,
        borderRadius: 6,
        overflow: 'hidden',
    },
    barFill: {
        height: 24,
        borderRadius: 6,
        minWidth: 8,
    },
    barValue: Object.assign({ fontSize: 14, fontWeight: '700', color: Colors.text, marginTop: 2 }, tabularFont),
    vatNote: {
        fontSize: 10,
        color: Colors.textTertiary,
        textAlign: 'right',
        marginTop: 2,
    },
});
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        paddingBottom: 40,
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyCard: {
        backgroundColor: Colors.card,
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
        color: Colors.text,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
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
        color: Colors.primary,
        letterSpacing: -0.3,
    },
    headerSubtext: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 3,
    },
    diffCard: {
        marginHorizontal: 16,
        marginTop: 14,
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
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
        color: Colors.text,
    },
    diffDivider: {
        height: 1,
        backgroundColor: Colors.borderLight,
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
        color: Colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    diffNames: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginTop: 2,
    },
    diffMainValue: Object.assign({ fontSize: 22, fontWeight: '800', color: Colors.accent }, tabularFont),
    diffIncrementalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    diffIncrementalLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    diffIncrementalValue: Object.assign({ fontSize: 14, fontWeight: '700', color: Colors.accent }, tabularFont),
    diffVatNote: {
        fontSize: 10,
        color: Colors.textTertiary,
        marginTop: 8,
        textAlign: 'right',
    },
    costDriverCard: {
        marginHorizontal: 16,
        marginTop: 12,
        backgroundColor: Colors.primary,
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
        color: Colors.heroText,
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
        color: Colors.heroText,
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
        color: Colors.text,
        letterSpacing: 0.3,
        flex: 1,
    },
    toggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: Colors.inputBg,
        borderRadius: 8,
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
    },
    changesCard: {
        marginHorizontal: 16,
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    changeDivider: {
        height: 1,
        backgroundColor: Colors.borderLight,
        marginVertical: 10,
    },
    changeRow: {
        gap: 6,
    },
    changeLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.accent,
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
        backgroundColor: Colors.inputBg,
        borderRadius: 6,
    },
    changeValueText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
        flexShrink: 1,
    },
    tableCard: {
        marginHorizontal: 16,
        backgroundColor: Colors.card,
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
        backgroundColor: Colors.primary,
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
        color: Colors.heroText,
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
        borderBottomColor: Colors.borderLight,
    },
    tableRowEven: {
        backgroundColor: Colors.inputBg,
    },
    tableRowHighlight: {
        backgroundColor: '#FFF8F2',
    },
    tableGroupHeaderRow: {
        backgroundColor: '#F0EBE5',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    tableGroupHeaderText: {
        fontSize: 13,
        fontWeight: '800',
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    tableGroupHeaderValueText: Object.assign({ fontWeight: '800', color: Colors.primary, fontSize: 13 }, tabularFont),
    tableLabelText: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    tableLabelTextHighlight: {
        fontWeight: '700',
        color: Colors.accent,
    },
    tableValueText: Object.assign({ fontSize: 13, fontWeight: '600', color: Colors.text }, tabularFont),
    tableValueTextHighlight: {
        fontWeight: '700',
        color: Colors.primary,
    },
    tableSubtotalRow: {
        backgroundColor: '#F0EBE5',
        borderBottomWidth: 0,
        paddingVertical: 12,
    },
    tableSubtotalLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.text,
    },
    tableSubtotalValue: Object.assign({ fontSize: 13, fontWeight: '700', color: Colors.text }, tabularFont),
    tableVatRow: {
        backgroundColor: Colors.inputBg,
        borderBottomWidth: 0,
        paddingVertical: 10,
    },
    tableVatLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    tableVatValue: Object.assign({ fontSize: 12, fontWeight: '600', color: Colors.textSecondary }, tabularFont),
    tableTotalRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 12,
        backgroundColor: Colors.primary,
    },
    tableTotalLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: Colors.heroText,
    },
    tableTotalValue: Object.assign({ fontSize: 14, fontWeight: '800', color: Colors.heroText }, tabularFont),
    vatInfoCard: {
        marginHorizontal: 16,
        marginTop: 12,
        flexDirection: 'row',
        gap: 8,
        backgroundColor: Colors.card,
        borderRadius: 10,
        padding: 12,
        alignItems: 'flex-start',
    },
    vatInfoText: {
        fontSize: 11,
        color: Colors.textSecondary,
        lineHeight: 16,
        flex: 1,
    },
    bottomSpacer: {
        height: 20,
    },
});
