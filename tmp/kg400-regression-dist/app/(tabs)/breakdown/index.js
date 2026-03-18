import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Platform, ActivityIndicator, LayoutAnimation, UIManager, } from 'react-native';
import ScenarioBar from '@/components/ScenarioBar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Hammer, Building, Layers, Home, LayoutGrid, Paintbrush, Thermometer, Zap, Droplets, Shield, Wrench, Waves, Info, Flower2, ExternalLink, PenTool, Plug, ShieldAlert, FileDown, ChevronDown, ChevronRight, Shovel, Cable, Fence, Bath, Sofa, FileText, ClipboardCheck, HardHat, LandPlot, Wind, Landmark, } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useEstimate } from '@/contexts/EstimateContext';
import { useUserMode } from '@/contexts/UserModeContext';
import { DISCLAIMER_TEXT, CONSTRUCTION_SUBTOTAL_DISCLAIMER, PERMIT_DESIGN_CONTACT_URL, PERMIT_DESIGN_CONTACT_LABEL, getSizeCorrectionLabel, } from '@/constants/construction';
import { getDin276Group, getDin276Subgroup } from '@/constants/din276Groups';
import { generateClientReportHtml } from '@/utils/generateClientReportHtml';
import { formatBasementSummary } from '@/utils/computeScenarioCosts';
import { formatCurrency, formatDecimal, formatNumber, formatPercent } from '@/utils/format';
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
const MULTIPLY_SYMBOL = '\u00D7';
const MIDDLE_DOT = '\u00B7';
const EN_DASH = '\u2013';
const SQUARE_METER_UNIT = 'm\u00B2';
function CollapsibleGroup({ group }) {
    const [expanded, setExpanded] = useState(true);
    const toggle = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded((prev) => !prev);
    }, []);
    const visibleSubgroups = group.subgroups.filter((s) => s.visible);
    return (_jsxs(View, { style: styles.groupContainer, children: [_jsxs(TouchableOpacity, { style: styles.groupHeader, onPress: toggle, activeOpacity: 0.7, testID: `group-header-${group.code}`, children: [_jsx(View, { style: [styles.groupAccentBar, { backgroundColor: group.accentColor }] }), _jsxs(View, { style: styles.groupHeaderContent, children: [_jsxs(View, { style: styles.groupHeaderLeft, children: [_jsx(Text, { style: styles.groupCode, children: group.code }), _jsx(Text, { style: styles.groupName, children: group.name })] }), _jsxs(View, { style: styles.groupHeaderRight, children: [_jsxs(View, { style: styles.groupCostColumn, children: [_jsx(Text, { style: styles.groupSubtotal, children: formatCurrency(group.subtotal) }), _jsx(Text, { style: styles.groupPercent, children: formatPercent(group.percentOfTotal, 1) })] }), expanded ? (_jsx(ChevronDown, { size: 18, color: Colors.textTertiary })) : (_jsx(ChevronRight, { size: 18, color: Colors.textTertiary }))] })] })] }), expanded && visibleSubgroups.length > 0 && (_jsx(View, { style: styles.subgroupList, children: visibleSubgroups.map((item) => (_jsxs(View, { style: styles.subgroupRow, children: [_jsx(View, { style: styles.subgroupIconWrap, children: _jsx(item.icon, { size: 15, color: group.accentColor }) }), _jsxs(View, { style: styles.subgroupInfo, children: [_jsxs(View, { style: styles.subgroupNameRow, children: [_jsx(Text, { style: styles.subgroupCode, children: item.code }), _jsx(Text, { style: styles.subgroupName, children: item.name })] }), item.sublabel ? (_jsx(Text, { style: styles.subgroupSublabel, children: item.sublabel })) : null] }), _jsx(Text, { style: styles.subgroupCost, children: formatCurrency(item.cost) })] }, item.code))) }))] }));
}
function getReportTitle(mode) {
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
    const [generating, setGenerating] = useState(false);
    const { userMode } = useUserMode();
    const { location, quality, effectiveArea, mainArea, balconyArea, storageBasementArea, parkingBasementArea, habitableBasementArea, basementArea, includePool, poolArea, poolDepth, poolQualityOption, poolTypeOption, siteCondition, groundwaterCondition, siteAccessibility, hvacCosts, kg200Total, kg300Total, kg400Total, kg500Total, kg600Cost, kg600SubgroupCosts, bathroomWcFurnishingSliceCost, permitDesignFee, contingencyCost, contractorCost, totalCost, constructionSubtotal, contingencyPercent, sizeCorrectionFactor, } = useEstimate();
    const handleGenerate = useCallback(async () => {
        if (generating)
            return;
        setGenerating(true);
        try {
            const enabledHvacNames = hvacCosts
                .filter((h) => h.enabled)
                .map((h) => h.option.name);
            const reportData = {
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
            }
            else {
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
                }
                else {
                    await Print.printAsync({ html });
                }
            }
        }
        catch (error) {
            console.log('PDF generation error:', error);
        }
        finally {
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
    return (_jsx(TouchableOpacity, { style: styles.generateButton, onPress: handleGenerate, activeOpacity: 0.8, disabled: generating, testID: "generate-report-button", children: _jsxs(LinearGradient, { colors: ['#D4782F', '#C06828'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 }, style: styles.generateButtonGradient, children: [generating ? (_jsx(ActivityIndicator, { size: "small", color: "#fff" })) : (_jsx(FileDown, { size: 18, color: "#fff" })), _jsx(Text, { style: styles.generateButtonText, children: generating ? 'Generating...' : 'Generate Client Report' })] }) }));
}
export default function BreakdownScreen() {
    const { location, quality, siteCondition, groundwaterCondition, landscapingArea, landscapingCost, balconyArea, storageBasementArea, parkingBasementArea, habitableBasementArea, basementArea, bathrooms, wcs, hvacCosts, mainArea, effectiveArea, correctedCostPerSqm, categoryCosts, contractorCost, contractorPercent, poolCost, includePool, poolArea, poolDepth, poolQualityOption, poolTypeOption, permitDesignFee, totalCost, utilityGroup220Cost, utilityGroup230Cost, kg200Total, kg300Total, kg300SubgroupCosts, kg400Total, kg500Total, kg600Cost, kg600SubgroupCosts, bathroomWcFurnishingSliceCost, constructionSubtotal, contingencyPercent, contingencyCost, siteExcavationCost, sizeCorrectionFactor, landValue, landAcquisitionCosts, landAcquisitionCostsMode, } = useEstimate();
    const sizeCorrectionLabel = getSizeCorrectionLabel(mainArea);
    const enabledHvac = hvacCosts.filter((h) => h.enabled);
    const displayedLandAcquisitionCosts = landAcquisitionCostsMode === 'auto'
        ? landValue * 0.06
        : landAcquisitionCosts;
    const basementSummary = formatBasementSummary(storageBasementArea, parkingBasementArea, habitableBasementArea);
    const group100Total = landValue + displayedLandAcquisitionCosts;
    const investmentTotal = totalCost + group100Total;
    const getCategoryCost = useCallback((id) => {
        var _a, _b;
        return (_b = (_a = categoryCosts.find((c) => c.category.id === id)) === null || _a === void 0 ? void 0 : _a.cost) !== null && _b !== void 0 ? _b : 0;
    }, [categoryCosts]);
    const dinGroups = useMemo(() => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45;
        const groups = [
            {
                code: '100',
                name: (_b = (_a = getDin276Group('100')) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : 'Land',
                subtotal: group100Total,
                percentOfTotal: investmentTotal > 0 ? (group100Total / investmentTotal) * 100 : 0,
                accentColor: '#7A5C3E',
                subgroups: [
                    {
                        code: '110',
                        name: (_d = (_c = getDin276Subgroup('110')) === null || _c === void 0 ? void 0 : _c.label) !== null && _d !== void 0 ? _d : 'Land Value',
                        cost: landValue,
                        icon: LandPlot,
                        visible: landValue > 0,
                    },
                    {
                        code: '120',
                        name: (_f = (_e = getDin276Subgroup('120')) === null || _e === void 0 ? void 0 : _e.label) !== null && _f !== void 0 ? _f : 'Incidental Land Acquisition Costs',
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
                name: (_h = (_g = getDin276Group('200')) === null || _g === void 0 ? void 0 : _g.label) !== null && _h !== void 0 ? _h : 'Preparatory Measures',
                subtotal: kg200Total,
                percentOfTotal: investmentTotal > 0 ? (kg200Total / investmentTotal) * 100 : 0,
                accentColor: '#8B6914',
                subgroups: [
                    {
                        code: '210',
                        name: (_k = (_j = getDin276Subgroup('210')) === null || _j === void 0 ? void 0 : _j.label) !== null && _k !== void 0 ? _k : 'Site Preparation',
                        cost: siteExcavationCost,
                        icon: Shovel,
                        sublabel: `Basic plot preparation ${MIDDLE_DOT} ${siteCondition.name}`,
                        visible: true,
                    },
                    {
                        code: '220',
                        name: (_m = (_l = getDin276Subgroup('220')) === null || _l === void 0 ? void 0 : _l.label) !== null && _m !== void 0 ? _m : 'Public Utilities Connections',
                        cost: utilityGroup220Cost,
                        icon: Plug,
                        sublabel: 'Public network connections',
                        visible: true,
                    },
                    {
                        code: '230',
                        name: (_p = (_o = getDin276Subgroup('230')) === null || _o === void 0 ? void 0 : _o.label) !== null && _p !== void 0 ? _p : 'Private Utilities Connections',
                        cost: utilityGroup230Cost,
                        icon: Cable,
                        sublabel: 'On-site pipes and cables',
                        visible: true,
                    },
                    {
                        code: '240',
                        name: (_r = (_q = getDin276Subgroup('240')) === null || _q === void 0 ? void 0 : _q.label) !== null && _r !== void 0 ? _r : 'Compensation Measures and Levies',
                        cost: 0,
                        icon: ClipboardCheck,
                        sublabel: 'Reserved for future logic',
                        visible: false,
                    },
                    {
                        code: '250',
                        name: (_t = (_s = getDin276Subgroup('250')) === null || _s === void 0 ? void 0 : _s.label) !== null && _t !== void 0 ? _t : 'Temporary Measures',
                        cost: 0,
                        icon: HardHat,
                        sublabel: 'Reserved for future logic',
                        visible: false,
                    },
                ],
            },
            {
                code: '300',
                name: (_v = (_u = getDin276Group('300')) === null || _u === void 0 ? void 0 : _u.label) !== null && _v !== void 0 ? _v : 'Building - Construction Works',
                subtotal: kg300Total,
                percentOfTotal: investmentTotal > 0 ? (kg300Total / investmentTotal) * 100 : 0,
                accentColor: '#1B3A4B',
                subgroups: [
                    {
                        code: '310',
                        name: (_x = (_w = getDin276Subgroup('310')) === null || _w === void 0 ? void 0 : _w.label) !== null && _x !== void 0 ? _x : 'Earthworks and Excavation',
                        cost: kg300SubgroupCosts.subgroup310Cost,
                        icon: Shovel,
                        sublabel: 'Excavation and earthworks for building construction',
                        visible: true,
                    },
                    {
                        code: '320',
                        name: (_z = (_y = getDin276Subgroup('320')) === null || _y === void 0 ? void 0 : _y.label) !== null && _z !== void 0 ? _z : 'Foundations and Substructure',
                        cost: kg300SubgroupCosts.subgroup320Cost,
                        icon: Building,
                        sublabel: 'Foundations and substructure',
                        visible: true,
                    },
                    {
                        code: '330',
                        name: (_1 = (_0 = getDin276Subgroup('330')) === null || _0 === void 0 ? void 0 : _0.label) !== null && _1 !== void 0 ? _1 : 'External Walls',
                        cost: kg300SubgroupCosts.subgroup330Cost,
                        icon: Layers,
                        sublabel: 'External walls, windows, exterior doors',
                        visible: true,
                    },
                    {
                        code: '340',
                        name: (_3 = (_2 = getDin276Subgroup('340')) === null || _2 === void 0 ? void 0 : _2.label) !== null && _3 !== void 0 ? _3 : 'Internal Walls',
                        cost: kg300SubgroupCosts.subgroup340Cost,
                        icon: LayoutGrid,
                        sublabel: 'Internal walls and interior doors',
                        visible: true,
                    },
                    {
                        code: '350',
                        name: (_5 = (_4 = getDin276Subgroup('350')) === null || _4 === void 0 ? void 0 : _4.label) !== null && _5 !== void 0 ? _5 : 'Floors and Slabs',
                        cost: kg300SubgroupCosts.subgroup350Cost,
                        icon: Paintbrush,
                        sublabel: 'Slabs and horizontal structural elements',
                        visible: true,
                    },
                    {
                        code: '360',
                        name: (_7 = (_6 = getDin276Subgroup('360')) === null || _6 === void 0 ? void 0 : _6.label) !== null && _7 !== void 0 ? _7 : 'Roofs',
                        cost: kg300SubgroupCosts.subgroup360Cost,
                        icon: Home,
                        sublabel: 'Roof structure, tiles/membrane, waterproofing, gutters',
                        visible: true,
                    },
                    {
                        code: '370',
                        name: (_9 = (_8 = getDin276Subgroup('370')) === null || _8 === void 0 ? void 0 : _8.label) !== null && _9 !== void 0 ? _9 : 'Infrastructure Installations',
                        cost: kg300SubgroupCosts.subgroup370Cost,
                        icon: Shield,
                        sublabel: 'Integrated construction-related infrastructure installations',
                        visible: kg300SubgroupCosts.subgroup370Cost > 0,
                    },
                    {
                        code: '380',
                        name: (_11 = (_10 = getDin276Subgroup('380')) === null || _10 === void 0 ? void 0 : _10.label) !== null && _11 !== void 0 ? _11 : 'Built-In Construction Elements',
                        cost: kg300SubgroupCosts.subgroup380Cost,
                        icon: Wrench,
                        sublabel: 'Built-in construction elements',
                        visible: kg300SubgroupCosts.subgroup380Cost > 0,
                    },
                    {
                        code: '390',
                        name: (_13 = (_12 = getDin276Subgroup('390')) === null || _12 === void 0 ? void 0 : _12.label) !== null && _13 !== void 0 ? _13 : 'Other Construction Works',
                        cost: kg300SubgroupCosts.subgroup390Cost,
                        icon: Hammer,
                        sublabel: 'Other building construction works',
                        visible: true,
                    },
                ],
            },
            {
                code: '400',
                name: (_15 = (_14 = getDin276Group('400')) === null || _14 === void 0 ? void 0 : _14.label) !== null && _15 !== void 0 ? _15 : 'Technical Systems',
                subtotal: kg400Total,
                percentOfTotal: investmentTotal > 0 ? (kg400Total / investmentTotal) * 100 : 0,
                accentColor: '#2D8B55',
                subgroups: [
                    {
                        code: '410',
                        name: (_17 = (_16 = getDin276Subgroup('410')) === null || _16 === void 0 ? void 0 : _16.label) !== null && _17 !== void 0 ? _17 : 'Sanitary / Plumbing',
                        cost: getCategoryCost('plumbing'),
                        icon: Droplets,
                        sublabel: 'Water supply, drainage, bathroom fittings',
                        visible: true,
                    },
                    {
                        code: '420',
                        name: (_19 = (_18 = getDin276Subgroup('420')) === null || _18 === void 0 ? void 0 : _18.label) !== null && _19 !== void 0 ? _19 : 'Heating',
                        cost: getCategoryCost('heating'),
                        icon: Thermometer,
                        sublabel: enabledHvac.some(h => h.option.id === 'underfloor_heating' || h.option.id === 'solar_thermal')
                            ? 'Heat pump, underfloor heating, solar thermal'
                            : 'Heat pump + fan-coils or VRV',
                        visible: true,
                    },
                    {
                        code: '430',
                        name: (_21 = (_20 = getDin276Subgroup('430')) === null || _20 === void 0 ? void 0 : _20.label) !== null && _21 !== void 0 ? _21 : 'Ventilation / Cooling',
                        cost: getCategoryCost('ventilation_cooling'),
                        icon: Wind,
                        sublabel: 'Ventilation, cooling, ducts, fan-coils',
                        visible: true,
                    },
                    {
                        code: '440',
                        name: (_23 = (_22 = getDin276Subgroup('440')) === null || _22 === void 0 ? void 0 : _22.label) !== null && _23 !== void 0 ? _23 : 'Electrical',
                        cost: getCategoryCost('electrical'),
                        icon: Zap,
                        sublabel: enabledHvac.some(h => h.option.id === 'photovoltaic')
                            ? 'Wiring, panels, lighting, PV-ready systems'
                            : 'Wiring, panels, sockets, lighting',
                        visible: true,
                    },
                    {
                        code: '450',
                        name: (_25 = (_24 = getDin276Subgroup('450')) === null || _24 === void 0 ? void 0 : _24.label) !== null && _25 !== void 0 ? _25 : 'Data / Security',
                        cost: getCategoryCost('data_security'),
                        icon: Shield,
                        sublabel: 'Data cabling, networking, alarm, access control',
                        visible: true,
                    },
                    {
                        code: '480',
                        name: (_27 = (_26 = getDin276Subgroup('480')) === null || _26 === void 0 ? void 0 : _26.label) !== null && _27 !== void 0 ? _27 : 'Automation / Smart Home',
                        cost: getCategoryCost('automation'),
                        icon: LayoutGrid,
                        sublabel: 'Building automation, controls, smart-home integration',
                        visible: true,
                    },
                ],
            },
            {
                code: '500',
                name: (_29 = (_28 = getDin276Group('500')) === null || _28 === void 0 ? void 0 : _28.label) !== null && _29 !== void 0 ? _29 : 'External Works and Open Spaces',
                subtotal: kg500Total,
                percentOfTotal: investmentTotal > 0 ? (kg500Total / investmentTotal) * 100 : 0,
                accentColor: '#6B8E23',
                subgroups: [
                    {
                        code: '510',
                        name: (_31 = (_30 = getDin276Subgroup('510')) === null || _30 === void 0 ? void 0 : _30.label) !== null && _31 !== void 0 ? _31 : 'Earthworks',
                        cost: landscapingCost > 0 ? Math.round(landscapingCost * 0.3) : 0,
                        icon: LandPlot,
                        sublabel: `Grading, retaining walls ${MIDDLE_DOT} ${siteCondition.name}`,
                        visible: landscapingCost > 0,
                    },
                    {
                        code: '520',
                        name: (_33 = (_32 = getDin276Subgroup('520')) === null || _32 === void 0 ? void 0 : _32.label) !== null && _33 !== void 0 ? _33 : 'Foundations and Substructure',
                        cost: landscapingCost > 0 ? Math.round(landscapingCost * 0.25) : 0,
                        icon: Hammer,
                        sublabel: 'Driveways, pathways, patios',
                        visible: landscapingCost > 0,
                    },
                    {
                        code: '530',
                        name: (_35 = (_34 = getDin276Subgroup('530')) === null || _34 === void 0 ? void 0 : _34.label) !== null && _35 !== void 0 ? _35 : 'Base Courses and Surface Layers',
                        cost: landscapingCost > 0 ? Math.round(landscapingCost * 0.25) : 0,
                        icon: Flower2,
                        sublabel: `${formatNumber(landscapingArea)} ${SQUARE_METER_UNIT} landscape area`,
                        visible: landscapingCost > 0,
                    },
                    {
                        code: '560',
                        name: (_37 = (_36 = getDin276Subgroup('560')) === null || _36 === void 0 ? void 0 : _36.label) !== null && _37 !== void 0 ? _37 : 'Built-In Elements in External Works and Open Spaces',
                        cost: poolCost + (landscapingCost > 0 ? landscapingCost - Math.round(landscapingCost * 0.3) - Math.round(landscapingCost * 0.25) - Math.round(landscapingCost * 0.25) : 0),
                        icon: Waves,
                        sublabel: includePool
                            ? `Pool ${formatNumber(poolArea)} ${SQUARE_METER_UNIT} ${MIDDLE_DOT} ${poolQualityOption.name} ${MIDDLE_DOT} ${poolTypeOption.name}`
                            : 'Irrigation, outdoor lighting',
                        visible: includePool || landscapingCost > 0,
                    },
                    {
                        code: '570',
                        name: (_39 = (_38 = getDin276Subgroup('570')) === null || _38 === void 0 ? void 0 : _38.label) !== null && _39 !== void 0 ? _39 : 'Green Areas',
                        cost: 0,
                        icon: Fence,
                        sublabel: 'Fences, gates, boundary walls',
                        visible: false,
                    },
                ],
            },
            {
                code: '600',
                name: (_41 = (_40 = getDin276Group('600')) === null || _40 === void 0 ? void 0 : _40.label) !== null && _41 !== void 0 ? _41 : 'Furnishings and Artworks',
                subtotal: kg600Cost,
                percentOfTotal: investmentTotal > 0 ? (kg600Cost / investmentTotal) * 100 : 0,
                accentColor: '#8B5CF6',
                subgroups: [
                    {
                        code: '610',
                        name: (_43 = (_42 = getDin276Subgroup('610')) === null || _42 === void 0 ? void 0 : _42.label) !== null && _43 !== void 0 ? _43 : 'General Furnishings',
                        cost: kg600SubgroupCosts.subgroup610Cost,
                        icon: Sofa,
                        sublabel: 'General movable furniture',
                        visible: kg600SubgroupCosts.subgroup610Cost > 0,
                    },
                    {
                        code: '620',
                        name: (_45 = (_44 = getDin276Subgroup('620')) === null || _44 === void 0 ? void 0 : _44.label) !== null && _45 !== void 0 ? _45 : 'Special Furnishings',
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
    return (_jsxs(View, { style: styles.outerContainer, children: [_jsx(ScenarioBar, {}), _jsxs(ScrollView, { style: styles.container, contentContainerStyle: styles.content, showsVerticalScrollIndicator: false, children: [_jsxs(View, { style: styles.assumptionsCard, children: [_jsx(Text, { style: styles.assumptionsTitle, children: "Assumptions" }), _jsxs(View, { style: styles.assumptionsGrid, children: [_jsxs(View, { style: styles.assumptionItem, children: [_jsx(Text, { style: styles.assumptionLabel, children: "Quality" }), _jsx(Text, { style: styles.assumptionValue, children: quality.name })] }), _jsxs(View, { style: styles.assumptionItem, children: [_jsx(Text, { style: styles.assumptionLabel, children: "Location" }), _jsxs(Text, { style: styles.assumptionValue, children: [location.name, " ($", MULTIPLY_SYMBOL, formatDecimal(location.multiplier, 2), ")"] })] }), _jsxs(View, { style: styles.assumptionItem, children: [_jsx(Text, { style: styles.assumptionLabel, children: "Site Conditions" }), _jsx(Text, { style: styles.assumptionValue, children: siteCondition.name })] }), _jsxs(View, { style: styles.assumptionItem, children: [_jsx(Text, { style: styles.assumptionLabel, children: "Groundwater" }), _jsx(Text, { style: styles.assumptionValue, children: groundwaterCondition.name })] }), basementArea > 0 && (_jsxs(View, { style: styles.assumptionItem, children: [_jsx(Text, { style: styles.assumptionLabel, children: "Basement" }), _jsx(Text, { style: styles.assumptionValue, children: basementSummary })] })), balconyArea > 0 && (_jsxs(View, { style: styles.assumptionItem, children: [_jsx(Text, { style: styles.assumptionLabel, children: "Balconies" }), _jsxs(Text, { style: styles.assumptionValue, children: [formatNumber(balconyArea), " ", SQUARE_METER_UNIT, " ($", formatPercent(30), ")"] })] })), landscapingArea > 0 && (_jsxs(View, { style: styles.assumptionItem, children: [_jsx(Text, { style: styles.assumptionLabel, children: "Landscaping Area" }), _jsxs(Text, { style: styles.assumptionValue, children: [formatNumber(landscapingArea), " ", SQUARE_METER_UNIT] })] })), _jsxs(View, { style: styles.assumptionItem, children: [_jsx(Text, { style: styles.assumptionLabel, children: "Bathrooms" }), _jsx(Text, { style: styles.assumptionValue, children: bathrooms })] }), _jsxs(View, { style: styles.assumptionItem, children: [_jsx(Text, { style: styles.assumptionLabel, children: "WCs" }), _jsx(Text, { style: styles.assumptionValue, children: wcs })] }), enabledHvac.map((h) => (_jsxs(View, { style: styles.assumptionItem, children: [_jsx(Text, { style: styles.assumptionLabel, children: h.option.name }), _jsx(Text, { style: styles.assumptionValue, children: formatCurrency(h.cost) })] }, h.option.id))), includePool && (_jsxs(View, { style: styles.assumptionItem, children: [_jsx(Text, { style: styles.assumptionLabel, children: "Swimming Pool" }), _jsxs(Text, { style: styles.assumptionValue, children: [formatNumber(poolArea), " ", SQUARE_METER_UNIT, " ", MIDDLE_DOT, " ", formatDecimal(poolDepth, 2), " m ", MIDDLE_DOT, " ", poolQualityOption.name, " ", MIDDLE_DOT, " ", poolTypeOption.name] })] })), _jsxs(View, { style: styles.assumptionItem, children: [_jsx(Text, { style: styles.assumptionLabel, children: "Effective Area" }), _jsxs(Text, { style: styles.assumptionValue, children: [formatNumber(effectiveArea), " ", SQUARE_METER_UNIT] })] }), _jsxs(View, { style: styles.assumptionItem, children: [_jsx(Text, { style: styles.assumptionLabel, children: `Corrected €/${SQUARE_METER_UNIT}` }), _jsx(Text, { style: styles.assumptionValue, children: `${formatCurrency(correctedCostPerSqm)}/${SQUARE_METER_UNIT}` })] }), sizeCorrectionFactor !== 1.0 && (_jsxs(View, { style: styles.assumptionItem, children: [_jsx(Text, { style: styles.assumptionLabel, children: "Size Adjustment" }), _jsx(Text, { style: styles.assumptionValue, children: sizeCorrectionLabel })] }))] })] }), _jsxs(View, { style: styles.dinSectionTitle, children: [_jsx(Text, { style: styles.dinSectionTitleText, children: "DIN 276 Cost Breakdown" }), _jsx(Text, { style: styles.dinBadge, children: "DIN 276" })] }), dinGroups.map((group) => (_jsx(CollapsibleGroup, { group: group }, group.code))), _jsxs(View, { style: styles.constructionSubtotalCard, children: [_jsx(Text, { style: styles.constructionSubtotalLabel, children: `Construction Subtotal (KG 300${EN_DASH}600)` }), _jsx(Text, { style: styles.constructionSubtotalValue, children: formatCurrency(constructionSubtotal) })] }), _jsxs(View, { style: styles.disclaimerInline, children: [_jsx(Info, { size: 12, color: Colors.textTertiary }), _jsx(Text, { style: styles.disclaimerInlineText, children: CONSTRUCTION_SUBTOTAL_DISCLAIMER })] }), _jsxs(View, { style: styles.overheadSection, children: [_jsx(Text, { style: styles.overheadTitle, children: "Risk & Overhead" }), _jsxs(View, { style: styles.overheadCard, children: [_jsxs(View, { style: styles.overheadRow, children: [_jsx(View, { style: styles.overheadIconWrap, children: _jsx(ShieldAlert, { size: 15, color: Colors.warning }) }), _jsxs(View, { style: styles.overheadInfo, children: [_jsx(Text, { style: styles.overheadLabel, children: "Construction Contingency" }), _jsx(Text, { style: styles.overheadSub, children: `${formatPercent(Math.round(contingencyPercent * 100))} risk reserve ${MIDDLE_DOT} ${quality.name} quality` })] }), _jsx(Text, { style: styles.overheadValue, children: formatCurrency(contingencyCost) })] }), _jsx(View, { style: styles.overheadDivider }), _jsxs(View, { style: styles.overheadRow, children: [_jsx(View, { style: styles.overheadIconWrap, children: _jsx(Wrench, { size: 15, color: Colors.primaryLight }) }), _jsxs(View, { style: styles.overheadInfo, children: [_jsx(Text, { style: styles.overheadLabel, children: "Contractor Overhead & Profit" }), _jsxs(Text, { style: styles.overheadSub, children: [formatPercent(contractorPercent, 1), " of construction subtotal"] })] }), _jsx(Text, { style: styles.overheadValue, children: formatCurrency(contractorCost) })] })] })] }), _jsxs(TouchableOpacity, { style: styles.permitDesignLink, onPress: () => Linking.openURL(PERMIT_DESIGN_CONTACT_URL), activeOpacity: 0.7, testID: "breakdown-permit-design-link", children: [_jsx(Text, { style: styles.permitDesignLinkText, children: PERMIT_DESIGN_CONTACT_LABEL }), _jsx(ExternalLink, { size: 13, color: Colors.accent })] }), _jsxs(View, { style: styles.grandTotalCard, children: [_jsxs(View, { style: styles.grandTotalRow, children: [_jsx(Text, { style: styles.grandTotalLabel, children: "Total Project Cost" }), _jsx(Text, { style: styles.grandTotalValue, children: formatCurrency(investmentTotal) })] }), _jsx(View, { style: styles.grandTotalBreakdown, children: _jsx(Text, { style: styles.grandTotalBreakdownText, children: `KG 100 ${formatCurrency(group100Total)} + KG 200 ${formatCurrency(kg200Total)} + KG 300${EN_DASH}600 ${formatCurrency(constructionSubtotal)} + KG 500 ${formatCurrency(kg500Total)} + KG 700 ${formatCurrency(permitDesignFee)} + Contingency ${formatCurrency(contingencyCost)} + Overhead ${formatCurrency(contractorCost)}` }) })] }), _jsxs(View, { style: styles.vatCard, children: [_jsxs(View, { style: styles.vatRow, children: [_jsx(Text, { style: styles.vatLabel, children: "+ VAT (24 %)" }), _jsx(Text, { style: styles.vatValue, children: formatCurrency(Math.round(totalCost * 0.24)) })] }), _jsx(View, { style: styles.vatDivider }), _jsxs(View, { style: styles.vatRow, children: [_jsx(Text, { style: styles.vatTotalLabel, children: "Total incl. VAT" }), _jsx(Text, { style: styles.vatTotalValue, children: formatCurrency(Math.round(totalCost * 1.24)) })] }), _jsx(Text, { style: styles.vatNote, children: "VAT calculated using the current Greek construction VAT rate (24%)." })] }), _jsxs(View, { style: styles.disclaimer, children: [_jsx(Info, { size: 14, color: Colors.textTertiary, style: styles.disclaimerIcon }), _jsx(Text, { style: styles.disclaimerText, children: DISCLAIMER_TEXT })] }), _jsx(GenerateReportButton, {}), _jsx(View, { style: styles.bottomSpacer })] })] }));
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
        fontWeight: '700',
        color: Colors.textTertiary,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    assumptionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
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
        fontWeight: '600',
    },
    assumptionValue: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '700',
        marginTop: 1,
    },
    dinSectionTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 12,
    },
    dinSectionTitleText: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.text,
        letterSpacing: 0.3,
    },
    dinBadge: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.accent,
        backgroundColor: Colors.accentBg,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        overflow: 'hidden',
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
        overflow: 'hidden',
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    groupAccentBar: {
        width: 4,
    },
    groupHeaderContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 14,
    },
    groupHeaderLeft: {
        flex: 1,
        marginRight: 12,
    },
    groupCode: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textTertiary,
        letterSpacing: 0.5,
    },
    groupName: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
        marginTop: 2,
    },
    groupHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    groupCostColumn: {
        alignItems: 'flex-end',
    },
    groupSubtotal: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.primary,
        fontVariant: ['tabular-nums'],
    },
    groupPercent: {
        fontSize: 11,
        fontWeight: '600',
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 9,
    },
    subgroupIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 7,
        backgroundColor: Colors.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    subgroupInfo: {
        flex: 1,
        marginRight: 8,
    },
    subgroupNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    subgroupCode: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textTertiary,
        backgroundColor: Colors.inputBg,
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 3,
        overflow: 'hidden',
    },
    subgroupName: {
        fontSize: 13,
        fontWeight: '600',
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
        fontWeight: '700',
        color: Colors.primary,
        fontVariant: ['tabular-nums'],
    },
    constructionSubtotalCard: {
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
    },
    constructionSubtotalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
        flexShrink: 1,
    },
    constructionSubtotalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.heroText,
    },
    disclaimerInline: {
        flexDirection: 'row',
        alignItems: 'flex-start',
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
        fontWeight: '700',
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    overheadIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: Colors.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overheadInfo: {
        flex: 1,
        minWidth: 100,
    },
    overheadLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
    },
    overheadSub: {
        fontSize: 11,
        color: Colors.textTertiary,
        marginTop: 1,
    },
    overheadValue: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.primary,
        fontVariant: ['tabular-nums'],
    },
    overheadDivider: {
        height: 1,
        backgroundColor: Colors.borderLight,
        marginVertical: 10,
    },
    permitDesignLink: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
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
        fontWeight: '700',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
    },
    grandTotalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.primary,
        flexShrink: 1,
    },
    grandTotalValue: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.primary,
        fontVariant: ['tabular-nums'],
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
    bottomSpacer: {
        height: 20,
    },
    generateButton: {
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 14,
        overflow: 'hidden',
    },
    generateButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 10,
    },
    generateButtonText: {
        fontSize: 15,
        fontWeight: '700',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
    },
    vatLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    vatValue: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textSecondary,
        fontVariant: ['tabular-nums'],
    },
    vatDivider: {
        height: 1,
        backgroundColor: Colors.borderLight,
        marginVertical: 10,
    },
    vatTotalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.primary,
    },
    vatTotalValue: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.primary,
        fontVariant: ['tabular-nums'],
    },
    vatNote: {
        fontSize: 11,
        color: Colors.textTertiary,
        marginTop: 8,
        lineHeight: 15,
    },
});
