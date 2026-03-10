import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  GitCompareArrows,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Eye,
  EyeOff,
  Pencil,
  ArrowRight,
  Info,
  Crown,
  CircleDollarSign,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useEstimate } from '@/contexts/EstimateContext';
import { computeScenarioCosts } from '@/utils/computeScenarioCosts';
import type { ComputedScenarioCosts } from '@/utils/computeScenarioCosts';
import { formatEuro } from '@/constants/construction';

const VAT_RATE = 0.24;

const COMPARE_COLORS = ['#2C5F6E', '#D4782F', '#2D8B55'];

const MUTED_ICON = '#9CA3AF';

interface ParameterRow {
  label: string;
  values: string[];
  isDifferent: boolean;
}

function getParameterRows(scenarios: ComputedScenarioCosts[]): ParameterRow[] {
  const params: { label: string; getter: (s: ComputedScenarioCosts) => string }[] = [
    { label: 'Location', getter: (s) => s.locationName ?? '' },
    { label: 'Quality level', getter: (s) => s.qualityName ?? '' },

    { label: 'Interior area', getter: (s) => `${(s.mainArea ?? 0)} m²` },
    { label: 'Covered terrace', getter: (s) => `${(s.terraceArea ?? 0)} m²` },
    { label: 'Balcony', getter: (s) => `${(s.balconyArea ?? 0)} m²` },

    {
      label: 'Basement',
      getter: (s) =>
        (s.basementArea ?? 0) > 0
          ? `${s.basementArea ?? 0} m²`
          : 'None',
    },

    {
      label: 'Effective area',
      getter: (s) => `${((s as any).effectiveArea ?? 0).toFixed(0)} m²`,
    },

    {
      label: 'Pool',
      getter: (s) =>
        (s as any).includePool
          ? `${(s as any).poolSizeName ?? ''} (${(s as any).poolArea ?? 0} m²)`
          : 'None',
    },

    { label: 'Site conditions', getter: (s) => (s as any).siteConditionName ?? '' },
    { label: 'Groundwater', getter: (s) => (s as any).groundwaterConditionName ?? '' },
    { label: 'Site access', getter: (s) => (s as any).siteAccessibilityName ?? '' },

    {
      label: 'Landscaping',
      getter: (s) =>
        ((s as any).landscapingArea ?? 0) > 0
          ? `${(s as any).landscapingArea ?? 0} m²`
          : 'None',
    },

    {
      label: 'HVAC add-ons',
      getter: (s) =>
        ((s as any).hvacNames?.length ?? 0) > 0
          ? (s as any).hvacNames.join(', ')
          : 'Base only',
    },

    {
      label: 'Contractor overhead',
      getter: (s) => `${((s as any).contractorPercent ?? 0)}%`,
    },
  ];

  return params.map((p) => {
    const values = scenarios.map(p.getter);
    const isDifferent = new Set(values).size > 1;
    return { label: p.label, values, isDifferent };
  });
}

interface CostGroupRow {
  label: string;
  values: number[];
  isDifferent: boolean;
  isGroupHeader?: boolean;
  isBold?: boolean;
}

function getGroupedCostRows(scenarios: ComputedScenarioCosts[]): CostGroupRow[] {
  const rows: CostGroupRow[] = [];

  const makeRow = (
    label: string,
    getter: (s: ComputedScenarioCosts) => number,
    opts?: { isGroupHeader?: boolean; isBold?: boolean }
  ): CostGroupRow => {
    const values = scenarios.map((s) => getter(s) ?? 0);
    const isDifferent = new Set(values).size > 1;
    return { label, values, isDifferent, ...opts };
  };

  rows.push(makeRow('Construction', (s) => (s as any).constructionSubtotal ?? 0, { isGroupHeader: true }));
  rows.push(makeRow('Building construction (KG 300)', (s) => (s as any).kg300Cost ?? 0));
  rows.push(makeRow('Technical systems (KG 400)', (s) => (s as any).kg400Total ?? 0));
  rows.push(makeRow('Built-in equipment (KG 600)', (s) => (s as any).kg600Cost ?? 0));

  rows.push(
    makeRow(
      'Site & External',
      (s) => ((s as any).kg200Total ?? 0) + ((s as any).kg500Total ?? 0),
      { isGroupHeader: true }
    )
  );

  rows.push(makeRow('Site preparation (KG 200)', (s) => (s as any).kg200Total ?? 0));
  rows.push(makeRow('External works (KG 500)', (s) => (s as any).kg500Total ?? 0));

  rows.push(
    makeRow(
      'Project costs',
      (s) =>
        ((s as any).permitDesignFee ?? 0) +
        ((s as any).contractorCost ?? 0) +
        ((s as any).contingencyCost ?? 0),
      { isGroupHeader: true }
    )
  );

  rows.push(makeRow('Planning & fees (KG 700)', (s) => (s as any).permitDesignFee ?? 0));
  rows.push(makeRow('Contractor overhead', (s) => (s as any).contractorCost ?? 0));
  rows.push(makeRow('Construction contingency', (s) => (s as any).contingencyCost ?? 0));

  return rows;
}

function getLargestCostDriver(
  scenarios: ComputedScenarioCosts[]
): { label: string; diff: number } | null {

  if (scenarios.length < 2) return null;

  const categories: { label: string; getter: (s: ComputedScenarioCosts) => number }[] = [
    { label: 'Building construction', getter: (s) => (s as any).kg300Cost ?? 0 },
    { label: 'Technical systems', getter: (s) => (s as any).kg400Total ?? 0 },
    { label: 'Built-in equipment', getter: (s) => (s as any).kg600Cost ?? 0 },
    { label: 'Site preparation', getter: (s) => (s as any).kg200Total ?? 0 },
    { label: 'External works', getter: (s) => (s as any).kg500Total ?? 0 },
    { label: 'Planning & fees', getter: (s) => (s as any).permitDesignFee ?? 0 },
    { label: 'Contractor overhead', getter: (s) => (s as any).contractorCost ?? 0 },
    { label: 'Construction contingency', getter: (s) => (s as any).contingencyCost ?? 0 },
  ];

  let maxDiff = 0;
  let maxLabel = '';

  for (const cat of categories) {
    const vals = scenarios.map((s) => cat.getter(s) ?? 0);
    const diff = Math.max(...vals) - Math.min(...vals);

    if (diff > maxDiff) {
      maxDiff = diff;
      maxLabel = cat.label;
    }
  }

  return maxDiff > 0 ? { label: maxLabel, diff: maxDiff } : null;
}

function ScenarioSummaryCard({ scenario, index, rank, cheapestTotal, onEdit, onUseScenario }: {
  scenario: ComputedScenarioCosts;
  index: number;
  rank: 'cheapest' | 'highest' | null;
  cheapestTotal: number;
  onEdit: () => void;
  onUseScenario: () => void;
}) {
  const color = COMPARE_COLORS[index];
  const vatAmount = Math.round(scenario.totalCost * VAT_RATE);
  const totalWithVat = scenario.totalCost + vatAmount;
  const cheapestWithVat = Math.round(cheapestTotal * (1 + VAT_RATE));

  const diffFromCheapest = totalWithVat - cheapestWithVat;
  const diffPercent = cheapestWithVat > 0 ? Math.round((diffFromCheapest / cheapestWithVat) * 100) : 0;

  return (
    <View style={summaryStyles.card}>
      <View style={[summaryStyles.accentBar, { backgroundColor: color }]} />
      <View style={summaryStyles.cardInner}>
        <View style={summaryStyles.headerRow}>
          <View style={summaryStyles.nameRow}>
            <Text style={summaryStyles.name} numberOfLines={1}>{scenario.name}</Text>
            {rank === 'highest' && (
              <View accessible accessibilityLabel="Highest cost scenario">
                <Crown size={14} color={MUTED_ICON} />
              </View>
            )}
            {rank === 'cheapest' && (
              <View accessible accessibilityLabel="Lowest cost scenario">
                <CircleDollarSign size={14} color={MUTED_ICON} />
              </View>
            )}
          </View>
        </View>

        <View style={summaryStyles.priceBlock}>
          <Text style={summaryStyles.totalCost}>{formatEuro(totalWithVat)}</Text>
          <Text style={summaryStyles.vatLabel}> incl. VAT</Text>
        </View>
        <Text style={summaryStyles.subtotalLabel}>{formatEuro(scenario.totalCost)} excl. VAT</Text>

        {rank === 'cheapest' && (
          <Text style={summaryStyles.diffText}>baseline</Text>
        )}
        {rank !== 'cheapest' && diffFromCheapest > 0 && (
          <View style={summaryStyles.diffBlock}>
            <Text style={summaryStyles.diffText}>
              +{formatEuro(diffFromCheapest)} vs cheapest
            </Text>
            <Text style={summaryStyles.diffPercent}>(+{diffPercent}%)</Text>
          </View>
        )}

        <View style={summaryStyles.divider} />
        <View style={summaryStyles.actions}>
          <TouchableOpacity style={summaryStyles.actionBtn} onPress={onEdit} testID={`edit-scenario-${index}`}>
            <Pencil size={13} color={Colors.textSecondary} />
            <Text style={summaryStyles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={summaryStyles.actionBtn} onPress={onUseScenario} testID={`use-scenario-${index}`}>
            <ArrowRight size={13} color={Colors.textSecondary} />
            <Text style={summaryStyles.actionText}>Use</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function CostBarChart({ scenarios }: { scenarios: ComputedScenarioCosts[] }) {
  const maxCost = Math.max(...scenarios.map((s) => s.totalCost * (1 + VAT_RATE)), 1);
  const scaleSteps = useMemo(() => {
    const step = Math.ceil(maxCost / 4 / 50000) * 50000;
    const steps: number[] = [];
    for (let i = step; i <= maxCost + step; i += step) {
      steps.push(i);
    }
    return steps.slice(0, 4);
  }, [maxCost]);

  return (
    <View style={chartStyles.container}>
      <Text style={chartStyles.title}>Total Project Cost Comparison</Text>
      <View style={chartStyles.scaleRow}>
        {scaleSteps.map((v) => (
          <Text key={v} style={chartStyles.scaleLabel}>{formatEuro(v)}</Text>
        ))}
      </View>
      {scenarios.map((s, i) => {
        const totalWithVat = s.totalCost * (1 + VAT_RATE);
        const pct = (totalWithVat / maxCost) * 100;
        return (
          <View key={i} style={chartStyles.barRow}>
            <View style={chartStyles.barLabelWrap}>
              <View style={[chartStyles.barDot, { backgroundColor: COMPARE_COLORS[i] }]} />
              <Text style={chartStyles.barLabel} numberOfLines={1}>{s.name}</Text>
            </View>
            <View style={chartStyles.barTrack}>
              <View style={[chartStyles.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: COMPARE_COLORS[i] }]} />
            </View>
            <Text style={chartStyles.barValue}>{formatEuro(totalWithVat)}</Text>
          </View>
        );
      })}
      <Text style={chartStyles.vatNote}>Amounts include 24% VAT</Text>
    </View>
  );
}

export default function CompareScreen() {
  const { scenarios, getAllScenarioConfigs, switchScenario } = useEstimate();
  const router = useRouter();
  const [showAllParams, setShowAllParams] = useState<boolean>(false);

  const allConfigs = useMemo(() => getAllScenarioConfigs(), [getAllScenarioConfigs]);

  const computed = useMemo<ComputedScenarioCosts[]>(
    () => allConfigs.map(computeScenarioCosts),
    [allConfigs],
  );

  const handleEditScenario = useCallback((index: number) => {
    switchScenario(index);
    router.navigate('/(tabs)/(estimate)');
  }, [switchScenario, router]);

  const handleUseScenario = useCallback((index: number) => {
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
    if (sortedByTotal.length < 2) return [];
    const diffs: { from: string; to: string; diff: number }[] = [];
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
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <GitCompareArrows size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Nothing to Compare</Text>
          <Text style={styles.emptyText}>
            Create at least two scenarios using the Clone Scenario button on the Estimate tab.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Scenario Comparison</Text>
        <Text style={styles.headerSubtext}>
          Comparing {computed.length} scenarios · VAT 24% included
        </Text>
      </View>

      {computed.map((s, i) => {
        let rank: 'cheapest' | 'highest' | null = null;
        if (computed.length > 1) {
          if (s.name === cheapestName && cheapestName !== highestName) rank = 'cheapest';
          else if (s.name === highestName && cheapestName !== highestName) rank = 'highest';
        }
        return (
          <ScenarioSummaryCard
            key={s.name}
            scenario={s}
            index={i}
            rank={rank}
            cheapestTotal={minTotal}
            onEdit={() => handleEditScenario(i)}
            onUseScenario={() => handleUseScenario(i)}
          />
        );
      })}

      {totalDiff > 0 && (
        <View style={styles.diffCard}>
          <View style={styles.diffHeader}>
            <TrendingUp size={16} color={Colors.accent} />
            <Text style={styles.diffHeaderText}>Cost Difference</Text>
          </View>
          <View style={styles.diffDivider} />
          <View style={styles.diffMainRow}>
            <View style={styles.diffExplanation}>
              <Text style={styles.diffFromTo}>Cheapest → Most expensive</Text>
              <Text style={styles.diffNames}>{cheapestName} → {highestName}</Text>
            </View>
            <Text style={styles.diffMainValue}>+{formatEuro(totalDiffWithVat)}</Text>
          </View>
          {incrementalDiffs.length > 1 && (
            <>
              <View style={styles.diffDivider} />
              {incrementalDiffs.map((d, i) => (
                <View key={i} style={styles.diffIncrementalRow}>
                  <Text style={styles.diffIncrementalLabel}>{d.from} → {d.to}</Text>
                  <Text style={styles.diffIncrementalValue}>+{formatEuro(d.diff)}</Text>
                </View>
              ))}
            </>
          )}
          <Text style={styles.diffVatNote}>All amounts include 24% VAT</Text>
        </View>
      )}

      {costDriver && (
        <View style={styles.costDriverCard}>
          <View style={styles.costDriverHeader}>
            <TrendingUp size={14} color={Colors.white} />
            <Text style={styles.costDriverTitle}>Largest Cost Driver</Text>
          </View>
          <View style={styles.costDriverBody}>
            <Text style={styles.costDriverLabel}>{costDriver.label}</Text>
            <Text style={styles.costDriverValue}>+{formatEuro(costDriver.diff)}</Text>
          </View>
        </View>
      )}

      <CostBarChart scenarios={computed} />

      {changedParams.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <AlertTriangle size={14} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Key Differences</Text>
          </View>
          <View style={styles.changesCard}>
            {changedParams.map((row, idx) => (
              <View key={row.label}>
                {idx > 0 && <View style={styles.changeDivider} />}
                <View style={styles.changeRow}>
                  <Text style={styles.changeLabel}>{row.label}</Text>
                  <View style={styles.changeArrowRow}>
                    {row.values.map((v, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <ChevronRight size={14} color={Colors.textTertiary} style={{ marginHorizontal: 2 }} />}
                        <View style={[styles.changeValueWrap, { borderLeftColor: COMPARE_COLORS[i] }]}>
                          <Text style={styles.changeValueText} numberOfLines={2}>{v}</Text>
                        </View>
                      </React.Fragment>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Parameter Comparison</Text>
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setShowAllParams((p) => !p)}
          testID="toggle-all-params"
        >
          {showAllParams ? <EyeOff size={14} color={Colors.primary} /> : <Eye size={14} color={Colors.primary} />}
          <Text style={styles.toggleText}>{showAllParams ? 'Differences only' : 'Show all'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableCard}>
          <View style={styles.tableHeaderRow}>
            <View style={styles.tableLabelCell}>
              <Text style={styles.tableHeaderText}>Parameter</Text>
            </View>
            {computed.map((s, i) => (
              <View key={i} style={styles.tableValueCell}>
                <View style={[styles.tableHeaderDot, { backgroundColor: COMPARE_COLORS[i] }]} />
                <Text style={styles.tableHeaderText} numberOfLines={1}>{s.name}</Text>
              </View>
            ))}
          </View>
          {displayedParams.map((row, idx) => (
            <View
              key={row.label}
              style={[
                styles.tableRow,
                row.isDifferent && styles.tableRowHighlight,
                idx % 2 === 0 && !row.isDifferent && styles.tableRowEven,
              ]}
            >
              <View style={styles.tableLabelCell}>
                <Text style={[styles.tableLabelText, row.isDifferent && styles.tableLabelTextHighlight]}>
                  {row.label}
                </Text>
              </View>
              {row.values.map((v, i) => (
                <View key={i} style={styles.tableValueCell}>
                  <Text style={[styles.tableValueText, row.isDifferent && styles.tableValueTextHighlight]} numberOfLines={2}>
                    {v}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Cost Comparison</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableCard}>
          <View style={styles.tableHeaderRow}>
            <View style={styles.tableLabelCellWide}>
              <Text style={styles.tableHeaderText}>Category</Text>
            </View>
            {computed.map((s, i) => (
              <View key={i} style={styles.tableValueCell}>
                <View style={[styles.tableHeaderDot, { backgroundColor: COMPARE_COLORS[i] }]} />
                <Text style={styles.tableHeaderText} numberOfLines={1}>{s.name}</Text>
              </View>
            ))}
          </View>
          {groupedCostRows.map((row, idx) => (
            <View
              key={`${row.label}-${idx}`}
              style={[
                styles.tableRow,
                row.isGroupHeader && styles.tableGroupHeaderRow,
                row.isDifferent && !row.isGroupHeader && styles.tableRowHighlight,
                !row.isGroupHeader && !row.isDifferent && idx % 2 === 0 && styles.tableRowEven,
              ]}
            >
              <View style={styles.tableLabelCellWide}>
                <Text style={[
                  styles.tableLabelText,
                  row.isGroupHeader && styles.tableGroupHeaderText,
                  row.isDifferent && !row.isGroupHeader && styles.tableLabelTextHighlight,
                ]}>
                  {row.isGroupHeader ? row.label : `  ${row.label}`}
                </Text>
              </View>
              {row.values.map((v, i) => (
                <View key={i} style={styles.tableValueCell}>
                  <Text style={[
                    styles.tableValueText,
                    row.isGroupHeader && styles.tableGroupHeaderValueText,
                    row.isDifferent && !row.isGroupHeader && styles.tableValueTextHighlight,
                  ]}>
                    {formatEuro(v)}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          <View style={[styles.tableRow, styles.tableSubtotalRow]}>
            <View style={styles.tableLabelCellWide}>
              <Text style={styles.tableSubtotalLabel}>Project Subtotal (excl. VAT)</Text>
            </View>
            {computed.map((s, i) => (
              <View key={i} style={styles.tableValueCell}>
                <Text style={styles.tableSubtotalValue}>{formatEuro(s.totalCost)}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.tableRow, styles.tableVatRow]}>
            <View style={styles.tableLabelCellWide}>
              <Text style={styles.tableVatLabel}>VAT (24%)</Text>
            </View>
            {computed.map((s, i) => (
              <View key={i} style={styles.tableValueCell}>
                <Text style={styles.tableVatValue}>{formatEuro(Math.round(s.totalCost * VAT_RATE))}</Text>
              </View>
            ))}
          </View>

          <View style={styles.tableTotalRow}>
            <View style={styles.tableLabelCellWide}>
              <Text style={styles.tableTotalLabel}>Total Project Cost (incl. VAT)</Text>
            </View>
            {computed.map((s, i) => (
              <View key={i} style={styles.tableValueCell}>
                <Text style={[styles.tableTotalValue, { color: COMPARE_COLORS[i] }]}>
                  {formatEuro(Math.round(s.totalCost * (1 + VAT_RATE)))}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.vatInfoCard}>
        <Info size={14} color={Colors.primary} />
        <Text style={styles.vatInfoText}>
          VAT calculated using the current Greek construction VAT rate (24%). VAT is applied to the full project subtotal and is not included in individual cost categories.
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const tabularFont = Platform.select({
  web: { fontVariant: ['tabular-nums' as const] },
  default: { fontVariant: ['tabular-nums' as const] },
});

const summaryStyles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    flexDirection: 'row' as const,
    overflow: 'hidden' as const,
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
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 10,
  },
  nameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  priceBlock: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
  },
  totalCost: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
    ...tabularFont,
  },
  vatLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textTertiary,
    marginLeft: 2,
  },
  subtotalLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    ...tabularFont,
  },
  diffBlock: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginTop: 6,
  },
  diffText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#9CA3AF',
    marginTop: 4,
    ...tabularFont,
  },
  diffPercent: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    marginTop: 4,
    ...tabularFont,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginTop: 14,
  },
  actions: {
    flexDirection: 'row' as const,
    gap: 10,
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
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
    fontWeight: '600' as const,
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
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: 0.2,
    textTransform: 'uppercase' as const,
    marginBottom: 2,
  },
  scaleRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 4,
  },
  scaleLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '500' as const,
    ...tabularFont,
  },
  barRow: {
    gap: 4,
  },
  barLabelWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
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
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  barTrack: {
    height: 24,
    backgroundColor: Colors.inputBg,
    borderRadius: 6,
    overflow: 'hidden' as const,
  },
  barFill: {
    height: 24,
    borderRadius: 6,
    minWidth: 8,
  },
  barValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 2,
    ...tabularFont,
  },
  vatNote: {
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'right' as const,
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
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 32,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center' as const,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
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
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  diffHeaderText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  diffDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  diffMainRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  diffExplanation: {
    flex: 1,
    marginRight: 12,
  },
  diffFromTo: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  diffNames: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  diffMainValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.accent,
    ...tabularFont,
  },
  diffIncrementalRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 4,
  },
  diffIncrementalLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  diffIncrementalValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.accent,
    ...tabularFont,
  },
  diffVatNote: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 8,
    textAlign: 'right' as const,
  },
  costDriverCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    overflow: 'hidden' as const,
  },
  costDriverHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  costDriverTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.heroText,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
    opacity: 0.8,
  },
  costDriverBody: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 2,
  },
  costDriverLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.heroText,
  },
  costDriverValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFD699',
    ...tabularFont,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: 0.3,
    flex: 1,
  },
  toggleBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.inputBg,
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600' as const,
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
    fontWeight: '700' as const,
    color: Colors.accent,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  changeArrowRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'center' as const,
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
    fontWeight: '600' as const,
    color: Colors.text,
    flexShrink: 1,
  },
  tableCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 14,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  tableHeaderRow: {
    flexDirection: 'row' as const,
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
    fontWeight: '700' as const,
    color: Colors.heroText,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  tableLabelCell: {
    width: 130,
    paddingRight: 8,
    justifyContent: 'center' as const,
  },
  tableLabelCellWide: {
    width: 165,
    paddingRight: 8,
    justifyContent: 'center' as const,
  },
  tableValueCell: {
    width: 120,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row' as const,
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
    fontWeight: '800' as const,
    color: Colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  tableGroupHeaderValueText: {
    fontWeight: '800' as const,
    color: Colors.primary,
    fontSize: 13,
    ...tabularFont,
  },
  tableLabelText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  tableLabelTextHighlight: {
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  tableValueText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    ...tabularFont,
  },
  tableValueTextHighlight: {
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  tableSubtotalRow: {
    backgroundColor: '#F0EBE5',
    borderBottomWidth: 0,
    paddingVertical: 12,
  },
  tableSubtotalLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  tableSubtotalValue: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    ...tabularFont,
  },
  tableVatRow: {
    backgroundColor: Colors.inputBg,
    borderBottomWidth: 0,
    paddingVertical: 10,
  },
  tableVatLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tableVatValue: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    ...tabularFont,
  },
  tableTotalRow: {
    flexDirection: 'row' as const,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
  },
  tableTotalLabel: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.heroText,
  },
  tableTotalValue: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.heroText,
    ...tabularFont,
  },
  vatInfoCard: {
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row' as const,
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    alignItems: 'flex-start' as const,
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
