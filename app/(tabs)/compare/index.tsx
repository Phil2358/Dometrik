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
import { useUserMode } from '@/contexts/UserModeContext';
import { computeScenarioCosts, formatBasementSummary } from '@/utils/computeScenarioCosts';
import type { ComputedScenarioCosts } from '@/utils/computeScenarioCosts';
import { getDin276Group, getDin276Subgroup } from '@/constants/din276Groups';
import { formatEuro } from '@/constants/construction';
import { formatNumber, formatPercent } from '@/utils/format';

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

interface ParameterRow {
  label: string;
  values: string[];
  isDifferent: boolean;
}

function getParameterRows(scenarios: ComputedScenarioCosts[]): ParameterRow[] {
  const params: { label: string; getter: (s: ComputedScenarioCosts) => string }[] = [
    { label: 'Location', getter: (s) => s.locationName },
    { label: 'Quality level', getter: (s) => s.qualityName },

    { label: 'Interior area', getter: (s) => `${formatNumber(s.mainArea)} ${SQUARE_METER_UNIT}` },
    { label: 'Covered terrace', getter: (s) => `${formatNumber(s.terraceArea)} ${SQUARE_METER_UNIT}` },
    { label: 'Balcony', getter: (s) => `${formatNumber(s.balconyArea)} ${SQUARE_METER_UNIT}` },

    {
      label: 'Basement',
      getter: (s) =>
        s.basementArea > 0
          ? `${formatNumber(s.basementArea)} ${SQUARE_METER_UNIT} · ${formatBasementSummary(
            s.storageBasementArea,
            s.parkingBasementArea,
            s.habitableBasementArea,
          )}`
          : 'None',
    },

    {
      label: 'Building area',
      getter: (s) => `${formatNumber(s.buildingArea)} ${SQUARE_METER_UNIT}`,
    },

    {
      label: 'Pool',
      getter: (s) =>
        s.includePool
          ? `${s.poolSizeName} (${formatNumber(s.poolArea)} ${SQUARE_METER_UNIT})`
          : 'None',
    },

    { label: 'Site conditions', getter: (s) => s.siteConditionName },
    { label: 'Groundwater', getter: (s) => s.groundwaterConditionName },
    { label: 'Site access', getter: (s) => s.siteAccessibilityName },

    {
      label: 'Landscaping',
      getter: (s) =>
        s.landscapingArea > 0
          ? `${formatNumber(s.landscapingArea)} ${SQUARE_METER_UNIT}`
          : 'None',
    },

    {
      label: 'HVAC add-ons',
      getter: (s) =>
        s.hvacNames.length > 0
          ? s.hvacNames.join(', ')
          : 'Base only',
    },

    {
      label: 'Contractor overhead',
      getter: (s) => formatPercent(s.contractorPercent, 1),
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
    const values = scenarios.map((s) => getter(s));
    const isDifferent = new Set(values).size > 1;
    return { label, values, isDifferent, ...opts };
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

  rows.push(
    makeRow(
      'Project costs',
      (s) => s.permitDesignFee + s.contractorCost + s.contingencyCost + s.efkaInsuranceAmount,
      { isGroupHeader: true }
    )
  );
  rows.push(makeRow('Planning & fees', (s) => s.permitDesignFee));
  rows.push(makeRow('Contractor overhead', (s) => s.contractorCost));
  rows.push(makeRow('Construction contingency', (s) => s.contingencyCost));
  rows.push(makeRow('e-EFKA worker insurance', (s) => s.efkaInsuranceAmount));

  return rows;
}

interface CompareDriverItem {
  code: string;
  label: string;
  groupCode: string;
  values: number[];
  averageCost: number;
}

function getSpecificCompareDrivers(scenarios: ComputedScenarioCosts[]): CompareDriverItem[] {
  if (scenarios.length === 0) return [];

  const firstScenario = scenarios[0];
  const candidates: CompareDriverItem[] = [];

  for (const group of firstScenario.breakdownGroups) {
    for (const subgroup of group.subgroups) {
      const visibleChildren = subgroup.children?.filter((child) => child.visible && child.cost > 0) ?? [];

      if (visibleChildren.length > 0) {
        for (const child of visibleChildren) {
          const values = scenarios.map((scenario) => {
            const scenarioGroup = scenario.breakdownGroups.find((entry) => entry.code === group.code);
            const scenarioSubgroup = scenarioGroup?.subgroups.find((entry) => entry.code === subgroup.code);
            return scenarioSubgroup?.children?.find((entry) => entry.code === child.code)?.cost ?? 0;
          });

          candidates.push({
            code: child.code,
            label: getDin276Subgroup(child.code)?.label ?? child.code,
            groupCode: group.code,
            values,
            averageCost: values.reduce((sum, value) => sum + value, 0) / values.length,
          });
        }
      } else if (subgroup.visible && subgroup.cost > 0) {
        const values = scenarios.map((scenario) => {
          const scenarioGroup = scenario.breakdownGroups.find((entry) => entry.code === group.code);
          return scenarioGroup?.subgroups.find((entry) => entry.code === subgroup.code)?.cost ?? 0;
        });

        candidates.push({
          code: subgroup.code,
          label: getDin276Subgroup(subgroup.code)?.label ?? subgroup.code,
          groupCode: group.code,
          values,
          averageCost: values.reduce((sum, value) => sum + value, 0) / values.length,
        });
      }
    }
  }

  return candidates.filter((item) => item.averageCost > 0);
}

function getTopConstructionCostDrivers(scenarios: ComputedScenarioCosts[]): CompareDriverItem[] {
  return getSpecificCompareDrivers(scenarios)
    .filter((item) => item.groupCode !== '100' && item.groupCode !== '700')
    .sort((a, b) => b.averageCost - a.averageCost)
    .slice(0, 3);
}

function getLargestBuildCostDriverExcludingLand(scenarios: ComputedScenarioCosts[]): CompareDriverItem | null {
  return getSpecificCompareDrivers(scenarios)
    .filter((item) => item.groupCode !== '100' && item.groupCode !== '700')
    .sort((a, b) => b.averageCost - a.averageCost)[0] ?? null;
}

function getAverageLandShareOfTotal(scenarios: ComputedScenarioCosts[]): number {
  if (scenarios.length === 0) return 0;

  const averageLand = scenarios.reduce((sum, scenario) => sum + scenario.group100Total, 0) / scenarios.length;
  const averageTotal = scenarios.reduce((sum, scenario) => sum + scenario.finalTotal, 0) / scenarios.length;

  return averageTotal > 0 ? (averageLand / averageTotal) * 100 : 0;
}

function ProCostDriversCard({ items }: { items: CompareDriverItem[] }) {
  return (
    <View style={styles.costDriverCard}>
      <View style={styles.costDriverHeader}>
        <TrendingUp size={14} color={Colors.white} />
        <Text style={styles.costDriverTitle}>Top 3 Construction Cost Drivers</Text>
      </View>
      <View style={styles.costDriverList}>
        {items.map((item, index) => (
          <View key={item.code} style={[styles.costDriverListRow, index > 0 ? styles.costDriverListDivider : null]}>
            <Text style={styles.costDriverRank}>{index + 1}</Text>
            <Text style={styles.costDriverListLabel}>{item.label}</Text>
            <Text style={styles.costDriverListValue}>{formatEuro(item.averageCost)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function DeveloperCostDriverCard({
  item,
  landShare,
}: {
  item: CompareDriverItem;
  landShare: number;
}) {
  return (
    <View style={styles.costDriverCard}>
      <View style={styles.costDriverHeader}>
        <TrendingUp size={14} color={Colors.white} />
        <Text style={styles.costDriverTitle}>Largest Build Cost Driver (Excluding Land)</Text>
      </View>
      <View style={styles.costDriverBody}>
        <Text style={styles.costDriverLabel}>{item.label}</Text>
        <Text style={styles.costDriverValue}>{formatEuro(item.averageCost)}</Text>
      </View>
      <View style={styles.costDriverMetaRow}>
        <Text style={styles.costDriverMetaLabel}>Land Share of Total</Text>
        <Text style={styles.costDriverMetaValue}>{formatPercent(landShare, 1)}</Text>
      </View>
    </View>
  );
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
  const totalExVat = scenario.preVatTotal;
  const totalWithVat = scenario.finalTotal;
  const cheapestExVat = cheapestTotal;

  const diffFromCheapest = totalExVat - cheapestExVat;
  const diffPercent = cheapestExVat > 0 ? Math.round((diffFromCheapest / cheapestExVat) * 100) : 0;

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
          <Text style={summaryStyles.totalCost}>{formatEuro(totalExVat)}</Text>
        </View>
        <Text style={summaryStyles.subtotalLabel}>incl. VAT {formatEuro(totalWithVat)}</Text>

        {rank === 'cheapest' && (
          <Text style={summaryStyles.diffText}>baseline</Text>
        )}
        {rank !== 'cheapest' && diffFromCheapest > 0 && (
          <View style={summaryStyles.diffBlock}>
            <Text style={summaryStyles.diffText}>
              +{formatEuro(diffFromCheapest)} vs cheapest
            </Text>
            <Text style={summaryStyles.diffPercent}>{`(+${formatPercent(diffPercent)})`}</Text>
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
const maxCost = Math.max(...scenarios.map(s => s.preVatTotal));
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
        const totalExVat = s.preVatTotal;
        const pct = (totalExVat / maxCost) * 100;
        return (
          <View key={i} style={chartStyles.barRow}>
            <View style={chartStyles.barLabelWrap}>
              <View style={[chartStyles.barDot, { backgroundColor: COMPARE_COLORS[i] }]} />
              <Text style={chartStyles.barLabel} numberOfLines={1}>{s.name}</Text>
            </View>
            <View style={chartStyles.barTrack}>
              <View style={[chartStyles.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: COMPARE_COLORS[i] }]} />
            </View>
            <Text style={chartStyles.barValue}>{formatEuro(totalExVat)}</Text>
            <Text style={chartStyles.barSubvalue}>incl. VAT {formatEuro(s.finalTotal)}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function CompareScreen() {
  const { scenarios, getAllScenarioConfigs, switchScenario } = useEstimate();
  const { userMode } = useUserMode();
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
  const totalValues = useMemo(() => computed.map((s) => s.preVatTotal), [computed]);
  const minTotal = useMemo(() => totalValues.length > 0 ? Math.min(...totalValues) : 0, [totalValues]);
  const sortedByTotal = useMemo(
    () => [...computed].sort((a, b) => a.preVatTotal - b.preVatTotal),
    [computed]
  );
  const cheapestName = sortedByTotal.length > 0 ? sortedByTotal[0].name : '';
  const highestName = sortedByTotal.length > 0 ? sortedByTotal[sortedByTotal.length - 1].name : '';

  const changedParams = useMemo(() => paramRows.filter((r) => r.isDifferent), [paramRows]);
  const displayedParams = showAllParams ? paramRows : changedParams;

  const topConstructionDrivers = useMemo(() => getTopConstructionCostDrivers(computed), [computed]);
  const largestBuildCostDriver = useMemo(() => getLargestBuildCostDriverExcludingLand(computed), [computed]);
  const averageLandShare = useMemo(() => getAverageLandShareOfTotal(computed), [computed]);

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
        <Text style={styles.headerSubtext}>Comparing {computed.length} scenarios</Text>
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

      {userMode === 'pro' && topConstructionDrivers.length > 0 ? (
        <ProCostDriversCard items={topConstructionDrivers} />
      ) : null}

      {userMode === 'developer' && largestBuildCostDriver ? (
        <DeveloperCostDriverCard item={largestBuildCostDriver} landShare={averageLandShare} />
      ) : null}

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
              <Text style={styles.tableSubtotalLabel}>Total Project Cost (excl. VAT)</Text>
            </View>
            {computed.map((s, i) => (
              <View key={i} style={styles.tableValueCell}>
                <Text style={styles.tableSubtotalValue}>{formatEuro(s.preVatTotal)}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.tableRow, styles.tableVatRow]}>
            <View style={styles.tableLabelCellWide}>
              <Text style={styles.tableVatLabel}>VAT</Text>
            </View>
            {computed.map((s, i) => (
              <View key={i} style={styles.tableValueCell}>
                <Text style={styles.tableVatValue}>{formatEuro(s.vatAmount)}</Text>
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
                  {formatEuro(s.finalTotal)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  barSubvalue: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
    ...tabularFont,
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
  costDriverList: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  costDriverListRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    paddingVertical: 10,
  },
  costDriverListDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  costDriverRank: {
    width: 18,
    fontSize: 12,
    fontWeight: '800' as const,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center' as const,
    ...tabularFont,
  },
  costDriverListLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.heroText,
    lineHeight: 20,
  },
  costDriverListValue: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#FFD699',
    ...tabularFont,
  },
  costDriverMetaRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  costDriverMetaLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.74)',
  },
  costDriverMetaValue: {
    fontSize: 13,
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
  bottomSpacer: {
    height: 20,
  },
});
