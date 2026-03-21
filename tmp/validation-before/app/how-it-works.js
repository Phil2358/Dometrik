"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HowItWorksScreen;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const expo_router_1 = require("expo-router");
const lucide_react_native_1 = require("lucide-react-native");
const colors_1 = __importDefault(require("@/constants/colors"));
const construction_1 = require("@/constants/construction");
function SectionCard({ title, icon: Icon, children }) {
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.sectionCard, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.sectionCardHeader, children: [(0, jsx_runtime_1.jsx)(Icon, { size: 16, color: colors_1.default.accent }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.sectionCardTitle, children: title })] }), children] }));
}
function HowItWorksScreen() {
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(expo_router_1.Stack.Screen, { options: { title: 'How the Estimate Works' } }), (0, jsx_runtime_1.jsxs)(react_native_1.ScrollView, { style: styles.container, contentContainerStyle: styles.content, showsVerticalScrollIndicator: false, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.heroCard, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.BookOpen, { size: 28, color: colors_1.default.accent }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.heroTitle, children: "How the Estimate Works" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.heroSubtext, children: "This page explains the calculation logic behind Dometrik to ensure full transparency." })] }), (0, jsx_runtime_1.jsxs)(SectionCard, { title: "Overview", icon: lucide_react_native_1.Info, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bodyText, children: "The estimate is based on three components:" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.bulletList, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 Base building cost per square meter (KG 300 + 400 + 600)" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 Site-specific adjustments (KG 200, KG 500)" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 Project-specific inputs (fees, contingency, contractor overhead)" })] })] }), (0, jsx_runtime_1.jsx)(SectionCard, { title: "Cost Calculation Structure", icon: lucide_react_native_1.Layers, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.formulaCard, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaLine, children: "Base building cost" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaDetail, children: "= \u20AC /m\u00B2 \u00D7 building area (+ size correction)" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.formulaDivider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaLine, children: "+ Site preparation costs (KG 200)" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaDetail, children: "Excavation, utilities, basement excavation" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.formulaDivider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaLine, children: "+ External works (KG 500)" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaDetail, children: "Landscaping, pool, outdoor areas" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.formulaDivider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaLine, children: "+ Professional fees (KG 700)" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaDetail, children: "Architecture, engineering, permits" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.formulaDivider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaLine, children: "+ Contractor overhead & profit" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaDetail, children: "Percentage of construction cost" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.formulaDivider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaLine, children: "+ Construction contingency" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaDetail, children: "Risk reserve based on quality level" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.formulaTotalDivider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaTotal, children: "= Total project cost" })] }) }), (0, jsx_runtime_1.jsxs)(SectionCard, { title: "What's Included in the Base \u20AC /m\u00B2", icon: lucide_react_native_1.Home, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bodyText, children: "The base construction cost per square meter represents a standard reference building and includes:" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.bulletList, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 KG 300 \u2013 Building construction (structure, walls, roof, insulation, windows, interior finishes)" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 KG 400 \u2013 Technical systems (HVAC, electrical, plumbing)" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 KG 600 \u2013 Built-in equipment (kitchen, built-in wardrobes, fixtures)" })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.infoBox, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.infoBoxText, children: "Typical assumptions: reinforced concrete structure, masonry walls with ETICS insulation, standard windows, basic HVAC system (heat pump + fan-coils or VRV), standard electrical and plumbing installations, standard interior finishes, basic bathroom fixtures." }) })] }), (0, jsx_runtime_1.jsxs)(SectionCard, { title: "What's NOT Included in the Base \u20AC /m\u00B2", icon: lucide_react_native_1.Info, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bodyText, children: "The following cost groups are calculated separately:" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.bulletList, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 KG 200 \u2013 Site preparation & utilities" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 KG 500 \u2013 External works (landscaping, pool)" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 KG 700 \u2013 Planning & professional fees" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 Contractor overhead and profit" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 Construction contingency" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 VAT" })] })] }), (0, jsx_runtime_1.jsxs)(SectionCard, { title: "Size Correction (Economies of Scale)", icon: lucide_react_native_1.TrendingDown, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bodyText, children: "Small houses have higher \u20AC /m\u00B2 costs due to fixed overhead, while larger houses benefit from economies of scale. The correction applies only to KG 300, 400, and 600." }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.correctionTable, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.correctionHeaderRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.correctionHeaderCell, children: "Building Area" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.correctionHeaderCell, children: "Correction" })] }), construction_1.SIZE_CORRECTION_TABLE.map((row, idx) => ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.correctionRow, idx % 2 === 0 && styles.correctionRowEven], children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.correctionCell, children: row.range }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.correctionCell, children: row.correction })] }, idx)))] })] }), (0, jsx_runtime_1.jsxs)(SectionCard, { title: "Area Definitions", icon: lucide_react_native_1.Ruler, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.definitionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.definitionLabel, children: "Building Area" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.definitionValue, children: "Total above-ground building area, including walls, measured to the outer face of the exterior structural walls. Basement, covered terraces, and balconies are entered separately." })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.definitionItem, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.definitionLabel, children: "Benchmark Contributions" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.definitionValue, children: "Building Area feeds the core benchmark directly. Covered Terraces contribute at 50% of area and Balcony Area at 30% of area as separate upstream benchmark contributions. Basement is benchmarked separately by basement type, then merged into the main KG 300 and KG 400 totals." })] })] }), (0, jsx_runtime_1.jsxs)(SectionCard, { title: "Site Condition Effects", icon: lucide_react_native_1.Mountain, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bodyText, children: "Soil conditions, groundwater, and slope affect site preparation in KG 200 and also apply targeted surcharges to the basement-related KG 300 subgroups. The above-ground benchmark allocation for KG 300\u2013600 does not change directly." }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.bulletList, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 Terrain multipliers increase excavation, foundation, and landscaping costs" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 Rocky or difficult terrain increases basement-related structural surcharges in KG 300" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 High groundwater increases basement waterproofing and below-grade structural costs" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bullet, children: "\u2022 Site accessibility affects material transport logistics" })] })] }), (0, jsx_runtime_1.jsxs)(SectionCard, { title: "Basement Cost Logic", icon: lucide_react_native_1.Layers, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bodyText, children: "Basement cost is not a simple \u20AC /m\u00B2 multiplier. Each basement type is benchmarked separately, split into DIN groups, and then merged into the main DIN totals:" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.formulaCard, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaLine, children: "Type-based basement benchmark" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaDetail, children: "Area \u00D7 corrected benchmark rate \u00D7 basement type factor" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.formulaDivider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaLine, children: "KG 300 share" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaDetail, children: "Split into basement KG 300 subgroups, then adjusted for site condition, groundwater, and accessibility" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.formulaDivider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaLine, children: "KG 400 share" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaDetail, children: "Allocated into KG 400 categories and merged into the main KG 400 total" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.formulaTotalDivider }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.formulaTotal, children: "= Basement contribution included in the main DIN 300 / 400 totals" })] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.disclaimerCard, children: [(0, jsx_runtime_1.jsx)(lucide_react_native_1.Info, { size: 16, color: colors_1.default.warning }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.disclaimerContent, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.disclaimerTitle, children: "Purpose of the Estimate" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.disclaimerText, children: "Dometrik provides a preliminary feasibility estimate for early-stage project planning. It is not a final construction quote. Actual costs depend on detailed design development, site-specific conditions, contractor pricing, and current market conditions." })] })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.bottomSpacer })] })] }));
}
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors_1.default.background,
    },
    content: {
        paddingBottom: 40,
    },
    heroCard: {
        margin: 16,
        marginTop: 12,
        backgroundColor: colors_1.default.card,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        gap: 10,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors_1.default.primary,
        letterSpacing: -0.3,
        textAlign: 'center',
    },
    heroSubtext: {
        fontSize: 13,
        color: colors_1.default.textSecondary,
        textAlign: 'center',
        lineHeight: 19,
    },
    sectionCard: {
        marginHorizontal: 16,
        marginTop: 12,
        backgroundColor: colors_1.default.card,
        borderRadius: 14,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    sectionCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionCardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors_1.default.text,
        letterSpacing: 0.2,
    },
    bodyText: {
        fontSize: 13,
        color: colors_1.default.textSecondary,
        lineHeight: 19,
        marginBottom: 8,
    },
    bulletList: {
        gap: 4,
    },
    bullet: {
        fontSize: 13,
        color: colors_1.default.textSecondary,
        lineHeight: 19,
        paddingLeft: 4,
    },
    infoBox: {
        marginTop: 10,
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 10,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: colors_1.default.accent,
    },
    infoBoxText: {
        fontSize: 12,
        color: colors_1.default.textSecondary,
        lineHeight: 18,
    },
    formulaCard: {
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 10,
        padding: 14,
    },
    formulaLine: {
        fontSize: 13,
        fontWeight: '600',
        color: colors_1.default.primary,
    },
    formulaDetail: {
        fontSize: 11,
        color: colors_1.default.textTertiary,
        marginTop: 2,
    },
    formulaDivider: {
        height: 1,
        backgroundColor: colors_1.default.borderLight,
        marginVertical: 8,
    },
    formulaTotalDivider: {
        height: 2,
        backgroundColor: colors_1.default.primary,
        marginVertical: 10,
    },
    formulaTotal: {
        fontSize: 14,
        fontWeight: '800',
        color: colors_1.default.primary,
    },
    correctionTable: {
        marginTop: 10,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors_1.default.borderLight,
    },
    correctionHeaderRow: {
        flexDirection: 'row',
        backgroundColor: colors_1.default.primary,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    correctionHeaderCell: {
        flex: 1,
        fontSize: 12,
        fontWeight: '700',
        color: colors_1.default.heroText,
    },
    correctionRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors_1.default.card,
    },
    correctionRowEven: {
        backgroundColor: colors_1.default.inputBg,
    },
    correctionCell: {
        flex: 1,
        fontSize: 13,
        color: colors_1.default.text,
        fontWeight: '500',
    },
    definitionItem: {
        marginBottom: 12,
    },
    definitionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: colors_1.default.primary,
        marginBottom: 4,
    },
    definitionValue: {
        fontSize: 12,
        color: colors_1.default.textSecondary,
        lineHeight: 18,
    },
    disclaimerCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: colors_1.default.warningBg,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FDE68A',
        gap: 12,
    },
    disclaimerContent: {
        flex: 1,
    },
    disclaimerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors_1.default.warning,
        marginBottom: 6,
    },
    disclaimerText: {
        fontSize: 12,
        color: '#92400E',
        lineHeight: 18,
    },
    bottomSpacer: {
        height: 20,
    },
});
