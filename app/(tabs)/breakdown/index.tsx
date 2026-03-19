import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import ScenarioBar from '@/components/ScenarioBar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  Hammer,
  Building,
  Layers,
  Home,
  LayoutGrid,
  Paintbrush,
  Thermometer,
  Zap,
  Droplets,
  Shield,
  Wrench,
  Waves,
  Info,
  Flower2,
  PenTool,
  Plug,
  ShieldAlert,
  FileDown,
  ChevronDown,
  ChevronRight,
  Shovel,
  Cable,
  Fence,
  Bath,
  Sofa,
  FileText,
  ClipboardCheck,
  HardHat,
  LandPlot,
  Wind,
  Landmark,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useEstimate } from '@/contexts/EstimateContext';
import { useUserMode } from '@/contexts/UserModeContext';
import type { UserMode } from '@/contexts/UserModeContext';

import {
  DISCLAIMER_TEXT,
  CONSTRUCTION_SUBTOTAL_DISCLAIMER,
  getSizeCorrectionLabel,
} from '@/constants/construction';
import { getDin276Group, getDin276Subgroup } from '@/constants/din276Groups';
import type { ProjectBreakdownGroup, ProjectBreakdownSubgroup } from '@/calculator-engine/buildProjectCostBreakdown';
import { generateClientReportHtml } from '@/utils/generateClientReportHtml';
import type { ClientReportData } from '@/utils/generateClientReportHtml';
import { formatBasementSummary } from '@/utils/computeScenarioCosts';
import { formatCurrency, formatDecimal, formatNumber, formatPercent } from '@/utils/format';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SubgroupItem {
  code: string;
  name: string;
  cost: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  sublabel?: string;
  visible: boolean;
}

interface DinGroup {
  code: string;
  name: string;
  subtotal: number;
  percentOfTotal: number;
  subgroups: SubgroupItem[];
  accentColor: string;
}

const MULTIPLY_SYMBOL = '\u00D7';
const MIDDLE_DOT = '\u00B7';
const EN_DASH = '\u2013';
const SQUARE_METER_UNIT = 'm\u00B2';

const GROUP_ACCENT_COLORS: Record<string, string> = {
  '100': '#7A5C3E',
  '200': '#8B6914',
  '300': '#1B3A4B',
  '400': '#2D8B55',
  '500': '#6B8E23',
  '600': '#8B5CF6',
  '700': '#D4782F',
};

const SUBGROUP_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  '110': LandPlot,
  '120': Landmark,
  '210': Shovel,
  '220': Plug,
  '230': Cable,
  '240': ClipboardCheck,
  '250': HardHat,
  '310': Shovel,
  '320': Building,
  '330': Layers,
  '340': LayoutGrid,
  '350': Paintbrush,
  '360': Home,
  '370': Shield,
  '380': Wrench,
  '390': Hammer,
  '410': Droplets,
  '420': Thermometer,
  '430': Wind,
  '440': Zap,
  '450': Shield,
  '480': LayoutGrid,
  '510': LandPlot,
  '530': Hammer,
  '560': Fence,
  '570': Flower2,
  '580': Waves,
  '610': Sofa,
  '620': Bath,
  '710': PenTool,
  '720': FileText,
  '750': ClipboardCheck,
};

function getSubgroupSublabel(
  subgroup: ProjectBreakdownSubgroup,
  context: {
    siteConditionName: string;
    landscapingArea: number;
    poolArea: number;
    poolQualityName: string;
    poolTypeName: string;
    enabledHvacIds: Set<string>;
  },
): string | undefined {
  switch (subgroup.code) {
    case '120':
      return subgroup.meta?.mode === 'auto'
        ? `${formatCurrency(subgroup.cost)} (6 % of ${formatCurrency(Number(subgroup.meta?.landValue ?? 0))})`
        : 'Manual override';
    case '210':
      return `Basic plot preparation ${MIDDLE_DOT} ${context.siteConditionName}`;
    case '220':
      return 'Public network connections';
    case '230':
      return 'On-site pipes and cables';
    case '240':
    case '250':
      return 'Reserved for future logic';
    case '310':
      return 'Excavation and earthworks for building construction';
    case '320':
      return 'Foundations and substructure';
    case '330':
      return 'External walls, windows, exterior doors';
    case '340':
      return 'Internal walls and interior doors';
    case '350':
      return 'Slabs and horizontal structural elements';
    case '360':
      return 'Roof structure, tiles/membrane, waterproofing, gutters';
    case '370':
      return 'Integrated construction-related infrastructure installations';
    case '380':
      return 'Built-in construction elements';
    case '390':
      return 'Other building construction works';
    case '410':
      return 'Water supply, drainage, bathroom fittings';
    case '420':
      return context.enabledHvacIds.has('underfloor_heating') || context.enabledHvacIds.has('solar_thermal')
        ? 'Heat pump, underfloor heating, solar thermal'
        : 'Heat pump + fan-coils or VRV';
    case '430':
      return 'Ventilation, cooling, ducts, fan-coils';
    case '440':
      return context.enabledHvacIds.has('photovoltaic')
        ? 'Wiring, panels, lighting, PV-ready systems'
        : 'Wiring, panels, sockets, lighting';
    case '450':
      return 'Data cabling, networking, alarm, access control';
    case '480':
      return 'Building automation, controls, smart-home integration';
    case '510':
      return `Grading, retaining walls ${MIDDLE_DOT} ${context.siteConditionName}`;
    case '530':
      return 'Driveways, pathways, patios';
    case '560':
      return 'Irrigation, outdoor lighting, boundary elements';
    case '570':
      return `${formatNumber(context.landscapingArea)} ${SQUARE_METER_UNIT} landscape area`;
    case '580':
      return `Pool ${formatNumber(context.poolArea)} ${SQUARE_METER_UNIT} ${MIDDLE_DOT} ${context.poolQualityName} ${MIDDLE_DOT} ${context.poolTypeName}`;
    case '610':
      return 'General movable furniture';
    case '620':
      return Number(subgroup.meta?.bathroomWcFurnishingSliceCost ?? 0) > 0
        ? `Kitchen ${MIDDLE_DOT} wardrobes ${MIDDLE_DOT} bathroom/WC furnishing slices`
        : 'Kitchen, built-in wardrobes, fixed furniture';
    case '710':
      return 'Design, documentation, site supervision';
    case '720':
      return 'Structural, MEP engineering';
    case '750':
      return 'Building permit, surveys, compliance';
    default:
      return undefined;
  }
}

function CollapsibleGroup({ group }: { group: DinGroup }) {
  const [expanded, setExpanded] = useState<boolean>(true);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  const visibleSubgroups = group.subgroups.filter((s) => s.visible);

  return (
    <View style={styles.groupContainer}>
      <TouchableOpacity
        style={styles.groupHeader}
        onPress={toggle}
        activeOpacity={0.7}
        testID={`group-header-${group.code}`}
      >
        <View style={[styles.groupAccentBar, { backgroundColor: group.accentColor }]} />
        <View style={styles.groupHeaderContent}>
          <View style={styles.groupHeaderLeft}>
            <Text style={styles.groupCode}>{group.code}</Text>
            <Text style={styles.groupName}>{group.name}</Text>
          </View>
          <View style={styles.groupHeaderRight}>
            <View style={styles.groupCostColumn}>
              <Text style={styles.groupSubtotal}>{formatCurrency(group.subtotal)}</Text>
              <Text style={styles.groupPercent}>{formatPercent(group.percentOfTotal, 1)}</Text>
            </View>
            {expanded ? (
              <ChevronDown size={18} color={Colors.textTertiary} />
            ) : (
              <ChevronRight size={18} color={Colors.textTertiary} />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {expanded && visibleSubgroups.length > 0 && (
        <View style={styles.subgroupList}>
          {visibleSubgroups.map((item) => (
            <View key={item.code} style={styles.subgroupRow}>
              <View style={styles.subgroupIconWrap}>
                <item.icon size={15} color={group.accentColor} />
              </View>
              <View style={styles.subgroupInfo}>
                <View style={styles.subgroupNameRow}>
                  <Text style={styles.subgroupCode}>{item.code}</Text>
                  <Text style={styles.subgroupName}>{item.name}</Text>
                </View>
                {item.sublabel ? (
                  <Text style={styles.subgroupSublabel}>{item.sublabel}</Text>
                ) : null}
              </View>
              <Text style={styles.subgroupCost}>{formatCurrency(item.cost)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function getReportTitle(mode: UserMode | null): string {
  switch (mode) {
    case 'private':
      return 'Project Cost Overview';
    case 'professional':
      return 'Client Cost Report';
    case 'guided':
      return 'Guided Project Cost Report';
    default:
      return 'Project Cost Estimate';
  }
}

function GenerateReportButton() {
  const [generating, setGenerating] = useState<boolean>(false);
  const { userMode } = useUserMode();
  const {
    location,
    quality,
    buildingArea,
    mainArea,
    terraceArea,
    balconyArea,
    baseBuildingAreaBenchmarkContribution,
    coveredTerracesBenchmarkContribution,
    balconyAreaBenchmarkContribution,
    totalBenchmarkContributionBeforeGroupAllocation,
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
    basementArea,
    includePool,
    poolArea,
    poolDepth,
    poolQualityOption,
    poolTypeOption,
    siteCondition,
    groundwaterCondition,
    siteAccessibility,
    hvacCosts,
    kg200Total,
    kg300Total,
    kg400Total,
    kg500Total,
    kg600Cost,
    kg600SubgroupCosts,
    bathroomWcFurnishingSliceCost,
    basementBaseCost,
    permitDesignFee,
    contingencyCost,
    contractorCost,
    totalCost,
    constructionSubtotal,
    contingencyPercent,
    sizeCorrectionFactor,
  } = useEstimate();

  const handleGenerate = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const enabledHvacNames = hvacCosts
        .filter((h) => h.enabled)
        .map((h) => h.option.name);

      const reportData: ClientReportData = {
        location: location.name,
        buildingArea,
        mainArea,
        terraceArea,
        qualityName: quality.name,
        balconyArea,
        baseBuildingAreaBenchmarkContribution,
        coveredTerracesBenchmarkContribution,
        balconyAreaBenchmarkContribution,
        totalBenchmarkContributionBeforeGroupAllocation,
        basementArea,
        storageBasementArea,
        parkingBasementArea,
        habitableBasementArea,
        includePool,
        poolArea,
        poolDepth,
        poolQualityName: poolQualityOption.name,
        poolTypeName: poolTypeOption.name,
        siteConditionName: siteCondition.name,
        groundwaterConditionName: groundwaterCondition.name,
        siteAccessibilityName: siteAccessibility.name,
        hvacOptions: enabledHvacNames,
        kg200Total,
        kg300Cost: kg300Total,
        kg400Total,
        kg500Total,
        kg600Cost,
        basementBaseCost,
        permitDesignFee,
        contingencyCost,
        contractorCost,
        totalCost,
        constructionSubtotal,
        contingencyPercent,
        sizeCorrectionFactor,
      };

      const reportTitle = getReportTitle(userMode);
      const html = generateClientReportHtml(reportData, reportTitle);
      const sanitizedLocation = location.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `Project_Cost_Estimate_${sanitizedLocation}`;

      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({
          html,
          base64: false,
        });
        console.log('PDF generated at:', uri);
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: fileName,
            UTI: 'com.adobe.pdf',
          });
        } else {
          await Print.printAsync({ html });
        }
      }
    } catch (error) {
      console.log('PDF generation error:', error);
    } finally {
      setGenerating(false);
    }
  }, [
    generating, location, quality, buildingArea, mainArea, terraceArea, balconyArea, basementArea,
    storageBasementArea, parkingBasementArea, habitableBasementArea,
    includePool, poolArea, poolDepth, poolQualityOption, poolTypeOption,
    siteCondition, groundwaterCondition, siteAccessibility, hvacCosts, kg200Total, kg300Total, kg400Total, kg500Total,
    kg600Cost, baseBuildingAreaBenchmarkContribution, coveredTerracesBenchmarkContribution, balconyAreaBenchmarkContribution, totalBenchmarkContributionBeforeGroupAllocation, permitDesignFee, contingencyCost, contractorCost, totalCost,
    constructionSubtotal, basementBaseCost, contingencyPercent, sizeCorrectionFactor,
    userMode,
  ]);

  return (
    <TouchableOpacity
      style={styles.generateButton}
      onPress={handleGenerate}
      activeOpacity={0.8}
      disabled={generating}
      testID="generate-report-button"
    >
      <LinearGradient
        colors={['#D4782F', '#C06828']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.generateButtonGradient}
      >
        {generating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <FileDown size={18} color="#fff" />
        )}
        <Text style={styles.generateButtonText}>
          {generating ? 'Generating...' : 'Generate Client Report'}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function BreakdownScreen() {
  const {
    location,
    quality,
    siteCondition,
    groundwaterCondition,
    landscapingArea,
    terraceArea,
    balconyArea,
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
    basementArea,
    bathrooms,
    wcs,
    hvacCosts,
    mainArea,
    buildingArea,
    correctedCostPerSqm,
    basementBenchmarkRate,
    baseBuildingAreaBenchmarkContribution,
    coveredTerracesBenchmarkContribution,
    balconyAreaBenchmarkContribution,
    totalBenchmarkContributionBeforeGroupAllocation,
    basementBaseCost,
    breakdownGroups,
    contractorCost,
    contractorPercent,
    vatPercent,
    vatAmount,
    efkaInsuranceAmount,
    includePool,
    poolArea,
    poolDepth,
    poolQualityOption,
    poolTypeOption,
    permitDesignFee,
    projectTotalBeforeVat,
    totalCostInclVat,
    kg200Total,
    kg500Total,
    constructionSubtotal,
    contingencyPercent,
    contingencyCost,
    sizeCorrectionFactor,
  } = useEstimate();

  const sizeCorrectionLabel = getSizeCorrectionLabel(mainArea);
  const enabledHvac = hvacCosts.filter((h) => h.enabled);
  const basementSummary = formatBasementSummary(
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
  );
  const investmentTotal = projectTotalBeforeVat;
  const group100Total = breakdownGroups.find((group) => group.code === '100')?.subtotal ?? 0;
  const terraceBalconyBenchmarkContribution =
    coveredTerracesBenchmarkContribution + balconyAreaBenchmarkContribution;

  const dinGroups = useMemo<DinGroup[]>(() => {
    const enabledHvacIds = new Set(enabledHvac.map((item) => item.option.id));

    return breakdownGroups.map((group: ProjectBreakdownGroup) => ({
      code: group.code,
      name: getDin276Group(group.code)?.label ?? `KG ${group.code}`,
      subtotal: group.subtotal,
      percentOfTotal: group.percentOfTotal,
      accentColor: GROUP_ACCENT_COLORS[group.code] ?? Colors.accent,
      subgroups: group.subgroups.map((subgroup: ProjectBreakdownSubgroup) => ({
        code: subgroup.code,
        name: getDin276Subgroup(subgroup.code)?.label ?? subgroup.code,
        cost: subgroup.cost,
        icon: SUBGROUP_ICONS[subgroup.code] ?? Hammer,
        sublabel: getSubgroupSublabel(subgroup, {
          siteConditionName: siteCondition.name,
          landscapingArea,
          poolArea,
          poolQualityName: poolQualityOption.name,
          poolTypeName: poolTypeOption.name,
          enabledHvacIds,
        }),
        visible: subgroup.visible,
      })),
    }));
  }, [
    breakdownGroups,
    enabledHvac,
    landscapingArea,
    poolArea,
    poolQualityOption,
    poolTypeOption,
    siteCondition,
  ]);

  return (
    <View style={styles.outerContainer}>
      <ScenarioBar />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.assumptionsCard}>
        <Text style={styles.assumptionsTitle}>Assumptions</Text>
        <View style={styles.assumptionsGrid}>
          <View style={styles.assumptionItem}>
            <Text style={styles.assumptionLabel}>Quality</Text>
            <Text style={styles.assumptionValue}>{quality.name}</Text>
          </View>
          <View style={styles.assumptionItem}>
            <Text style={styles.assumptionLabel}>Location</Text>
            <Text style={styles.assumptionValue}>{location.name} (${MULTIPLY_SYMBOL}{formatDecimal(location.multiplier, 2)})</Text>
          </View>
          <View style={styles.assumptionItem}>
            <Text style={styles.assumptionLabel}>Site Conditions</Text>
            <Text style={styles.assumptionValue}>{siteCondition.name}</Text>
          </View>
          <View style={styles.assumptionItem}>
            <Text style={styles.assumptionLabel}>Groundwater</Text>
            <Text style={styles.assumptionValue}>{groundwaterCondition.name}</Text>
          </View>
          {basementArea > 0 && (
            <View style={styles.assumptionItem}>
              <Text style={styles.assumptionLabel}>Basement</Text>
              <Text style={styles.assumptionValue}>{basementSummary}</Text>
            </View>
          )}
          {terraceArea > 0 && (
            <View style={styles.assumptionItem}>
              <Text style={styles.assumptionLabel}>Covered Terraces</Text>
              <Text style={styles.assumptionValue}>{`${formatNumber(terraceArea)} ${SQUARE_METER_UNIT} (${formatPercent(50)}) ${MIDDLE_DOT} ${formatCurrency(coveredTerracesBenchmarkContribution)} benchmark contribution`}</Text>
            </View>
          )}
          {balconyArea > 0 && (
            <View style={styles.assumptionItem}>
              <Text style={styles.assumptionLabel}>Balcony Area</Text>
              <Text style={styles.assumptionValue}>{`${formatNumber(balconyArea)} ${SQUARE_METER_UNIT} (${formatPercent(30)}) ${MIDDLE_DOT} ${formatCurrency(balconyAreaBenchmarkContribution)} benchmark contribution`}</Text>
            </View>
          )}
          {landscapingArea > 0 && (
            <View style={styles.assumptionItem}>
              <Text style={styles.assumptionLabel}>Landscaping Area</Text>
              <Text style={styles.assumptionValue}>{formatNumber(landscapingArea)} {SQUARE_METER_UNIT}</Text>
            </View>
          )}
          <View style={styles.assumptionItem}>
            <Text style={styles.assumptionLabel}>Bathrooms</Text>
            <Text style={styles.assumptionValue}>{bathrooms}</Text>
          </View>
          <View style={styles.assumptionItem}>
            <Text style={styles.assumptionLabel}>WCs</Text>
            <Text style={styles.assumptionValue}>{wcs}</Text>
          </View>
          {enabledHvac.map((h) => (
            <View key={h.option.id} style={styles.assumptionItem}>
              <Text style={styles.assumptionLabel}>{h.option.name}</Text>
              <Text style={styles.assumptionValue}>{formatCurrency(h.cost)}</Text>
            </View>
          ))}
          {includePool && (
            <View style={styles.assumptionItem}>
              <Text style={styles.assumptionLabel}>Swimming Pool</Text>
              <Text style={styles.assumptionValue}>{formatNumber(poolArea)} {SQUARE_METER_UNIT} {MIDDLE_DOT} {formatDecimal(poolDepth, 2)} m {MIDDLE_DOT} {poolQualityOption.name} {MIDDLE_DOT} {poolTypeOption.name}</Text>
            </View>
          )}
          <View style={styles.assumptionItem}>
            <Text style={styles.assumptionLabel}>Building Area</Text>
            <Text style={styles.assumptionValue}>{formatNumber(buildingArea)} {SQUARE_METER_UNIT}</Text>
          </View>
          <View style={styles.assumptionItem}>
            <Text style={styles.assumptionLabel}>{`Corrected €/${SQUARE_METER_UNIT}`}</Text>
            <Text style={styles.assumptionValue}>{`${formatCurrency(basementBenchmarkRate)}/${SQUARE_METER_UNIT}`}</Text>
          </View>
          {sizeCorrectionFactor !== 1.0 && (
            <View style={styles.assumptionItem}>
              <Text style={styles.assumptionLabel}>Size Adjustment</Text>
              <Text style={styles.assumptionValue}>{sizeCorrectionLabel}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.dinSectionTitle}>
        <Text style={styles.dinSectionTitleText}>DIN 276 Cost Breakdown</Text>
        <Text style={styles.dinBadge}>DIN 276</Text>
      </View>

      {dinGroups.map((group) => (
        <CollapsibleGroup key={group.code} group={group} />
      ))}

      {terraceBalconyBenchmarkContribution > 0 && (
        <View style={styles.basementCard}>
          <View style={styles.basementHeaderRow}>
            <Text style={styles.basementTitle}>Benchmark Contributions</Text>
            <Text style={styles.basementTotal}>{formatCurrency(terraceBalconyBenchmarkContribution)}</Text>
          </View>
          <Text style={styles.basementRate}>
            {`Benchmark rate source: ${formatCurrency(correctedCostPerSqm)}/${SQUARE_METER_UNIT}`}
          </Text>
          <View style={styles.basementRow}>
            <Text style={styles.basementLabel}>Base Building Area Benchmark Contribution</Text>
            <Text style={styles.basementValue}>{formatCurrency(baseBuildingAreaBenchmarkContribution)}</Text>
          </View>
          {coveredTerracesBenchmarkContribution > 0 && (
            <View style={styles.basementRow}>
              <Text style={styles.basementLabel}>
                {`Covered Terraces ${MIDDLE_DOT} ${formatNumber(terraceArea)} ${SQUARE_METER_UNIT} ${MIDDLE_DOT} 50%`}
              </Text>
              <Text style={styles.basementValue}>{formatCurrency(coveredTerracesBenchmarkContribution)}</Text>
            </View>
          )}
          {balconyAreaBenchmarkContribution > 0 && (
            <View style={styles.basementRow}>
              <Text style={styles.basementLabel}>
                {`Balcony Area ${MIDDLE_DOT} ${formatNumber(balconyArea)} ${SQUARE_METER_UNIT} ${MIDDLE_DOT} 30%`}
              </Text>
              <Text style={styles.basementValue}>{formatCurrency(balconyAreaBenchmarkContribution)}</Text>
            </View>
          )}
          <View style={styles.basementRow}>
            <Text style={styles.basementLabel}>Total Benchmark Contribution Before Group Allocation</Text>
            <Text style={styles.basementValue}>{formatCurrency(totalBenchmarkContributionBeforeGroupAllocation)}</Text>
          </View>
        </View>
      )}

      <View style={styles.constructionSubtotalCard}>
        <Text style={styles.constructionSubtotalLabel}>{`Construction Subtotal (KG 300${EN_DASH}600)`}</Text>
        <Text style={styles.constructionSubtotalValue}>{formatCurrency(constructionSubtotal)}</Text>
      </View>
      <View style={styles.disclaimerInline}>
        <Info size={12} color={Colors.textTertiary} />
        <Text style={styles.disclaimerInlineText}>{CONSTRUCTION_SUBTOTAL_DISCLAIMER}</Text>
      </View>

      <View style={styles.overheadSection}>
        <Text style={styles.overheadTitle}>Risk & Overhead</Text>
        <View style={styles.overheadCard}>
          <View style={styles.overheadRow}>
            <View style={styles.overheadIconWrap}>
              <ShieldAlert size={15} color={Colors.warning} />
            </View>
            <View style={styles.overheadInfo}>
              <Text style={styles.overheadLabel}>Construction Contingency</Text>
              <Text style={styles.overheadSub}>
                {`${formatPercent(Math.round(contingencyPercent * 100))} risk reserve ${MIDDLE_DOT} ${quality.name} quality`}
              </Text>
            </View>
            <Text style={styles.overheadValue}>{formatCurrency(contingencyCost)}</Text>
          </View>
          <View style={styles.overheadDivider} />
          <View style={styles.overheadRow}>
            <View style={styles.overheadIconWrap}>
              <Wrench size={15} color={Colors.primaryLight} />
            </View>
            <View style={styles.overheadInfo}>
              <Text style={styles.overheadLabel}>Contractor Overhead & Profit</Text>
              <Text style={styles.overheadSub}>{formatPercent(contractorPercent, 1)} of construction subtotal</Text>
            </View>
            <Text style={styles.overheadValue}>{formatCurrency(contractorCost)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.grandTotalCard}>
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Total Project Cost</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(investmentTotal)}</Text>
        </View>
        <View style={styles.grandTotalBreakdown}>
          <Text style={styles.grandTotalBreakdownText}>
            {`KG 100 ${formatCurrency(group100Total)} + KG 200 ${formatCurrency(kg200Total)} + KG 300${EN_DASH}600 ${formatCurrency(constructionSubtotal)} + Basement ${formatCurrency(basementBaseCost)} + KG 500 ${formatCurrency(kg500Total)} + KG 700 ${formatCurrency(permitDesignFee)} + e-EFKA ${formatCurrency(efkaInsuranceAmount)} + Contingency ${formatCurrency(contingencyCost)} + Overhead ${formatCurrency(contractorCost)}`}
          </Text>
        </View>
      </View>

      <View style={styles.vatCard}>
        <View style={styles.vatRow}>
          <Text style={styles.vatLabel}>{`+ VAT (${formatPercent(vatPercent, vatPercent % 1 === 0 ? 0 : 1)})`}</Text>
          <Text style={styles.vatValue}>{formatCurrency(vatAmount)}</Text>
        </View>
        <View style={styles.vatDivider} />
        <View style={styles.vatRow}>
          <Text style={styles.vatTotalLabel}>Total incl. VAT</Text>
          <Text style={styles.vatTotalValue}>{formatCurrency(totalCostInclVat)}</Text>
        </View>
        <Text style={styles.vatNote}>{`VAT calculated from the current pre-VAT project total using the selected ${formatPercent(vatPercent, vatPercent % 1 === 0 ? 0 : 1)} rate.`}</Text>
      </View>

      <View style={styles.disclaimer}>
        <Info size={14} color={Colors.textTertiary} style={styles.disclaimerIcon} />
        <Text style={styles.disclaimerText}>{DISCLAIMER_TEXT}</Text>
      </View>

      <GenerateReportButton />

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
  assumptionsCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  assumptionsTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    marginBottom: 10,
  },
  assumptionsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  assumptionItem: {
    backgroundColor: Colors.inputBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  assumptionLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600' as const,
  },
  assumptionValue: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700' as const,
    marginTop: 1,
  },
  dinSectionTitle: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  dinSectionTitleText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  dinBadge: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.accent,
    backgroundColor: Colors.accentBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden' as const,
  },
  groupContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: Colors.card,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden' as const,
  },
  groupHeader: {
    flexDirection: 'row' as const,
    alignItems: 'stretch' as const,
  },
  groupAccentBar: {
    width: 4,
  },
  groupHeaderContent: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  groupHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  groupCode: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 2,
  },
  groupHeaderRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  groupCostColumn: {
    alignItems: 'flex-end' as const,
  },
  groupSubtotal: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.primary,
    fontVariant: ['tabular-nums'] as any,
  },
  groupPercent: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  subgroupList: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 4,
  },
  subgroupRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 9,
  },
  subgroupIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: Colors.inputBg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 10,
  },
  subgroupInfo: {
    flex: 1,
    marginRight: 8,
  },
  subgroupNameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  subgroupCode: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textTertiary,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: 'hidden' as const,
  },
  subgroupName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    flexShrink: 1,
  },
  subgroupSublabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
    lineHeight: 15,
  },
  subgroupCost: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
    fontVariant: ['tabular-nums'] as any,
  },
  constructionSubtotalCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
    gap: 4,
  },
  constructionSubtotalLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
    flexShrink: 1,
  },
  constructionSubtotalValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.heroText,
  },
  basementCard: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  basementHeaderRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  basementTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  basementTotal: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.primary,
    fontVariant: ['tabular-nums'] as any,
  },
  basementRate: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
    marginBottom: 8,
  },
  basementRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    gap: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  basementLabel: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  basementValue: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
    fontVariant: ['tabular-nums'] as any,
  },
  disclaimerInline: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    paddingHorizontal: 20,
    marginTop: 8,
    gap: 6,
  },
  disclaimerInlineText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textTertiary,
    lineHeight: 16,
  },
  overheadSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  overheadTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  overheadCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  overheadRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  overheadIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.inputBg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  overheadInfo: {
    flex: 1,
    minWidth: 100,
  },
  overheadLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  overheadSub: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  overheadValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary,
    fontVariant: ['tabular-nums'] as any,
  },
  overheadDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  grandTotalCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  grandTotalRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
    gap: 4,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.primary,
    flexShrink: 1,
  },
  grandTotalValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.primary,
    fontVariant: ['tabular-nums'] as any,
  },
  grandTotalBreakdown: {
    marginTop: 8,
  },
  grandTotalBreakdownText: {
    fontSize: 11,
    color: Colors.textTertiary,
    lineHeight: 16,
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
  bottomSpacer: {
    height: 20,
  },
  generateButton: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 14,
    overflow: 'hidden' as const,
  },
  generateButtonGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  generateButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  vatCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  vatRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
    gap: 4,
  },
  vatLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  vatValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'] as any,
  },
  vatDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  vatTotalLabel: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  vatTotalValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.primary,
    fontVariant: ['tabular-nums'] as any,
  },
  vatNote: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 8,
    lineHeight: 15,
  },
});
