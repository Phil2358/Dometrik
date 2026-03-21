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
exports.default = BreakdownScreen;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const ScenarioBar_1 = __importDefault(require("@/components/ScenarioBar"));
const expo_linear_gradient_1 = require("expo-linear-gradient");
const Print = __importStar(require("expo-print"));
const Sharing = __importStar(require("expo-sharing"));
const lucide_react_native_1 = require("lucide-react-native");
const colors_1 = __importDefault(require("@/constants/colors"));
const EstimateContext_1 = require("@/contexts/EstimateContext");
const UserModeContext_1 = require("@/contexts/UserModeContext");
const construction_1 = require("@/constants/construction");
const din276Groups_1 = require("@/constants/din276Groups");
const generateClientReportHtml_1 = require("@/utils/generateClientReportHtml");
const computeScenarioCosts_1 = require("@/utils/computeScenarioCosts");
const format_1 = require("@/utils/format");
if (react_native_1.Platform.OS === 'android' && react_native_1.UIManager.setLayoutAnimationEnabledExperimental) {
    react_native_1.UIManager.setLayoutAnimationEnabledExperimental(true);
}
const MULTIPLY_SYMBOL = '\u00D7';
const MIDDLE_DOT = '\u00B7';
const EN_DASH = '\u2013';
const SQUARE_METER_UNIT = 'm\u00B2';
const GROUP_ACCENT_COLORS = {
    '100': '#7A5C3E',
    '200': '#8B6914',
    '300': '#1B3A4B',
    '400': '#2D8B55',
    '500': '#6B8E23',
    '600': '#8B5CF6',
    '700': '#D4782F',
};
const SUBGROUP_ICONS = {
    '110': lucide_react_native_1.LandPlot,
    '120': lucide_react_native_1.Landmark,
    '210': lucide_react_native_1.Shovel,
    '220': lucide_react_native_1.Plug,
    '230': lucide_react_native_1.Cable,
    '240': lucide_react_native_1.ClipboardCheck,
    '250': lucide_react_native_1.HardHat,
    '310': lucide_react_native_1.Shovel,
    '320': lucide_react_native_1.Building,
    '330': lucide_react_native_1.Layers,
    '340': lucide_react_native_1.LayoutGrid,
    '350': lucide_react_native_1.Paintbrush,
    '360': lucide_react_native_1.Home,
    '370': lucide_react_native_1.Shield,
    '380': lucide_react_native_1.Wrench,
    '390': lucide_react_native_1.Hammer,
    '410': lucide_react_native_1.Droplets,
    '420': lucide_react_native_1.Thermometer,
    '430': lucide_react_native_1.Wind,
    '440': lucide_react_native_1.Zap,
    '450': lucide_react_native_1.Shield,
    '480': lucide_react_native_1.LayoutGrid,
    '510': lucide_react_native_1.LandPlot,
    '530': lucide_react_native_1.Hammer,
    '560': lucide_react_native_1.Fence,
    '570': lucide_react_native_1.Flower2,
    '580': lucide_react_native_1.Waves,
    '610': lucide_react_native_1.Sofa,
    '620': lucide_react_native_1.Bath,
    '710': lucide_react_native_1.PenTool,
    '720': lucide_react_native_1.FileText,
    '750': lucide_react_native_1.ClipboardCheck,
};
function getSubgroupSublabel(subgroup, context) {
    var _a, _b, _c, _d, _e, _f, _g;
    switch (subgroup.code) {
        case '120':
            return ((_a = subgroup.meta) === null || _a === void 0 ? void 0 : _a.mode) === 'auto'
                ? `${(0, format_1.formatCurrency)(subgroup.cost)} (${(0, format_1.formatPercent)(Number((_c = (_b = subgroup.meta) === null || _b === void 0 ? void 0 : _b.ratePercent) !== null && _c !== void 0 ? _c : 0))} of ${(0, format_1.formatCurrency)(Number((_e = (_d = subgroup.meta) === null || _d === void 0 ? void 0 : _d.landValue) !== null && _e !== void 0 ? _e : 0))})`
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
            return `${(0, format_1.formatNumber)(context.landscapingArea)} ${SQUARE_METER_UNIT} landscape area`;
        case '580':
            return `Pool ${(0, format_1.formatNumber)(context.poolArea)} ${SQUARE_METER_UNIT} ${MIDDLE_DOT} ${context.poolQualityName} ${MIDDLE_DOT} ${context.poolTypeName}`;
        case '610':
            return `Bedroom packages ${MIDDLE_DOT} area-based furniture allowance ${MIDDLE_DOT} kitchen furniture packages`;
        case '620':
            return Number((_g = (_f = subgroup.meta) === null || _f === void 0 ? void 0 : _f.bathroomWcFurnishingSliceCost) !== null && _g !== void 0 ? _g : 0) !== 0
                ? `Kitchen ${MIDDLE_DOT} built-in wardrobes ${MIDDLE_DOT} bathroom/WC furnishing slices`
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
function CollapsibleGroup({ group }) {
    const [expanded, setExpanded] = (0, react_1.useState)(true);
    const toggle = (0, react_1.useCallback)(() => {
        react_native_1.LayoutAnimation.configureNext(react_native_1.LayoutAnimation.Presets.easeInEaseOut);
        setExpanded((prev) => !prev);
    }, []);
    const visibleSubgroups = group.subgroups.filter((s) => s.visible);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupContainer, children: [(0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { style: styles.groupHeader, onPress: toggle, activeOpacity: 0.7, testID: `group-header-${group.code}`, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.groupAccentBar, { backgroundColor: group.accentColor }] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupHeaderContent, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupHeaderLeft, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupCode, children: group.code }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupName, children: group.name })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupHeaderRight, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.groupCostColumn, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupSubtotal, children: (0, format_1.formatCurrency)(group.subtotal) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.groupPercent, children: (0, format_1.formatPercent)(group.percentOfTotal, 1) })] }), expanded ? ((0, jsx_runtime_1.jsx)(lucide_react_native_1.ChevronDown, { size: 18, color: colors_1.default.textTertiary })) : ((0, jsx_runtime_1.jsx)(lucide_react_native_1.ChevronRight, { size: 18, color: colors_1.default.textTertiary }))] })] })] }), expanded && visibleSubgroups.length > 0 && ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.subgroupList, children: visibleSubgroups.map((item) => ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.subgroupRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.subgroupIconWrap, children: (0, jsx_runtime_1.jsx)(item.icon, { size: 15, color: group.accentColor }) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.subgroupInfo, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.subgroupNameRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.subgroupCode, children: item.code }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.subgroupName, children: item.name })] }), item.sublabel ? ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.subgroupSublabel, children: item.sublabel })) : null] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.subgroupCost, children: (0, format_1.formatCurrency)(item.cost) })] }, item.code))) }))] }));
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
    const [generating, setGenerating] = (0, react_1.useState)(false);
    const { userMode } = (0, UserModeContext_1.useUserMode)();
    const { location, quality, buildingArea, mainArea, terraceArea, balconyArea, baseBuildingAreaBenchmarkContribution, coveredTerracesBenchmarkContribution, balconyAreaBenchmarkContribution, totalBenchmarkContributionBeforeGroupAllocation, storageBasementArea, parkingBasementArea, habitableBasementArea, basementArea, includePool, poolArea, poolDepth, poolQualityOption, poolTypeOption, siteCondition, groundwaterCondition, siteAccessibility, hvacCosts, kg200Total, kg300Total, kg400Total, kg500Total, kg600Cost, kg600SubgroupCosts, bathroomWcFurnishingSliceCost, basementBaseCost, basementKg300Total, basementBucket400, permitDesignFee, contingencyCost, contractorCost, projectTotalBeforeVat, estimatedRangeLow, estimatedRangeHigh, constructionSubtotal, contingencyPercent, sizeCorrectionFactor, } = (0, EstimateContext_1.useEstimate)();
    const handleGenerate = (0, react_1.useCallback)(async () => {
        if (generating)
            return;
        setGenerating(true);
        try {
            const enabledHvacNames = hvacCosts
                .filter((h) => h.enabled)
                .map((h) => h.option.name);
            const reportData = {
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
            const html = (0, generateClientReportHtml_1.generateClientReportHtml)(reportData, reportTitle);
            const sanitizedLocation = location.name.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `Project_Cost_Estimate_${sanitizedLocation}`;
            if (react_native_1.Platform.OS === 'web') {
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
        generating, location, quality, buildingArea, mainArea, terraceArea, balconyArea, basementArea,
        storageBasementArea, parkingBasementArea, habitableBasementArea,
        includePool, poolArea, poolDepth, poolQualityOption, poolTypeOption,
        siteCondition, groundwaterCondition, siteAccessibility, hvacCosts, kg200Total, kg300Total, kg400Total, kg500Total,
        kg600Cost, baseBuildingAreaBenchmarkContribution, coveredTerracesBenchmarkContribution, balconyAreaBenchmarkContribution, totalBenchmarkContributionBeforeGroupAllocation, permitDesignFee, contingencyCost, contractorCost, projectTotalBeforeVat, estimatedRangeLow, estimatedRangeHigh,
        constructionSubtotal, basementBaseCost, basementKg300Total, basementBucket400, contingencyPercent, sizeCorrectionFactor,
        userMode,
    ]);
    return ((0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { style: styles.generateButton, onPress: handleGenerate, activeOpacity: 0.8, disabled: generating, testID: "generate-report-button", children: (0, jsx_runtime_1.jsxs)(expo_linear_gradient_1.LinearGradient, { colors: ['#D4782F', '#C06828'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 }, style: styles.generateButtonGradient, children: [generating ? ((0, jsx_runtime_1.jsx)(react_native_1.ActivityIndicator, { size: "small", color: "#fff" })) : ((0, jsx_runtime_1.jsx)(lucide_react_native_1.FileDown, { size: 18, color: "#fff" })), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.generateButtonText, children: generating ? 'Generating...' : 'Generate Client Report' })] }) }));
}
function BreakdownScreen() {
    const { location, quality, siteCondition, groundwaterCondition, landscapingArea, terraceArea, balconyArea, storageBasementArea, parkingBasementArea, habitableBasementArea, basementArea, bathrooms, wcs, hvacCosts, mainArea, buildingArea, basementBenchmarkRate, basementKg300Total, basementBucket400, coveredTerracesBenchmarkContribution, balconyAreaBenchmarkContribution, basementBaseCost, breakdownGroups, contractorCost, contractorPercent, vatPercent, vatAmount, efkaInsuranceAmount, includePool, poolArea, poolDepth, poolQualityOption, poolTypeOption, permitDesignFee, projectTotalBeforeVat, totalCostInclVat, group100Total, kg200Total, kg500Total, constructionSubtotal, contingencyPercent, contingencyCost, sizeCorrectionFactor, } = (0, EstimateContext_1.useEstimate)();
    const sizeCorrectionLabel = (0, construction_1.formatSizeCorrectionFactorLabel)(sizeCorrectionFactor);
    const enabledHvac = hvacCosts.filter((h) => h.enabled);
    const basementSummary = (0, computeScenarioCosts_1.formatBasementSummary)(storageBasementArea, parkingBasementArea, habitableBasementArea);
    const investmentTotal = projectTotalBeforeVat;
    const dinGroups = (0, react_1.useMemo)(() => {
        const enabledHvacIds = new Set(enabledHvac.map((item) => item.option.id));
        return breakdownGroups.map((group) => {
            var _a, _b, _c;
            return ({
                code: group.code,
                name: (_b = (_a = (0, din276Groups_1.getDin276Group)(group.code)) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : `KG ${group.code}`,
                subtotal: group.subtotal,
                percentOfTotal: group.percentOfTotal,
                accentColor: (_c = GROUP_ACCENT_COLORS[group.code]) !== null && _c !== void 0 ? _c : colors_1.default.accent,
                subgroups: group.subgroups.map((subgroup) => {
                    var _a, _b, _c;
                    return ({
                        code: subgroup.code,
                        name: (_b = (_a = (0, din276Groups_1.getDin276Subgroup)(subgroup.code)) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : subgroup.code,
                        cost: subgroup.cost,
                        icon: (_c = SUBGROUP_ICONS[subgroup.code]) !== null && _c !== void 0 ? _c : lucide_react_native_1.Hammer,
                        sublabel: getSubgroupSublabel(subgroup, {
                            siteConditionName: siteCondition.name,
                            landscapingArea,
                            poolArea,
                            poolQualityName: poolQualityOption.name,
                            poolTypeName: poolTypeOption.name,
                            enabledHvacIds,
                        }),
                        visible: subgroup.visible,
                    });
                }),
            });
        });
    }, [
        breakdownGroups,
        enabledHvac,
        landscapingArea,
        poolArea,
        poolQualityOption,
        poolTypeOption,
        siteCondition,
    ]);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.outerContainer, children: [(0, jsx_runtime_1.jsx)(ScenarioBar_1.default, {}), (0, jsx_runtime_1.jsxs)(react_native_1.ScrollView, { style: styles.container, contentContainerStyle: styles.content, showsVerticalScrollIndicator: false, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionsCard, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionsTitle, children: "Assumptions" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionsGrid, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: "Quality" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionValue, children: quality.name })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: "Location" }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.assumptionValue, children: [location.name, " ($", MULTIPLY_SYMBOL, (0, format_1.formatDecimal)(location.multiplier, 2), ")"] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: "Site Conditions" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionValue, children: siteCondition.name })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: "Groundwater" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionValue, children: groundwaterCondition.name })] }), basementArea > 0 && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: "Basement" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionValue, children: basementSummary })] })), basementBaseCost > 0 && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: "Basement DIN contribution" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionValue, children: `${(0, format_1.formatCurrency)(basementBaseCost)} included in KG 300/KG 400 (${(0, format_1.formatCurrency)(basementKg300Total)} + ${(0, format_1.formatCurrency)(basementBucket400)})` })] })), terraceArea > 0 && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: "Covered Terraces" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionValue, children: `${(0, format_1.formatNumber)(terraceArea)} ${SQUARE_METER_UNIT} (${(0, format_1.formatPercent)(50)}) ${MIDDLE_DOT} ${(0, format_1.formatCurrency)(coveredTerracesBenchmarkContribution)} benchmark contribution` })] })), balconyArea > 0 && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: "Balcony Area" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionValue, children: `${(0, format_1.formatNumber)(balconyArea)} ${SQUARE_METER_UNIT} (${(0, format_1.formatPercent)(30)}) ${MIDDLE_DOT} ${(0, format_1.formatCurrency)(balconyAreaBenchmarkContribution)} benchmark contribution` })] })), landscapingArea > 0 && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: "Landscaping Area" }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.assumptionValue, children: [(0, format_1.formatNumber)(landscapingArea), " ", SQUARE_METER_UNIT] })] })), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: "Bathrooms" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionValue, children: bathrooms })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: "WCs" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionValue, children: wcs })] }), enabledHvac.map((h) => ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: h.option.name }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionValue, children: (0, format_1.formatCurrency)(h.cost) })] }, h.option.id))), includePool && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: "Swimming Pool" }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.assumptionValue, children: [(0, format_1.formatNumber)(poolArea), " ", SQUARE_METER_UNIT, " ", MIDDLE_DOT, " ", (0, format_1.formatDecimal)(poolDepth, 2), " m ", MIDDLE_DOT, " ", poolQualityOption.name, " ", MIDDLE_DOT, " ", poolTypeOption.name] })] })), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: "Building Area" }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.assumptionValue, children: [(0, format_1.formatNumber)(buildingArea), " ", SQUARE_METER_UNIT] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: `Corrected €/${SQUARE_METER_UNIT}` }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionValue, children: `${(0, format_1.formatCurrency)(basementBenchmarkRate)}/${SQUARE_METER_UNIT}` })] }), sizeCorrectionFactor !== 1.0 && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assumptionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionLabel, children: "Size Adjustment" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.assumptionValue, children: sizeCorrectionLabel })] }))] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.dinSectionTitle, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.dinSectionTitleText, children: "DIN 276 Cost Breakdown" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.dinBadge, children: "DIN 276" })] }), dinGroups.map((group) => ((0, jsx_runtime_1.jsx)(CollapsibleGroup, { group: group }, group.code))), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.constructionSubtotalCard, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.constructionSubtotalLabel, children: `Construction Subtotal (KG 300${EN_DASH}600)` }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.constructionSubtotalValue, children: (0, format_1.formatCurrency)(constructionSubtotal) })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.disclaimerInline, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.Info, { size: 12, color: colors_1.default.textTertiary }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.disclaimerInlineText, children: construction_1.CONSTRUCTION_SUBTOTAL_DISCLAIMER })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.overheadSection, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.overheadTitle, children: "Risk & Overhead" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.overheadCard, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.overheadRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.overheadIconWrap, children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.ShieldAlert, { size: 15, color: colors_1.default.warning }) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.overheadInfo, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.overheadLabel, children: "Construction Contingency" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.overheadSub, children: `${(0, format_1.formatPercent)(Math.round(contingencyPercent * 100))} risk reserve ${MIDDLE_DOT} ${quality.name} quality` })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.overheadValue, children: (0, format_1.formatCurrency)(contingencyCost) })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.overheadDivider }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.overheadRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.overheadIconWrap, children: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Wrench, { size: 15, color: colors_1.default.primaryLight }) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.overheadInfo, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.overheadLabel, children: "Contractor Overhead & Profit" }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.overheadSub, children: [(0, format_1.formatPercent)(contractorPercent, 1), " of construction subtotal"] })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.overheadValue, children: (0, format_1.formatCurrency)(contractorCost) })] })] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.grandTotalCard, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.grandTotalRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.grandTotalLabel, children: "Total Project Cost" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.grandTotalValue, children: (0, format_1.formatCurrency)(investmentTotal) })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.grandTotalBreakdown, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.grandTotalBreakdownText, children: `KG 100 ${(0, format_1.formatCurrency)(group100Total)} + KG 200 ${(0, format_1.formatCurrency)(kg200Total)} + KG 300${EN_DASH}600 ${(0, format_1.formatCurrency)(constructionSubtotal)} + KG 500 ${(0, format_1.formatCurrency)(kg500Total)} + KG 700 ${(0, format_1.formatCurrency)(permitDesignFee)} + e-EFKA ${(0, format_1.formatCurrency)(efkaInsuranceAmount)} + Contingency ${(0, format_1.formatCurrency)(contingencyCost)} + Overhead ${(0, format_1.formatCurrency)(contractorCost)}` }) })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.vatCard, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.vatRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.vatLabel, children: `+ VAT (${(0, format_1.formatPercent)(vatPercent, vatPercent % 1 === 0 ? 0 : 1)})` }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.vatValue, children: (0, format_1.formatCurrency)(vatAmount) })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.vatDivider }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.vatRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.vatTotalLabel, children: "Total incl. VAT" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.vatTotalValue, children: (0, format_1.formatCurrency)(totalCostInclVat) })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.vatNote, children: `VAT calculated from the current pre-VAT project total using the selected ${(0, format_1.formatPercent)(vatPercent, vatPercent % 1 === 0 ? 0 : 1)} rate.` })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.disclaimer, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.Info, { size: 14, color: colors_1.default.textTertiary, style: styles.disclaimerIcon }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.disclaimerText, children: construction_1.DISCLAIMER_TEXT })] }), (0, jsx_runtime_1.jsx)(GenerateReportButton, {}), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.bottomSpacer })] })] }));
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
    },
    assumptionsCard: {
        marginHorizontal: 16,
        marginTop: 12,
        backgroundColor: colors_1.default.card,
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
        color: colors_1.default.textTertiary,
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
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    assumptionLabel: {
        fontSize: 10,
        color: colors_1.default.textTertiary,
        fontWeight: '600',
    },
    assumptionValue: {
        fontSize: 12,
        color: colors_1.default.primary,
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
        color: colors_1.default.text,
        letterSpacing: 0.3,
    },
    dinBadge: {
        fontSize: 11,
        fontWeight: '700',
        color: colors_1.default.accent,
        backgroundColor: colors_1.default.accentBg,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        overflow: 'hidden',
    },
    groupContainer: {
        marginHorizontal: 16,
        marginBottom: 10,
        backgroundColor: colors_1.default.card,
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
        color: colors_1.default.textTertiary,
        letterSpacing: 0.5,
    },
    groupName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors_1.default.text,
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
        color: colors_1.default.primary,
        fontVariant: ['tabular-nums'],
    },
    groupPercent: {
        fontSize: 11,
        fontWeight: '600',
        color: colors_1.default.textTertiary,
        marginTop: 1,
    },
    subgroupList: {
        borderTopWidth: 1,
        borderTopColor: colors_1.default.borderLight,
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
        backgroundColor: colors_1.default.inputBg,
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
        color: colors_1.default.textTertiary,
        backgroundColor: colors_1.default.inputBg,
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 3,
        overflow: 'hidden',
    },
    subgroupName: {
        fontSize: 13,
        fontWeight: '600',
        color: colors_1.default.text,
        flexShrink: 1,
    },
    subgroupSublabel: {
        fontSize: 11,
        color: colors_1.default.textTertiary,
        marginTop: 2,
        lineHeight: 15,
    },
    subgroupCost: {
        fontSize: 14,
        fontWeight: '700',
        color: colors_1.default.primary,
        fontVariant: ['tabular-nums'],
    },
    constructionSubtotalCard: {
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: colors_1.default.primary,
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
        color: colors_1.default.heroText,
    },
    basementCard: {
        marginHorizontal: 16,
        marginTop: 10,
        backgroundColor: colors_1.default.card,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: colors_1.default.borderLight,
    },
    basementHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    basementTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors_1.default.text,
    },
    basementTotal: {
        fontSize: 18,
        fontWeight: '800',
        color: colors_1.default.primary,
        fontVariant: ['tabular-nums'],
    },
    basementRate: {
        fontSize: 11,
        color: colors_1.default.textTertiary,
        marginTop: 4,
        marginBottom: 8,
    },
    basementRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 6,
        borderTopWidth: 1,
        borderTopColor: colors_1.default.borderLight,
    },
    basementLabel: {
        flex: 1,
        fontSize: 12,
        color: colors_1.default.textSecondary,
    },
    basementValue: {
        fontSize: 13,
        fontWeight: '700',
        color: colors_1.default.primary,
        fontVariant: ['tabular-nums'],
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
        color: colors_1.default.textTertiary,
        lineHeight: 16,
    },
    overheadSection: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    overheadTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors_1.default.text,
        letterSpacing: 0.3,
        marginBottom: 8,
    },
    overheadCard: {
        backgroundColor: colors_1.default.card,
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
        backgroundColor: colors_1.default.inputBg,
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
        color: colors_1.default.text,
    },
    overheadSub: {
        fontSize: 11,
        color: colors_1.default.textTertiary,
        marginTop: 1,
    },
    overheadValue: {
        fontSize: 15,
        fontWeight: '700',
        color: colors_1.default.primary,
        fontVariant: ['tabular-nums'],
    },
    overheadDivider: {
        height: 1,
        backgroundColor: colors_1.default.borderLight,
        marginVertical: 10,
    },
    grandTotalCard: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: colors_1.default.card,
        borderRadius: 14,
        padding: 18,
        borderWidth: 2,
        borderColor: colors_1.default.primary,
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
        color: colors_1.default.primary,
        flexShrink: 1,
    },
    grandTotalValue: {
        fontSize: 22,
        fontWeight: '800',
        color: colors_1.default.primary,
        fontVariant: ['tabular-nums'],
    },
    grandTotalBreakdown: {
        marginTop: 8,
    },
    grandTotalBreakdownText: {
        fontSize: 11,
        color: colors_1.default.textTertiary,
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
        color: colors_1.default.textTertiary,
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
        backgroundColor: colors_1.default.card,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: colors_1.default.borderLight,
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
        color: colors_1.default.textSecondary,
    },
    vatValue: {
        fontSize: 16,
        fontWeight: '700',
        color: colors_1.default.textSecondary,
        fontVariant: ['tabular-nums'],
    },
    vatDivider: {
        height: 1,
        backgroundColor: colors_1.default.borderLight,
        marginVertical: 10,
    },
    vatTotalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: colors_1.default.primary,
    },
    vatTotalValue: {
        fontSize: 20,
        fontWeight: '800',
        color: colors_1.default.primary,
        fontVariant: ['tabular-nums'],
    },
    vatNote: {
        fontSize: 11,
        color: colors_1.default.textTertiary,
        marginTop: 8,
        lineHeight: 15,
    },
});
