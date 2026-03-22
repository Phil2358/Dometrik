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
import { USER_MODE_CONFIGS } from '@/constants/userModes';

import {
  DISCLAIMER_TEXT,
  CONSTRUCTION_SUBTOTAL_DISCLAIMER,
  formatSizeCorrectionFactorLabel,
} from '@/constants/construction';
import { DIN276_GROUPS, getDin276Group, getDin276Subgroup } from '@/constants/din276Groups';
import type { Din276Node } from '@/constants/din276Groups';
import type { ProjectBreakdownGroup, ProjectBreakdownSubgroup } from '@/calculator-engine/buildProjectCostBreakdown';
import { generateClientReportHtml } from '@/utils/generateClientReportHtml';
import type { ClientReportData } from '@/utils/generateClientReportHtml';
import { formatBasementSummary } from '@/utils/computeScenarioCosts';
import { getDisplayedTotalsForMode } from '@/utils/displayTotals';
import { formatCurrency, formatDecimal, formatNumber, formatPercent } from '@/utils/format';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SubgroupItem {
  code: string;
  name: string;
  description?: string;
  cost: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  sublabel?: string;
  visible: boolean;
  level: number;
  parentCode?: string;
  isExpandable: boolean;
  children?: SubgroupItem[];
}

interface DinGroup {
  code: string;
  name: string;
  subtotal: number;
  percentOfTotal: number;
  subgroups: SubgroupItem[];
}

interface PrivateBreakdownChildItem {
  id: string;
  label: string;
  cost: number;
}

interface PrivateBreakdownItem {
  id: string;
  label: string;
  totalCost: number;
  sourceCodes: string[];
}

interface ProBreakdownDinChildItem {
  id: string;
  label: string;
  code: string;
  cost: number;
}

interface ProBreakdownChildItem {
  id: string;
  label: string;
  code?: string;
  cost: number;
  sourceCodes: string[];
  dinChildren: ProBreakdownDinChildItem[];
  isExpandable: boolean;
}

interface ProBreakdownItem {
  id: string;
  label: string;
  totalCost: number;
  sourceCodes: string[];
  children: ProBreakdownChildItem[];
  isExpandable: boolean;
}

type DeveloperInvestmentTag = 'entry-cost' | 'core' | 'value-add' | 'soft-cost' | 'risk-sensitive-core';
type DeveloperVisibilityTag = 'hidden' | 'partly-visible' | 'visible' | 'highly-visible';
type DeveloperRiskTag = 'low' | 'medium' | 'high';

interface DeveloperSummaryMetrics {
  hardCostTotal: number;
  softCostTotal: number;
  riskSensitiveShare: number;
  visibleShare: number;
  valueAddShare: number;
}

interface DeveloperBreakdownItem extends ProBreakdownItem {
  investmentTag: DeveloperInvestmentTag;
  visibilityTag: DeveloperVisibilityTag;
  riskTag: DeveloperRiskTag;
}

const MULTIPLY_SYMBOL = '\u00D7';
const MIDDLE_DOT = '\u00B7';
const EN_DASH = '\u2013';
const SQUARE_METER_UNIT = 'm\u00B2';

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
  '548': Waves,
  '550': Wrench,
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
  const baseBeforeRoomCountAddons = Number(subgroup.meta?.baseBeforeRoomCountAddons);
  const bathroomRoomCountAddonCost = Number(subgroup.meta?.bathroomRoomCountAddonCost ?? 0);
  const wcRoomCountAddonCost = Number(subgroup.meta?.wcRoomCountAddonCost ?? 0);
  const roomCountAddonCost = Number(subgroup.meta?.roomCountAddonCost ?? 0);
  const roomCountAddonTrace =
    Number.isFinite(baseBeforeRoomCountAddons) && roomCountAddonCost !== 0
      ? [
        `Base before room-count add-ons ${formatCurrency(baseBeforeRoomCountAddons)}`,
        bathroomRoomCountAddonCost !== 0
          ? `bathroom add-ons ${formatCurrency(bathroomRoomCountAddonCost)}`
          : null,
        wcRoomCountAddonCost !== 0
          ? `WC add-ons ${formatCurrency(wcRoomCountAddonCost)}`
          : null,
      ].filter(Boolean).join(` ${MIDDLE_DOT} `)
      : undefined;

  switch (subgroup.code) {
    case '120':
      return subgroup.meta?.mode === 'auto'
        ? `${formatCurrency(subgroup.cost)} (${formatPercent(Number(subgroup.meta?.ratePercent ?? 0))} of ${formatCurrency(Number(subgroup.meta?.landValue ?? 0))})`
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
      return roomCountAddonTrace
        ? `Internal walls and interior doors ${MIDDLE_DOT} ${roomCountAddonTrace}`
        : 'Internal walls and interior doors';
    case '350':
      return roomCountAddonTrace
        ? `Slabs and horizontal structural elements ${MIDDLE_DOT} ${roomCountAddonTrace}`
        : 'Slabs and horizontal structural elements';
    case '360':
      return 'Roof structure, tiles/membrane, waterproofing, gutters';
    case '370':
      return 'Integrated construction-related infrastructure installations';
    case '380':
      return 'Built-in construction elements';
    case '390':
      return 'Other building construction works';
    case '410':
      return roomCountAddonTrace
        ? `Water supply, drainage, bathroom fittings ${MIDDLE_DOT} ${roomCountAddonTrace}`
        : 'Water supply, drainage, bathroom fittings';
    case '420':
      return roomCountAddonTrace
        ? `${context.enabledHvacIds.has('underfloor_heating') || context.enabledHvacIds.has('solar_thermal')
          ? 'Heat pump, underfloor heating, solar thermal'
          : 'Heat pump + fan-coils or VRV'} ${MIDDLE_DOT} ${roomCountAddonTrace}`
        : context.enabledHvacIds.has('underfloor_heating') || context.enabledHvacIds.has('solar_thermal')
          ? 'Heat pump, underfloor heating, solar thermal'
          : 'Heat pump + fan-coils or VRV';
    case '430':
      return roomCountAddonTrace
        ? `Ventilation, cooling, ducts, fan-coils ${MIDDLE_DOT} ${roomCountAddonTrace}`
        : 'Ventilation, cooling, ducts, fan-coils';
    case '440':
      return roomCountAddonTrace
        ? `${context.enabledHvacIds.has('photovoltaic')
          ? 'Wiring, panels, lighting, PV-ready systems'
          : 'Wiring, panels, sockets, lighting'} ${MIDDLE_DOT} ${roomCountAddonTrace}`
        : context.enabledHvacIds.has('photovoltaic')
          ? 'Wiring, panels, lighting, PV-ready systems'
          : 'Wiring, panels, sockets, lighting';
    case '450':
      return [
        'Data cabling, networking, alarm, access control',
        `450 baseline ${formatCurrency(Number(subgroup.meta?.kg450BaselineEssentialCost ?? 0))}`,
        `450 upgrade ${formatCurrency(Number(subgroup.meta?.kg450UpgradeCost ?? 0))}`,
      ].join(` ${MIDDLE_DOT} `);
    case '480':
      return 'Building automation, controls, smart-home integration';
    case '510':
      return `Grading, retaining walls ${MIDDLE_DOT} ${context.siteConditionName}`;
    case '530':
      return 'Driveways, pathways, patios';
    case '548':
      return `Pool basin, vessel waterproofing, internal finish, coping ${MIDDLE_DOT} ${context.poolTypeName}`;
    case '550':
      return `Pool filtration, pumps, hydraulics, treatment, controls ${MIDDLE_DOT} ${context.poolQualityName}`;
    case '560':
      return 'Irrigation, outdoor lighting, boundary elements';
    case '570':
      return `${formatNumber(context.landscapingArea)} ${SQUARE_METER_UNIT} landscape area`;
    case '580':
      return `Pool ${formatNumber(context.poolArea)} ${SQUARE_METER_UNIT} ${MIDDLE_DOT} ${context.poolQualityName} ${MIDDLE_DOT} ${context.poolTypeName}`;
    case '610':
      return `Bedroom packages ${MIDDLE_DOT} area-based furniture allowance ${MIDDLE_DOT} kitchen furniture packages`;
    case '620':
      return [
        Number(subgroup.meta?.bathroomWcFurnishingSliceCost ?? 0) !== 0
          ? `Kitchen ${MIDDLE_DOT} built-in wardrobes ${MIDDLE_DOT} bathroom/WC furnishing slices`
          : 'Kitchen, built-in wardrobes, fixed furniture',
        `wardrobe baseline ${formatCurrency(Number(subgroup.meta?.kg620BaselineWardrobeCost ?? 0))}`,
        `wardrobe delta ${formatCurrency(Number(subgroup.meta?.kg620WardrobeDeltaCost ?? 0))}`,
      ].join(` ${MIDDLE_DOT} `);
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

function CollapsibleGroup({ group, defaultClosed = false }: { group: DinGroup; defaultClosed?: boolean }) {
  const [expanded, setExpanded] = useState<boolean>(!defaultClosed);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  const visibleSubgroups = group.subgroups.filter((s) => s.visible);

  const toggleRow = useCallback((code: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedRows((prev) => ({ ...prev, [code]: !prev[code] }));
  }, []);

  return (
    <View style={styles.groupContainer}>
      <TouchableOpacity
        style={styles.groupHeader}
        onPress={toggle}
        activeOpacity={0.7}
        testID={`group-header-${group.code}`}
      >
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
            <BreakdownTreeRow
              key={item.code}
              item={item}
              expandedRows={expandedRows}
              onToggle={toggleRow}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function BreakdownTreeRow({
  item,
  expandedRows,
  onToggle,
}: {
  item: SubgroupItem;
  expandedRows: Record<string, boolean>;
  onToggle: (code: string) => void;
}) {
  const visibleChildren = item.children?.filter((child) => child.visible) ?? [];
  const isExpanded = item.level === 2 ? expandedRows[item.code] ?? false : false;
  const canExpand = item.isExpandable && visibleChildren.length > 0;
  const handleToggle = useCallback(() => {
    if (!canExpand) return;
    onToggle(item.code);
  }, [canExpand, item.code, onToggle]);

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.subgroupRow,
          item.level === 3 ? styles.subgroupRowLevel3 : null,
        ]}
        onPress={handleToggle}
        activeOpacity={canExpand ? 0.7 : 1}
        disabled={!canExpand}
        testID={`subgroup-row-${item.code}`}
      >
        <View style={[styles.subgroupLeading, item.level === 3 ? styles.subgroupLeadingLevel3 : null]}>
          {canExpand ? (
            <View style={styles.subgroupChevronWrap}>
              {isExpanded ? (
                <ChevronDown size={16} color={Colors.textTertiary} />
              ) : (
                <ChevronRight size={16} color={Colors.textTertiary} />
              )}
            </View>
          ) : (
            <View style={styles.subgroupChevronPlaceholder} />
          )}
          <View
            style={[
              styles.subgroupIconWrap,
              item.level === 3 ? styles.subgroupIconWrapLevel3 : null,
            ]}
          >
            <item.icon size={item.level === 3 ? 14 : 15} color={Colors.textTertiary} />
          </View>
        </View>
        <View style={styles.subgroupInfo}>
          <View style={styles.subgroupNameRow}>
            <Text style={[styles.subgroupCode, item.level === 3 ? styles.subgroupCodeLevel3 : null]}>{item.code}</Text>
            <Text style={[styles.subgroupName, item.level === 3 ? styles.subgroupNameLevel3 : null]}>{item.name}</Text>
          </View>
          {item.sublabel ? (
            <Text style={styles.subgroupSublabel}>{item.sublabel}</Text>
          ) : item.description && item.level === 3 ? (
            <Text style={styles.subgroupSublabel}>{item.description}</Text>
          ) : null}
        </View>
        <Text style={styles.subgroupCost}>{formatCurrency(item.cost)}</Text>
      </TouchableOpacity>

      {canExpand && isExpanded ? (
        <View style={styles.subgroupChildren}>
          {visibleChildren.map((child) => (
            <BreakdownTreeRow
              key={child.code}
              item={child}
              expandedRows={expandedRows}
              onToggle={onToggle}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function PrivateBreakdownCategory({
  item,
}: {
  item: PrivateBreakdownItem;
}) {
  return (
    <View style={styles.privateCategoryContainer}>
      <View
        style={styles.privateCategoryHeader}
        testID={`private-category-${item.id}`}
      >
        <View style={styles.privateCategoryInfo}>
          <Text style={styles.privateCategoryTitle}>{item.label}</Text>
        </View>
        <Text style={styles.privateCategoryCost}>{formatCurrency(item.totalCost)}</Text>
      </View>
    </View>
  );
}

function mapBreakdownSubgroup(
  subgroup: ProjectBreakdownSubgroup,
  hierarchyNode: Din276Node | undefined,
  context: {
    siteConditionName: string;
    landscapingArea: number;
    poolArea: number;
    poolQualityName: string;
    poolTypeName: string;
    enabledHvacIds: Set<string>;
  },
  options: {
  level: number;
  parentCode?: string;
}): SubgroupItem {
  const visibleChildren =
    subgroup.children
      ?.map((child) => mapBreakdownSubgroup(child, hierarchyNode?.children?.find((node) => node.code === child.code), context, {
        level: options.level + 1,
        parentCode: subgroup.code,
      }))
      .filter((child) => child.visible) ?? [];

  return {
    code: subgroup.code,
    name: hierarchyNode?.label ?? getDin276Subgroup(subgroup.code)?.label ?? subgroup.code,
    description: hierarchyNode?.description ?? getDin276Subgroup(subgroup.code)?.description,
    cost: subgroup.cost,
    icon: SUBGROUP_ICONS[subgroup.code] ?? Hammer,
    sublabel: getSubgroupSublabel(subgroup, context),
    visible: subgroup.visible || visibleChildren.length > 0,
    level: options.level,
    parentCode: options.parentCode,
    isExpandable: visibleChildren.length > 0,
    children: visibleChildren,
  };
}

function buildGroupSubgroupTree(
  groupCode: string,
  subgroups: ProjectBreakdownSubgroup[],
  context: {
    siteConditionName: string;
    landscapingArea: number;
    poolArea: number;
    poolQualityName: string;
    poolTypeName: string;
    enabledHvacIds: Set<string>;
  },
): SubgroupItem[] {
  const hierarchyGroup = DIN276_GROUPS.find((group) => group.code === groupCode);
  const subgroupMap = new Map(subgroups.map((subgroup) => [subgroup.code, subgroup]));
  const orderedCodes = hierarchyGroup?.children?.map((node) => node.code) ?? subgroups.map((subgroup) => subgroup.code);
  const fallbackSubgroups = subgroups.filter((subgroup) => !orderedCodes.includes(subgroup.code));

  return [...orderedCodes.map((code) => subgroupMap.get(code)).filter(Boolean), ...fallbackSubgroups]
    .map((subgroup) => mapBreakdownSubgroup(
      subgroup as ProjectBreakdownSubgroup,
      hierarchyGroup?.children?.find((node) => node.code === subgroup?.code),
      context,
      {
        level: 2,
      },
    ))
    .filter((subgroup) => subgroup.visible);
}

function getBreakdownMaps(breakdownGroups: ProjectBreakdownGroup[]) {
  const groupMap = new Map(breakdownGroups.map((group) => [group.code, group]));
  const subgroupMap = new Map<string, ProjectBreakdownSubgroup>();

  const registerSubgroup = (subgroup: ProjectBreakdownSubgroup) => {
    subgroupMap.set(subgroup.code, subgroup);
    subgroup.children?.forEach(registerSubgroup);
  };

  for (const group of breakdownGroups) {
    for (const subgroup of group.subgroups) {
      registerSubgroup(subgroup);
    }
  }

  return { groupMap, subgroupMap };
}

function mapBreakdownForPrivateUser(breakdownGroups: ProjectBreakdownGroup[]): PrivateBreakdownItem[] {
  const { groupMap, subgroupMap } = getBreakdownMaps(breakdownGroups);

  const getCostByCode = (code: string): number => {
    const group = groupMap.get(code);
    if (group) return group.subtotal;
    return subgroupMap.get(code)?.cost ?? 0;
  };

  const allocateByShare = (code: string, share: number): number => Math.round(getCostByCode(code) * share);

  const privateItems: Array<PrivateBreakdownChildItem & { sourceCodes: string[] }> = [
    {
      id: 'site-preparation-utility-connections',
      label: 'Site Preparation & Utility Connections',
      cost: getCostByCode('200'),
      sourceCodes: ['200'],
    },
    {
      id: 'groundworks-excavation',
      label: 'Groundworks & Excavation',
      cost: getCostByCode('310') + getCostByCode('510'),
      sourceCodes: ['310', '510'],
    },
    {
      id: 'concrete-structure',
      label: 'Concrete Structure',
      cost:
        getCostByCode('320')
        + getCostByCode('331')
        + getCostByCode('333')
        + getCostByCode('341')
        + getCostByCode('343')
        + getCostByCode('351')
        + getCostByCode('361')
        + getCostByCode('548'),
      sourceCodes: ['320', '331', '333', '341', '343', '351', '361', '548'],
    },
    {
      id: 'masonry-walls',
      label: 'Masonry Walls',
      cost: getCostByCode('332') + getCostByCode('342'),
      sourceCodes: ['332', '342'],
    },
    {
      id: 'windows-glazing',
      label: 'Windows, Exterior Doors & Glazing',
      cost: allocateByShare('334', 0.95),
      sourceCodes: ['334'],
    },
    {
      id: 'marble-sills',
      label: 'Marble Sills',
      cost: getCostByCode('334') - allocateByShare('334', 0.95),
      sourceCodes: ['334'],
    },
    {
      id: 'roof-covering',
      label: 'Roof Covering',
      cost: getCostByCode('363'),
      sourceCodes: ['363'],
    },
    {
      id: 'wall-thermal-insulation',
      label: 'Thermal Insulation',
      cost: allocateByShare('335', 0.55),
      sourceCodes: ['335'],
    },
    {
      id: 'wall-ceiling-finishes',
      label: 'Wall & Ceiling Finishes',
      cost:
        allocateByShare('335', 0.30)
        + allocateByShare('336', 0.70)
        + allocateByShare('345', 0.65)
        + allocateByShare('354', 0.75),
      sourceCodes: ['335', '336', '345', '354'],
    },
    {
      id: 'paintwork',
      label: 'Paintwork',
      cost:
        getCostByCode('335') - allocateByShare('335', 0.55) - allocateByShare('335', 0.30)
        + (getCostByCode('336') - allocateByShare('336', 0.70))
        + (getCostByCode('345') - allocateByShare('345', 0.65))
        + (getCostByCode('354') - allocateByShare('354', 0.75)),
      sourceCodes: ['335', '336', '345', '354'],
    },
    {
      id: 'interior-doors',
      label: 'Interior Doors',
      cost: getCostByCode('344'),
      sourceCodes: ['344'],
    },
    {
      id: 'floor-finishes',
      label: 'Floor Finishes',
      cost: getCostByCode('353'),
      sourceCodes: ['353'],
    },
    {
      id: 'plumbing-sanitary',
      label: 'Plumbing & Sanitary Systems',
      cost: getCostByCode('411') + getCostByCode('412'),
      sourceCodes: ['411', '412'],
    },
    {
      id: 'heating-cooling',
      label: 'Heating & Cooling Systems',
      cost: getCostByCode('421') + getCostByCode('422') + getCostByCode('423') + getCostByCode('433'),
      sourceCodes: ['421', '422', '423', '433'],
    },
    {
      id: 'electrical-installations',
      label: 'Electrical Installations',
      cost: getCostByCode('442') + getCostByCode('444'),
      sourceCodes: ['442', '444'],
    },
    {
      id: 'security-automation',
      label: 'Security and Automation (Smart Home)',
      cost:
        getCostByCode('451')
        + getCostByCode('455')
        + getCostByCode('456')
        + getCostByCode('457')
        + getCostByCode('481')
        + getCostByCode('482')
        + getCostByCode('483')
        + getCostByCode('484')
        + getCostByCode('485'),
      sourceCodes: ['451', '455', '456', '457', '481', '482', '483', '484', '485'],
    },
    {
      id: 'built-in-furniture-kitchen',
      label: 'Built-in Furniture & Kitchen',
      cost: getCostByCode('610') + getCostByCode('620'),
      sourceCodes: ['610', '620'],
    },
    {
      id: 'outdoor-landscaping',
      label: 'Outdoor Areas & Landscaping',
      cost: getCostByCode('520') + getCostByCode('530') + getCostByCode('540') + getCostByCode('560') + getCostByCode('570'),
      sourceCodes: ['520', '530', '540', '560', '570'],
    },
    {
      id: 'pool-equipment',
      label: 'Pool Equipment',
      cost: getCostByCode('550'),
      sourceCodes: ['550'],
    },
    {
      id: 'fees-permits',
      label: 'Fees & Permits',
      cost: getCostByCode('700'),
      sourceCodes: ['700'],
    },
  ].filter((item) => item.cost > 0);

  return privateItems.map((item) => ({
    id: item.id,
    label: item.label,
    totalCost: item.cost,
    sourceCodes: item.sourceCodes,
  }));
}

function mapBreakdownForProUser(breakdownGroups: ProjectBreakdownGroup[]): ProBreakdownItem[] {
  const { groupMap, subgroupMap } = getBreakdownMaps(breakdownGroups);

  const practicalLabelsByCode: Record<string, string> = {
    '100': 'Land / acquisition-related cost',
    '200': 'Preparatory measures / setup / utility preparation',
    '310': 'Building excavation and ground works',
    '510': 'Outdoor earthworks',
    '320': 'Foundations & substructure',
    '330': 'External walls & facade',
    '360': 'Roof structure & roof build-up',
    '390': 'Other structural works',
    '548': 'Pool shell / structural pool works',
    '340': 'Internal walls & partitions',
    '350': 'Floors, slabs & ceilings',
    '410': 'Plumbing & sanitary systems',
    '470': 'Kitchen installation',
    '420': 'Heat generation, distribution & emitters',
    '430': 'Ventilation / air-conditioning',
    '440': 'Electrical installation',
    '450': 'Communication / security systems',
    '480': 'Automation / smart systems',
    '520': 'Outdoor foundations / substructure',
    '530': 'Paving / terraces / parking',
    '540': 'Fences / walls / stairs / canopies',
    '560': 'Outdoor fixtures',
    '570': 'Planting / lawn',
    '550': 'Pool technical systems',
    '700': 'Fees & permits',
  };

  const proCategoryDefinitions: Array<{
    id: string;
    label: string;
    items: Array<{ code: string; label?: string }>;
  }> = [
    {
      id: 'site-preparation',
      label: 'Site & Preparation',
      items: [{ code: '100' }, { code: '200' }],
    },
    {
      id: 'earthworks-ground',
      label: 'Earthworks & Ground Preparation',
      items: [{ code: '310' }, { code: '510' }],
    },
    {
      id: 'structure-shell',
      label: 'Building Structure & Shell',
      items: [{ code: '320' }, { code: '330' }, { code: '360' }, { code: '548' }],
    },
    {
      id: 'interior-finishes',
      label: 'Interior Build & Finishes',
      items: [{ code: '340' }, { code: '350' }],
    },
    {
      id: 'bath-kitchen-equipment',
      label: 'Bathrooms, Kitchen & Home Equipment',
      items: [{ code: '410' }, { code: '470' }],
    },
    {
      id: 'heating-cooling-electrical',
      label: 'Heating, Cooling & Electrical',
      items: [{ code: '420' }, { code: '430' }, { code: '440' }],
    },
    {
      id: 'smart-security-connectivity',
      label: 'Smart Home, Security & Connectivity',
      items: [{ code: '450' }, { code: '480' }],
    },
    {
      id: 'outdoor-landscaping',
      label: 'Outdoor Works & Landscaping',
      items: [{ code: '520' }, { code: '530' }, { code: '540' }, { code: '560' }, { code: '570' }],
    },
    {
      id: 'pool-equipment-extras',
      label: 'Pool Equipment & Outdoor Extras',
      items: [{ code: '550' }],
    },
    {
      id: 'fees-permits',
      label: 'Fees & Permits',
      items: [{ code: '700' }],
    },
  ];

  const getChildItem = (code: string): ProBreakdownChildItem | null => {
    const group = groupMap.get(code);
    if (group) {
      if (group.subtotal <= 0) return null;
      return {
        id: code,
        label: practicalLabelsByCode[code] ?? getDin276Group(code)?.label ?? `KG ${code}`,
        code,
        cost: group.subtotal,
        sourceCodes: [code],
        dinChildren: [],
        isExpandable: false,
      };
    }

    const subgroup = subgroupMap.get(code);
    if (!subgroup || subgroup.cost <= 0) return null;

    const dinChildren =
      subgroup.children
        ?.filter((child) => child.visible && child.cost > 0)
        .map((child) => ({
          id: child.code,
          label: getDin276Subgroup(child.code)?.label ?? child.code,
          code: child.code,
          cost: child.cost,
        })) ?? [];

    return {
      id: code,
      label: practicalLabelsByCode[code] ?? getDin276Subgroup(code)?.label ?? code,
      code,
      cost: subgroup.cost,
      sourceCodes: [code],
      dinChildren,
      isExpandable: dinChildren.length > 0,
    };
  };

  return proCategoryDefinitions
    .map((category) => {
      const children = category.items
        .map((item) => getChildItem(item.code))
        .filter((item): item is ProBreakdownChildItem => item !== null);
      const totalCost = children.reduce((sum, child) => sum + child.cost, 0);

      return {
        id: category.id,
        label: category.label,
        totalCost,
        sourceCodes: category.items.map((item) => item.code),
        children,
        isExpandable: children.length > 0,
      };
    })
    .filter((category) => category.totalCost > 0);
}

function mapBreakdownForDeveloperUser(breakdownGroups: ProjectBreakdownGroup[]) {
  const { groupMap, subgroupMap } = getBreakdownMaps(breakdownGroups);

  const practicalLabelsByCode: Record<string, string> = {
    '200': 'Site preparation & entry costs',
    '310': 'Groundworks & excavation',
    '320': 'Substructure / structural base',
    '510': 'Outdoor earthworks',
    '520': 'Outdoor foundations / substructure',
    '548': 'Pool shell / structural pool works',
    '331': 'Load-bearing external walls',
    '332': 'Masonry external walls',
    '333': 'External columns',
    '334': 'Windows, exterior doors & glazing',
    '335': 'External-side facade build-up',
    '336': 'Internal-side facade build-up',
    '361': 'Roof structures',
    '363': 'Roof covering',
    '341': 'Load-bearing internal walls',
    '342': 'Non-load-bearing internal walls',
    '343': 'Internal columns',
    '344': 'Interior doors',
    '345': 'Internal wall finishes',
    '351': 'Floor structures',
    '353': 'Floor finishes',
    '354': 'Ceiling finishes',
    '411': 'Wastewater systems',
    '412': 'Water systems',
    '421': 'Heat generation',
    '422': 'Heat distribution',
    '423': 'Room heating surfaces',
    '433': 'Air-conditioning systems',
    '442': 'Self-generated power supply',
    '444': 'Electrical installation systems',
    '451': 'Telecommunications',
    '455': 'Audiovisual / antenna systems',
    '456': 'Hazard detection & alarm',
    '457': 'Data transmission networks',
    '470': 'Kitchen installation',
    '481': 'Automation devices',
    '482': 'Automation cabinets / centers',
    '483': 'Automation management',
    '484': 'Automation cabling / installations',
    '485': 'Automation data networks',
    '610': 'Built-in furniture allowance',
    '620': 'Kitchen & fixed furniture',
    '550': 'Pool equipment',
    '530': 'Paving / terraces / parking',
    '540': 'Walls / fences / stairs / canopies',
    '560': 'Outdoor fixtures',
    '570': 'Planting / lawn',
    '700': 'Fees & permits',
  };

  const categoryDefinitions: Array<{
    id: string;
    label: string;
    investmentTag: DeveloperInvestmentTag;
    visibilityTag: DeveloperVisibilityTag;
    riskTag: DeveloperRiskTag;
    items: string[];
  }> = [
    {
      id: 'land-cost',
      label: 'Land Cost',
      investmentTag: 'entry-cost',
      visibilityTag: 'hidden',
      riskTag: 'medium',
      items: ['100'],
    },
    {
      id: 'site-preparation-entry-costs',
      label: 'Site Preparation & Entry Costs',
      investmentTag: 'entry-cost',
      visibilityTag: 'hidden',
      riskTag: 'medium',
      items: ['200'],
    },
    {
      id: 'ground-structural-base',
      label: 'Ground & Structural Base',
      investmentTag: 'risk-sensitive-core',
      visibilityTag: 'hidden',
      riskTag: 'high',
      items: ['310', '320', '510', '520', '548'],
    },
    {
      id: 'envelope-core-shell',
      label: 'Building Shell & Envelope',
      investmentTag: 'core',
      visibilityTag: 'partly-visible',
      riskTag: 'medium',
      items: ['331', '332', '333', '334', '335', '336', '361', '363'],
    },
    {
      id: 'interior-base-build',
      label: 'Interior Build & Finishes',
      investmentTag: 'core',
      visibilityTag: 'visible',
      riskTag: 'medium',
      items: ['341', '342', '343', '344', '345', '351', '353', '354'],
    },
    {
      id: 'mep-core-systems',
      label: 'Core Building Systems',
      investmentTag: 'core',
      visibilityTag: 'hidden',
      riskTag: 'medium',
      items: ['411', '412', '421', '422', '423', '433', '442', '444'],
    },
    {
      id: 'marketable-premium-features',
      label: 'Premium & Buyer-Facing Features',
      investmentTag: 'value-add',
      visibilityTag: 'highly-visible',
      riskTag: 'low',
      items: ['451', '455', '456', '457', '470', '481', '482', '483', '484', '485', '610', '620', '550'],
    },
    {
      id: 'external-value-drivers',
      label: 'External Value Drivers',
      investmentTag: 'value-add',
      visibilityTag: 'highly-visible',
      riskTag: 'medium',
      items: ['530', '540', '560', '570'],
    },
    {
      id: 'soft-costs-fees-approvals',
      label: 'Soft Costs, Fees & Approvals',
      investmentTag: 'soft-cost',
      visibilityTag: 'hidden',
      riskTag: 'low',
      items: ['700'],
    },
  ];

  const getChildItem = (code: string): ProBreakdownChildItem | null => {
    const group = groupMap.get(code);
    if (group) {
      if (group.subtotal <= 0) return null;
      return {
        id: code,
        label: practicalLabelsByCode[code] ?? getDin276Group(code)?.label ?? `KG ${code}`,
        code,
        cost: group.subtotal,
        sourceCodes: [code],
        dinChildren: [],
        isExpandable: false,
      };
    }

    const subgroup = subgroupMap.get(code);
    if (!subgroup || subgroup.cost <= 0) return null;
    const dinChildren =
      subgroup.children
        ?.filter((child) => child.visible && child.cost > 0)
        .map((child) => ({
          id: child.code,
          label: getDin276Subgroup(child.code)?.label ?? child.code,
          code: child.code,
          cost: child.cost,
        })) ?? [];

    return {
      id: code,
      label: practicalLabelsByCode[code] ?? getDin276Subgroup(code)?.label ?? code,
      code,
      cost: subgroup.cost,
      sourceCodes: [code],
      dinChildren,
      isExpandable: dinChildren.length > 0,
    };
  };

  const items: DeveloperBreakdownItem[] = categoryDefinitions
    .map((category) => {
      const children = category.items
        .map((code) => getChildItem(code))
        .filter((item): item is ProBreakdownChildItem => item !== null);
      const totalCost = children.reduce((sum, child) => sum + child.cost, 0);

      return {
        id: category.id,
        label: category.label,
        totalCost,
        sourceCodes: category.items,
        children,
        isExpandable: children.length > 0,
        investmentTag: category.investmentTag,
        visibilityTag: category.visibilityTag,
        riskTag: category.riskTag,
      };
    })
    .filter((category) => category.totalCost > 0);

  const totalCostBasis = items.reduce((sum, item) => sum + item.totalCost, 0);
  const hardCostTotal = items
    .filter((item) => item.id !== 'land-cost' && item.id !== 'soft-costs-fees-approvals')
    .reduce((sum, item) => sum + item.totalCost, 0);
  const softCostTotal = items
    .filter((item) => item.investmentTag === 'soft-cost')
    .reduce((sum, item) => sum + item.totalCost, 0);
  const riskSensitiveTotal = items
    .filter((item) => item.investmentTag === 'risk-sensitive-core' || item.riskTag === 'high')
    .reduce((sum, item) => sum + item.totalCost, 0);
  const visibleTotal = items
    .filter((item) => item.visibilityTag === 'visible' || item.visibilityTag === 'highly-visible')
    .reduce((sum, item) => sum + item.totalCost, 0);
  const valueAddTotal = items
    .filter((item) => item.investmentTag === 'value-add')
    .reduce((sum, item) => sum + item.totalCost, 0);

  const summary: DeveloperSummaryMetrics = {
    hardCostTotal,
    softCostTotal,
    riskSensitiveShare: totalCostBasis > 0 ? (riskSensitiveTotal / totalCostBasis) * 100 : 0,
    visibleShare: totalCostBasis > 0 ? (visibleTotal / totalCostBasis) * 100 : 0,
    valueAddShare: totalCostBasis > 0 ? (valueAddTotal / totalCostBasis) * 100 : 0,
  };

  return { items, summary };
}

function ProBreakdownCategory({
  item,
  showDinCodes,
  showDinStructure,
}: {
  item: ProBreakdownItem;
  showDinCodes: boolean;
  showDinStructure: boolean;
}) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [expandedChildren, setExpandedChildren] = useState<Record<string, boolean>>({});

  const toggle = useCallback(() => {
    if (!item.isExpandable) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, [item.isExpandable]);

  const toggleChild = useCallback((code: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedChildren((prev) => ({ ...prev, [code]: !prev[code] }));
  }, []);

  return (
    <View style={styles.privateCategoryContainer}>
      <TouchableOpacity
        style={styles.privateCategoryHeader}
        onPress={toggle}
        activeOpacity={item.isExpandable ? 0.7 : 1}
        disabled={!item.isExpandable}
        testID={`pro-category-${item.id}`}
      >
        <View style={styles.privateCategoryInfo}>
          <View style={styles.privateCategoryTitleRow}>
            {item.isExpandable ? (
              expanded ? (
                <ChevronDown size={16} color={Colors.textTertiary} />
              ) : (
                <ChevronRight size={16} color={Colors.textTertiary} />
              )
            ) : (
              <View style={styles.privateCategoryChevronPlaceholder} />
            )}
            <Text style={styles.privateCategoryTitle}>{item.label}</Text>
          </View>
        </View>
        <Text style={styles.privateCategoryCost}>{formatCurrency(item.totalCost)}</Text>
      </TouchableOpacity>

      {item.isExpandable && expanded ? (
        <View style={styles.privateCategoryChildren}>
          {item.children.map((child) => {
            const canExpandDin = showDinStructure && child.isExpandable;
            const childExpanded = expandedChildren[child.id] ?? false;

            return (
              <View key={child.id}>
                <TouchableOpacity
                  style={styles.proChildRow}
                  onPress={() => {
                    if (canExpandDin) toggleChild(child.id);
                  }}
                  activeOpacity={canExpandDin ? 0.7 : 1}
                  disabled={!canExpandDin}
                  testID={`pro-child-${child.id}`}
                >
                  <View style={styles.proChildInfo}>
                    <View style={styles.privateCategoryTitleRow}>
                      {canExpandDin ? (
                        childExpanded ? (
                          <ChevronDown size={15} color={Colors.textTertiary} />
                        ) : (
                          <ChevronRight size={15} color={Colors.textTertiary} />
                        )
                      ) : (
                        <View style={styles.privateCategoryChevronPlaceholder} />
                      )}
                      <Text style={styles.proChildLabel}>
                        {showDinCodes && child.code ? `${child.code} ` : ''}
                        {child.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.privateCategoryChildCost}>{formatCurrency(child.cost)}</Text>
                </TouchableOpacity>

                {canExpandDin && childExpanded ? (
                  <View style={styles.proDinChildren}>
                    {child.dinChildren.map((dinChild) => (
                      <View key={dinChild.id} style={styles.proDinChildRow}>
                        <Text style={styles.proDinChildLabel}>
                          {showDinCodes ? `${dinChild.code} ` : ''}
                          {dinChild.label}
                        </Text>
                        <Text style={styles.privateCategoryChildCost}>{formatCurrency(dinChild.cost)}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function DeveloperSummaryCard({
  metrics,
}: {
  metrics: DeveloperSummaryMetrics;
}) {
  const summaryItems = [
    { id: 'hard-cost', label: 'Hard Cost', value: formatCurrency(metrics.hardCostTotal) },
    { id: 'soft-cost', label: 'Soft Cost', value: formatCurrency(metrics.softCostTotal) },
    { id: 'risk-share', label: 'Risk-Sensitive Share', value: formatPercent(metrics.riskSensitiveShare, 1) },
    { id: 'visible-share', label: 'Buyer-Visible Share', value: formatPercent(metrics.visibleShare, 1) },
    { id: 'value-add-share', label: 'Premium / Value-Add Share', value: formatPercent(metrics.valueAddShare, 1) },
  ];

  return (
    <View style={styles.developerSummaryCard}>
      <Text style={styles.developerSummaryTitle}>Feasibility Snapshot</Text>
      <View style={styles.developerSummaryGrid}>
        {summaryItems.map((item) => (
          <View key={item.id} style={styles.developerSummaryItem}>
            <Text style={styles.developerSummaryLabel}>{item.label}</Text>
            <Text style={styles.developerSummaryValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function DeveloperBreakdownCategory({
  item,
}: {
  item: DeveloperBreakdownItem;
}) {
  return (
    <View style={styles.privateCategoryContainer}>
      <View
        style={styles.privateCategoryHeader}
        testID={`developer-category-${item.id}`}
      >
        <View style={styles.privateCategoryInfo}>
          <Text style={styles.privateCategoryTitle}>{item.label}</Text>
          <View style={styles.developerTagsRow}>
            <Text style={styles.developerTag}>{item.investmentTag}</Text>
            <Text style={styles.developerTag}>{item.visibilityTag}</Text>
            <Text style={styles.developerTag}>{item.riskTag} risk</Text>
          </View>
        </View>
        <Text style={styles.privateCategoryCost}>{formatCurrency(item.totalCost)}</Text>
      </View>
    </View>
  );
}

function getReportTitle(mode: UserMode | null): string {
  switch (mode) {
    case 'private':
      return 'Project Cost Overview';
    case 'pro':
      return 'Pro Cost Report';
    case 'developer':
      return 'Developer Feasibility Report';
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
    basementKg300Total,
    basementBucket400,
    permitDesignFee,
    contingencyCost,
    contractorCost,
    projectTotalBeforeVat,
    estimatedRangeLow,
    estimatedRangeHigh,
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
        basementKg300Total,
        basementKg400Total: basementBucket400,
        permitDesignFee,
        contingencyCost,
        contractorCost,
        totalCost: projectTotalBeforeVat,
        estimatedRangeLow,
        estimatedRangeHigh,
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
    kg600Cost, baseBuildingAreaBenchmarkContribution, coveredTerracesBenchmarkContribution, balconyAreaBenchmarkContribution, totalBenchmarkContributionBeforeGroupAllocation, permitDesignFee, contingencyCost, contractorCost, projectTotalBeforeVat, estimatedRangeLow, estimatedRangeHigh,
    constructionSubtotal, basementBaseCost, basementKg300Total, basementBucket400, contingencyPercent, sizeCorrectionFactor,
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
  const { userMode } = useUserMode();
  const [professionalBreakdownView, setProfessionalBreakdownView] = useState<'execution' | 'din276'>('execution');
  const [developerBreakdownView, setDeveloperBreakdownView] = useState<'feasibility' | 'din276'>('feasibility');
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
    basementBenchmarkRate,
    basementKg300Total,
    basementBucket400,
    coveredTerracesBenchmarkContribution,
    balconyAreaBenchmarkContribution,
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
    group100Total,
    kg200Total,
    kg500Total,
    constructionSubtotal,
    contingencyPercent,
    contingencyCost,
    sizeCorrectionFactor,
  } = useEstimate();

  const sizeCorrectionLabel = formatSizeCorrectionFactorLabel(sizeCorrectionFactor);
  const enabledHvac = hvacCosts.filter((h) => h.enabled);
  const basementSummary = formatBasementSummary(
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
  );
  const modeConfig = userMode ? USER_MODE_CONFIGS[userMode] : null;
  const breakdownDisplayType = modeConfig?.breakdownDisplayType ?? 'private';
  const displayedTotals = useMemo(
    () => getDisplayedTotalsForMode({
      userMode,
      projectTotalBeforeVat,
      totalCostInclVat,
      vatAmount,
      vatPercent,
      group100Total,
    }),
    [group100Total, projectTotalBeforeVat, totalCostInclVat, userMode, vatAmount, vatPercent],
  );

  const dinGroups = useMemo<DinGroup[]>(() => {
    const enabledHvacIds = new Set(enabledHvac.map((item) => item.option.id));

    return breakdownGroups.map((group: ProjectBreakdownGroup) => ({
      code: group.code,
      name: getDin276Group(group.code)?.label ?? `KG ${group.code}`,
      subtotal: group.subtotal,
      percentOfTotal: group.percentOfTotal,
      subgroups: buildGroupSubgroupTree(group.code, group.subgroups, {
        siteConditionName: siteCondition.name,
        landscapingArea,
        poolArea,
        poolQualityName: poolQualityOption.name,
        poolTypeName: poolTypeOption.name,
        enabledHvacIds,
      }),
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

  const professionalDinGroups = useMemo<DinGroup[]>(
    () => dinGroups.filter((group) => group.code !== '100'),
    [dinGroups],
  );

  const privateBreakdownItems = useMemo<PrivateBreakdownItem[]>(
    () => mapBreakdownForPrivateUser(breakdownGroups),
    [breakdownGroups],
  );

  const developerBreakdown = useMemo(
    () => mapBreakdownForDeveloperUser(breakdownGroups),
    [breakdownGroups],
  );

  const displayedTotalBreakdownParts = [
    displayedTotals.includeGroup100 ? `KG 100 ${formatCurrency(group100Total)}` : null,
    `KG 200 ${formatCurrency(kg200Total)}`,
    `KG 300${EN_DASH}600 ${formatCurrency(constructionSubtotal)}`,
    `KG 500 ${formatCurrency(kg500Total)}`,
    `KG 700 ${formatCurrency(permitDesignFee)}`,
    `e-EFKA ${formatCurrency(efkaInsuranceAmount)}`,
    `Contingency ${formatCurrency(contingencyCost)}`,
    `Overhead ${formatCurrency(contractorCost)}`,
  ].filter(Boolean).join(' + ');

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
          {basementBaseCost > 0 && (
            <View style={styles.assumptionItem}>
              <Text style={styles.assumptionLabel}>Basement DIN contribution</Text>
              <Text style={styles.assumptionValue}>{`${formatCurrency(basementBaseCost)} included in KG 300/KG 400 (${formatCurrency(basementKg300Total)} + ${formatCurrency(basementBucket400)})`}</Text>
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
        <Text style={styles.dinSectionTitleText}>
          {breakdownDisplayType === 'private'
            ? 'Project Cost Breakdown'
            : breakdownDisplayType === 'pro'
              ? 'Pro / Contractor Breakdown'
              : 'Developer / Investor Breakdown'}
        </Text>
        <Text style={styles.dinBadge}>
          {breakdownDisplayType === 'private'
          ? 'Overview'
            : breakdownDisplayType === 'pro'
              ? 'Pro'
              : 'Investor'}
        </Text>
      </View>

      {breakdownDisplayType === 'pro' ? (
        <View style={styles.proControlsCard}>
          <TouchableOpacity
            style={[styles.proControlChip, professionalBreakdownView === 'execution' ? styles.proControlChipActive : null]}
            onPress={() => setProfessionalBreakdownView('execution')}
            activeOpacity={0.8}
            testID="toggle-pro-execution-view"
          >
            <Text style={[styles.proControlChipText, professionalBreakdownView === 'execution' ? styles.proControlChipTextActive : null]}>
              Execution
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.proControlChip, professionalBreakdownView === 'din276' ? styles.proControlChipActive : null]}
            onPress={() => setProfessionalBreakdownView('din276')}
            activeOpacity={0.8}
            testID="toggle-pro-din276-view"
          >
            <Text style={[styles.proControlChipText, professionalBreakdownView === 'din276' ? styles.proControlChipTextActive : null]}>
              DIN 276
            </Text>
          </TouchableOpacity>
        </View>
      ) : modeConfig?.supportsDeveloperSummary && breakdownDisplayType === 'developer' ? (
        <>
          <View style={styles.proControlsCard}>
            <TouchableOpacity
              style={[styles.proControlChip, developerBreakdownView === 'feasibility' ? styles.proControlChipActive : null]}
              onPress={() => setDeveloperBreakdownView('feasibility')}
              activeOpacity={0.8}
              testID="toggle-developer-feasibility-view"
            >
              <Text style={[styles.proControlChipText, developerBreakdownView === 'feasibility' ? styles.proControlChipTextActive : null]}>
                Feasibility
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.proControlChip, developerBreakdownView === 'din276' ? styles.proControlChipActive : null]}
              onPress={() => setDeveloperBreakdownView('din276')}
              activeOpacity={0.8}
              testID="toggle-developer-din276-view"
            >
              <Text style={[styles.proControlChipText, developerBreakdownView === 'din276' ? styles.proControlChipTextActive : null]}>
                DIN 276
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}

      {breakdownDisplayType === 'private'
        ? privateBreakdownItems.map((item) => (
          <PrivateBreakdownCategory key={item.id} item={item} />
        ))
        : breakdownDisplayType === 'pro'
          ? professionalBreakdownView === 'execution'
            ? privateBreakdownItems.map((item) => (
              <PrivateBreakdownCategory key={item.id} item={item} />
            ))
            : professionalDinGroups.map((group) => (
              <CollapsibleGroup key={group.code} group={group} defaultClosed />
            ))
          : developerBreakdownView === 'feasibility'
            ? (
              <>
                <DeveloperSummaryCard metrics={developerBreakdown.summary} />
                {developerBreakdown.items.map((item) => (
                  <DeveloperBreakdownCategory
                    key={item.id}
                    item={item}
                  />
                ))}
              </>
            )
            : dinGroups.map((group) => (
              <CollapsibleGroup key={group.code} group={group} defaultClosed />
            ))}

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
          <Text style={styles.grandTotalValue}>{formatCurrency(displayedTotals.displayedProjectTotalBeforeVat)}</Text>
        </View>
        <View style={styles.grandTotalBreakdown}>
          <Text style={styles.grandTotalBreakdownText}>
            {displayedTotalBreakdownParts}
          </Text>
        </View>
      </View>

      <View style={styles.vatCard}>
        <View style={styles.vatRow}>
          <Text style={styles.vatLabel}>{`+ VAT (${formatPercent(vatPercent, vatPercent % 1 === 0 ? 0 : 1)})`}</Text>
          <Text style={styles.vatValue}>{formatCurrency(displayedTotals.displayedVatAmount)}</Text>
        </View>
        <View style={styles.vatDivider} />
        <View style={styles.vatRow}>
          <Text style={styles.vatTotalLabel}>Total incl. VAT</Text>
          <Text style={styles.vatTotalValue}>{formatCurrency(displayedTotals.displayedTotalInclVat)}</Text>
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
  proControlsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  proControlChip: {
    backgroundColor: Colors.inputBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  proControlChipActive: {
    backgroundColor: Colors.accentBg,
    borderColor: Colors.accent,
  },
  proControlChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  proControlChipTextActive: {
    color: Colors.accent,
  },
  developerSummaryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  developerSummaryTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    marginBottom: 10,
  },
  developerSummaryGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  developerSummaryItem: {
    minWidth: 132,
    flexGrow: 1,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  developerSummaryLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
  },
  developerSummaryValue: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.primary,
    marginTop: 2,
    fontVariant: ['tabular-nums'] as any,
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
  privateCategoryContainer: {
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
  privateCategoryHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  privateCategoryInfo: {
    flex: 1,
  },
  privateCategoryTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  privateCategoryChevronPlaceholder: {
    width: 16,
  },
  privateCategoryTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  privateCategoryCost: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.primary,
    fontVariant: ['tabular-nums'] as any,
  },
  privateCategoryChildren: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  privateCategoryChildCost: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
    fontVariant: ['tabular-nums'] as any,
  },
  developerTagsRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
    marginTop: 6,
  },
  developerTag: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    backgroundColor: Colors.inputBg,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden' as const,
  },
  proChildRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
    paddingVertical: 8,
  },
  proChildInfo: {
    flex: 1,
  },
  proChildLabel: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
    lineHeight: 17,
    fontWeight: '600' as const,
  },
  proDinChildren: {
    paddingLeft: 24,
    paddingBottom: 4,
  },
  proDinChildRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
    paddingVertical: 6,
  },
  proDinChildLabel: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  groupHeader: {
    flexDirection: 'row' as const,
    alignItems: 'stretch' as const,
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
  subgroupRowLevel3: {
    paddingLeft: 18,
    paddingTop: 8,
    paddingBottom: 8,
  },
  subgroupLeading: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginRight: 10,
  },
  subgroupLeadingLevel3: {
    marginRight: 8,
  },
  subgroupChevronWrap: {
    width: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 2,
  },
  subgroupChevronPlaceholder: {
    width: 20,
    marginRight: 0,
  },
  subgroupIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: Colors.inputBg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  subgroupIconWrapLevel3: {
    width: 24,
    height: 24,
    borderRadius: 6,
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
  subgroupNameLevel3: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  subgroupSublabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
    lineHeight: 15,
  },
  subgroupCodeLevel3: {
    fontSize: 9,
  },
  subgroupCost: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
    fontVariant: ['tabular-nums'] as any,
  },
  subgroupChildren: {
    paddingLeft: 12,
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
