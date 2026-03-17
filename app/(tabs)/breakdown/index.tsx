import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
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
  ExternalLink,
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
  PERMIT_DESIGN_CONTACT_URL,
  PERMIT_DESIGN_CONTACT_LABEL,
  getSizeCorrectionLabel,
} from '@/constants/construction';
import { getDin276Group, getDin276Subgroup } from '@/constants/din276Groups';
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
    effectiveArea,
    mainArea,
    balconyArea,
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
        effectiveArea,
        mainArea,
        qualityName: quality.name,
        balconyArea,
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
    generating, location, quality, effectiveArea, mainArea, balconyArea, basementArea,
    storageBasementArea, parkingBasementArea, habitableBasementArea,
    includePool, poolArea, poolDepth, poolQualityOption, poolTypeOption,
    siteCondition, groundwaterCondition, siteAccessibility, hvacCosts, kg200Total, kg300Total, kg400Total, kg500Total,
    kg600Cost, permitDesignFee, contingencyCost, contractorCost, totalCost,
    constructionSubtotal, contingencyPercent, sizeCorrectionFactor,
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
    landscapingCost,
    balconyArea,
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
    basementArea,
    bathrooms,
    wcs,
    hvacCosts,
    mainArea,
    effectiveArea,
    correctedCostPerSqm,
    categoryCosts,
    contractorCost,
    contractorPercent,
    poolCost,
    includePool,
    poolArea,
    poolDepth,
    poolQualityOption,
    poolTypeOption,
    permitDesignFee,
    totalCost,
    utilityGroup220Cost,
    utilityGroup230Cost,
    kg200Total,
    kg300Total,
    kg300SubgroupCosts,
    kg400Total,
    kg500Total,
    kg600Cost,
    kg600SubgroupCosts,
    bathroomWcFurnishingSliceCost,
    constructionSubtotal,
    contingencyPercent,
    contingencyCost,
    siteExcavationCost,
    sizeCorrectionFactor,
    landValue,
    landAcquisitionCosts,
    landAcquisitionCostsMode,
  } = useEstimate();

  const sizeCorrectionLabel = getSizeCorrectionLabel(mainArea);
  const enabledHvac = hvacCosts.filter((h) => h.enabled);
  const displayedLandAcquisitionCosts = landAcquisitionCostsMode === 'auto'
    ? landValue * 0.06
    : landAcquisitionCosts;
  const basementSummary = formatBasementSummary(
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
  );
  const group100Total = landValue + displayedLandAcquisitionCosts;
  const investmentTotal = totalCost + group100Total;

  const getCategoryCost = useCallback((id: string): number => {
    return categoryCosts.find((c) => c.category.id === id)?.cost ?? 0;
  }, [categoryCosts]);

  const dinGroups = useMemo<DinGroup[]>(() => {
    const groups: DinGroup[] = [
      {
        code: '100',
        name: getDin276Group('100')?.label ?? 'Land',
        subtotal: group100Total,
        percentOfTotal: investmentTotal > 0 ? (group100Total / investmentTotal) * 100 : 0,
        accentColor: '#7A5C3E',
        subgroups: [
          {
            code: '110',
            name: getDin276Subgroup('110')?.label ?? 'Land Value',
            cost: landValue,
            icon: LandPlot,
            visible: landValue > 0,
          },
          {
            code: '120',
            name: getDin276Subgroup('120')?.label ?? 'Incidental Land Acquisition Costs',
            cost: displayedLandAcquisitionCosts,
            sublabel: landAcquisitionCostsMode === 'auto'
              ? `${formatCurrency(displayedLandAcquisitionCosts)} (6 % of ${formatCurrency(landValue)})`
              : 'Manual override',
            icon: Landmark,
            visible: displayedLandAcquisitionCosts > 0 || landAcquisitionCostsMode === 'manual',
          },
        ],
      },
      {
        code: '200',
        name: getDin276Group('200')?.label ?? 'Preparatory Measures',
        subtotal: kg200Total,
        percentOfTotal: investmentTotal > 0 ? (kg200Total / investmentTotal) * 100 : 0,
        accentColor: '#8B6914',
        subgroups: [
          {
            code: '210',
            name: getDin276Subgroup('210')?.label ?? 'Site Preparation',
            cost: siteExcavationCost,
            icon: Shovel,
            sublabel: `Basic plot preparation ${MIDDLE_DOT} ${siteCondition.name}`,
            visible: true,
          },
          {
            code: '220',
            name: getDin276Subgroup('220')?.label ?? 'Public Utilities Connections',
            cost: utilityGroup220Cost,
            icon: Plug,
            sublabel: 'Public network connections',
            visible: true,
          },
          {
            code: '230',
            name: getDin276Subgroup('230')?.label ?? 'Private Utilities Connections',
            cost: utilityGroup230Cost,
            icon: Cable,
            sublabel: 'On-site pipes and cables',
            visible: true,
          },
          {
            code: '240',
            name: getDin276Subgroup('240')?.label ?? 'Compensation Measures and Levies',
            cost: 0,
            icon: ClipboardCheck,
            sublabel: 'Reserved for future logic',
            visible: false,
          },
          {
            code: '250',
            name: getDin276Subgroup('250')?.label ?? 'Temporary Measures',
            cost: 0,
            icon: HardHat,
            sublabel: 'Reserved for future logic',
            visible: false,
          },
        ],
      },
      {
        code: '300',
        name: getDin276Group('300')?.label ?? 'Building - Construction Works',
        subtotal: kg300Total,
        percentOfTotal: investmentTotal > 0 ? (kg300Total / investmentTotal) * 100 : 0,
        accentColor: '#1B3A4B',
        subgroups: [
          {
            code: '310',
            name: getDin276Subgroup('310')?.label ?? 'Earthworks and Excavation',
            cost: kg300SubgroupCosts.subgroup310Cost,
            icon: Shovel,
            sublabel: 'Excavation and earthworks for building construction',
            visible: true,
          },
          {
            code: '320',
            name: getDin276Subgroup('320')?.label ?? 'Foundations and Substructure',
            cost: kg300SubgroupCosts.subgroup320Cost,
            icon: Building,
            sublabel: 'Foundations and substructure',
            visible: true,
          },
          {
            code: '330',
            name: getDin276Subgroup('330')?.label ?? 'External Walls',
            cost: kg300SubgroupCosts.subgroup330Cost,
            icon: Layers,
            sublabel: 'External walls, windows, exterior doors',
            visible: true,
          },
          {
            code: '340',
            name: getDin276Subgroup('340')?.label ?? 'Internal Walls',
            cost: kg300SubgroupCosts.subgroup340Cost,
            icon: LayoutGrid,
            sublabel: 'Internal walls and interior doors',
            visible: true,
          },
          {
            code: '350',
            name: getDin276Subgroup('350')?.label ?? 'Floors and Slabs',
            cost: kg300SubgroupCosts.subgroup350Cost,
            icon: Paintbrush,
            sublabel: 'Slabs and horizontal structural elements',
            visible: true,
          },
          {
            code: '360',
            name: getDin276Subgroup('360')?.label ?? 'Roofs',
            cost: kg300SubgroupCosts.subgroup360Cost,
            icon: Home,
            sublabel: 'Roof structure, tiles/membrane, waterproofing, gutters',
            visible: true,
          },
          {
            code: '370',
            name: getDin276Subgroup('370')?.label ?? 'Infrastructure Installations',
            cost: kg300SubgroupCosts.subgroup370Cost,
            icon: Shield,
            sublabel: 'Integrated construction-related infrastructure installations',
            visible: kg300SubgroupCosts.subgroup370Cost > 0,
          },
          {
            code: '380',
            name: getDin276Subgroup('380')?.label ?? 'Built-In Construction Elements',
            cost: kg300SubgroupCosts.subgroup380Cost,
            icon: Wrench,
            sublabel: 'Built-in construction elements',
            visible: kg300SubgroupCosts.subgroup380Cost > 0,
          },
          {
            code: '390',
            name: getDin276Subgroup('390')?.label ?? 'Other Construction Works',
            cost: kg300SubgroupCosts.subgroup390Cost,
            icon: Hammer,
            sublabel: 'Other building construction works',
            visible: true,
          },
        ],
      },
      {
        code: '400',
        name: getDin276Group('400')?.label ?? 'Technical Systems',
        subtotal: kg400Total,
        percentOfTotal: investmentTotal > 0 ? (kg400Total / investmentTotal) * 100 : 0,
        accentColor: '#2D8B55',
        subgroups: [
          {
            code: '410',
            name: getDin276Subgroup('410')?.label ?? 'Sanitary / Plumbing',
            cost: getCategoryCost('plumbing'),
            icon: Droplets,
            sublabel: 'Water supply, drainage, bathroom fittings',
            visible: true,
          },
          {
            code: '420',
            name: getDin276Subgroup('420')?.label ?? 'Heating',
            cost: getCategoryCost('heating') + enabledHvac.filter(h =>
              h.option.id === 'underfloor_heating' || h.option.id === 'solar_thermal'
            ).reduce((s, h) => s + h.cost, 0),
            icon: Thermometer,
            sublabel: enabledHvac.some(h => h.option.id === 'underfloor_heating')
              ? 'Heat pump, underfloor heating, solar thermal'
              : 'Heat pump + fan-coils or VRV',
            visible: true,
          },
          {
            code: '430',
            name: getDin276Subgroup('430')?.label ?? 'Ventilation / Cooling',
            cost: getCategoryCost('ventilation_cooling'),
            icon: Wind,
            sublabel: 'Ventilation, cooling, ducts, fan-coils',
            visible: true,
          },
          {
            code: '440',
            name: getDin276Subgroup('440')?.label ?? 'Electrical',
            cost: getCategoryCost('electrical') + enabledHvac.filter(h => h.option.id === 'photovoltaic').reduce((s, h) => s + h.cost, 0),
            icon: Zap,
            sublabel: enabledHvac.some(h => h.option.id === 'photovoltaic')
              ? 'Wiring, panels, lighting, PV-ready systems'
              : 'Wiring, panels, sockets, lighting',
            visible: true,
          },
          {
            code: '450',
            name: getDin276Subgroup('450')?.label ?? 'Data / Security',
            cost: getCategoryCost('data_security'),
            icon: Shield,
            sublabel: 'Data cabling, networking, alarm, access control',
            visible: true,
          },
          {
            code: '480',
            name: getDin276Subgroup('480')?.label ?? 'Automation / Smart Home',
            cost: getCategoryCost('automation'),
            icon: LayoutGrid,
            sublabel: 'Building automation, controls, smart-home integration',
            visible: true,
          },
        ],
      },
      {
        code: '500',
        name: getDin276Group('500')?.label ?? 'External Works and Open Spaces',
        subtotal: kg500Total,
        percentOfTotal: investmentTotal > 0 ? (kg500Total / investmentTotal) * 100 : 0,
        accentColor: '#6B8E23',
        subgroups: [
          {
            code: '510',
            name: getDin276Subgroup('510')?.label ?? 'Earthworks',
            cost: landscapingCost > 0 ? Math.round(landscapingCost * 0.3) : 0,
            icon: LandPlot,
            sublabel: `Grading, retaining walls ${MIDDLE_DOT} ${siteCondition.name}`,
            visible: landscapingCost > 0,
          },
          {
            code: '520',
            name: getDin276Subgroup('520')?.label ?? 'Foundations and Substructure',
            cost: landscapingCost > 0 ? Math.round(landscapingCost * 0.25) : 0,
            icon: Hammer,
            sublabel: 'Driveways, pathways, patios',
            visible: landscapingCost > 0,
          },
          {
            code: '530',
            name: getDin276Subgroup('530')?.label ?? 'Base Courses and Surface Layers',
            cost: landscapingCost > 0 ? Math.round(landscapingCost * 0.25) : 0,
            icon: Flower2,
            sublabel: `${formatNumber(landscapingArea)} ${SQUARE_METER_UNIT} landscape area`,
            visible: landscapingCost > 0,
          },
          {
            code: '560',
            name: getDin276Subgroup('560')?.label ?? 'Built-In Elements in External Works and Open Spaces',
            cost: poolCost + (landscapingCost > 0 ? landscapingCost - Math.round(landscapingCost * 0.3) - Math.round(landscapingCost * 0.25) - Math.round(landscapingCost * 0.25) : 0),
            icon: Waves,
            sublabel: includePool
              ? `Pool ${formatNumber(poolArea)} ${SQUARE_METER_UNIT} ${MIDDLE_DOT} ${poolQualityOption.name} ${MIDDLE_DOT} ${poolTypeOption.name}`
              : 'Irrigation, outdoor lighting',
            visible: includePool || landscapingCost > 0,
          },
          {
            code: '570',
            name: getDin276Subgroup('570')?.label ?? 'Green Areas',
            cost: 0,
            icon: Fence,
            sublabel: 'Fences, gates, boundary walls',
            visible: false,
          },
        ],
      },
      {
        code: '600',
        name: getDin276Group('600')?.label ?? 'Furnishings and Artworks',
        subtotal: kg600Cost,
        percentOfTotal: investmentTotal > 0 ? (kg600Cost / investmentTotal) * 100 : 0,
        accentColor: '#8B5CF6',
        subgroups: [
          {
            code: '610',
            name: getDin276Subgroup('610')?.label ?? 'General Furnishings',
            cost: kg600SubgroupCosts.subgroup610Cost,
            icon: Sofa,
            sublabel: 'General movable furniture',
            visible: kg600SubgroupCosts.subgroup610Cost > 0,
          },
          {
            code: '620',
            name: getDin276Subgroup('620')?.label ?? 'Special Furnishings',
            cost: kg600SubgroupCosts.subgroup620Cost,
            icon: Bath,
            sublabel: bathroomWcFurnishingSliceCost > 0
              ? `Kitchen ${MIDDLE_DOT} wardrobes ${MIDDLE_DOT} bathroom/WC furnishing slices`
              : 'Kitchen, built-in wardrobes, fixed furniture',
            visible: true,
          },
        ],
      },
      {
        code: '700',
        name: 'Planning & Professional Fees',
        subtotal: permitDesignFee,
        percentOfTotal: investmentTotal > 0 ? (permitDesignFee / investmentTotal) * 100 : 0,
        accentColor: '#D4782F',
        subgroups: [
          {
            code: '710',
            name: 'Architectural services',
            cost: Math.round(permitDesignFee * 0.50),
            icon: PenTool,
            sublabel: 'Design, documentation, site supervision',
            visible: true,
          },
          {
            code: '720',
            name: 'Engineering services',
            cost: Math.round(permitDesignFee * 0.30),
            icon: FileText,
            sublabel: 'Structural, MEP engineering',
            visible: true,
          },
          {
            code: '750',
            name: 'Permits and approvals',
            cost: permitDesignFee - Math.round(permitDesignFee * 0.50) - Math.round(permitDesignFee * 0.30),
            icon: ClipboardCheck,
            sublabel: 'Building permit, surveys, compliance',
            visible: true,
          },
        ],
      },
    ];

    return groups;
  }, [
    kg200Total, kg300Total, kg300SubgroupCosts, kg400Total, kg500Total, kg600Cost, permitDesignFee, totalCost,
    siteExcavationCost, utilityGroup220Cost, utilityGroup230Cost,
    siteCondition, landscapingCost, landscapingArea, poolCost,
    includePool, poolArea, poolQualityOption, poolTypeOption, enabledHvac, getCategoryCost,
    landValue, displayedLandAcquisitionCosts, landAcquisitionCostsMode, investmentTotal,
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
          {balconyArea > 0 && (
            <View style={styles.assumptionItem}>
              <Text style={styles.assumptionLabel}>Balconies</Text>
              <Text style={styles.assumptionValue}>{formatNumber(balconyArea)} {SQUARE_METER_UNIT} (${formatPercent(30)})</Text>
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
            <Text style={styles.assumptionLabel}>Effective Area</Text>
            <Text style={styles.assumptionValue}>{formatNumber(effectiveArea)} {SQUARE_METER_UNIT}</Text>
          </View>
          <View style={styles.assumptionItem}>
            <Text style={styles.assumptionLabel}>{`Corrected €/${SQUARE_METER_UNIT}`}</Text>
            <Text style={styles.assumptionValue}>{`${formatCurrency(correctedCostPerSqm)}/${SQUARE_METER_UNIT}`}</Text>
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

      <TouchableOpacity
        style={styles.permitDesignLink}
        onPress={() => Linking.openURL(PERMIT_DESIGN_CONTACT_URL)}
        activeOpacity={0.7}
        testID="breakdown-permit-design-link"
      >
        <Text style={styles.permitDesignLinkText}>{PERMIT_DESIGN_CONTACT_LABEL}</Text>
        <ExternalLink size={13} color={Colors.accent} />
      </TouchableOpacity>

      <View style={styles.grandTotalCard}>
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Total Project Cost</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(investmentTotal)}</Text>
        </View>
        <View style={styles.grandTotalBreakdown}>
          <Text style={styles.grandTotalBreakdownText}>
            {`KG 100 ${formatCurrency(group100Total)} + KG 200 ${formatCurrency(kg200Total)} + KG 300${EN_DASH}600 ${formatCurrency(constructionSubtotal)} + KG 500 ${formatCurrency(kg500Total)} + KG 700 ${formatCurrency(permitDesignFee)} + Contingency ${formatCurrency(contingencyCost)} + Overhead ${formatCurrency(contractorCost)}`}
          </Text>
        </View>
      </View>

      <View style={styles.vatCard}>
        <View style={styles.vatRow}>
          <Text style={styles.vatLabel}>+ VAT (24 %)</Text>
          <Text style={styles.vatValue}>{formatCurrency(Math.round(totalCost * 0.24))}</Text>
        </View>
        <View style={styles.vatDivider} />
        <View style={styles.vatRow}>
          <Text style={styles.vatTotalLabel}>Total incl. VAT</Text>
          <Text style={styles.vatTotalValue}>{formatCurrency(Math.round(totalCost * 1.24))}</Text>
        </View>
        <Text style={styles.vatNote}>VAT calculated using the current Greek construction VAT rate (24%).</Text>
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
  permitDesignLink: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'flex-start' as const,
    marginTop: 12,
    marginLeft: 16,
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.accentBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  permitDesignLinkText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.accent,
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
