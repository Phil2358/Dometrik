import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { View, Text, ScrollView, StyleSheet, } from 'react-native';
import { Stack } from 'expo-router';
import { Info, BookOpen, Ruler, Mountain, Home, Layers, TrendingDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { SIZE_CORRECTION_TABLE } from '@/constants/construction';
function SectionCard({ title, icon: Icon, children }) {
    return (_jsxs(View, { style: styles.sectionCard, children: [_jsxs(View, { style: styles.sectionCardHeader, children: [_jsx(Icon, { size: 16, color: Colors.accent }), _jsx(Text, { style: styles.sectionCardTitle, children: title })] }), children] }));
}
export default function HowItWorksScreen() {
    return (_jsxs(_Fragment, { children: [_jsx(Stack.Screen, { options: { title: 'How the Estimate Works' } }), _jsxs(ScrollView, { style: styles.container, contentContainerStyle: styles.content, showsVerticalScrollIndicator: false, children: [_jsxs(View, { style: styles.heroCard, children: [_jsx(BookOpen, { size: 28, color: Colors.accent }), _jsx(Text, { style: styles.heroTitle, children: "How the Estimate Works" }), _jsx(Text, { style: styles.heroSubtext, children: "This page explains the calculation logic behind Dometrik to ensure full transparency." })] }), _jsxs(SectionCard, { title: "Overview", icon: Info, children: [_jsx(Text, { style: styles.bodyText, children: "The estimate is based on three components:" }), _jsxs(View, { style: styles.bulletList, children: [_jsx(Text, { style: styles.bullet, children: "\u2022 Base building cost per square meter (KG 300 + 400 + 600)" }), _jsx(Text, { style: styles.bullet, children: "\u2022 Site-specific adjustments (KG 200, KG 500)" }), _jsx(Text, { style: styles.bullet, children: "\u2022 Project-specific inputs (fees, contingency, contractor overhead)" })] })] }), _jsx(SectionCard, { title: "Cost Calculation Structure", icon: Layers, children: _jsxs(View, { style: styles.formulaCard, children: [_jsx(Text, { style: styles.formulaLine, children: "Base building cost" }), _jsx(Text, { style: styles.formulaDetail, children: "= \u20AC /m\u00B2 \u00D7 living area (+ size correction)" }), _jsx(View, { style: styles.formulaDivider }), _jsx(Text, { style: styles.formulaLine, children: "+ Site preparation costs (KG 200)" }), _jsx(Text, { style: styles.formulaDetail, children: "Excavation, utilities, basement excavation" }), _jsx(View, { style: styles.formulaDivider }), _jsx(Text, { style: styles.formulaLine, children: "+ External works (KG 500)" }), _jsx(Text, { style: styles.formulaDetail, children: "Landscaping, pool, outdoor areas" }), _jsx(View, { style: styles.formulaDivider }), _jsx(Text, { style: styles.formulaLine, children: "+ Professional fees (KG 700)" }), _jsx(Text, { style: styles.formulaDetail, children: "Architecture, engineering, permits" }), _jsx(View, { style: styles.formulaDivider }), _jsx(Text, { style: styles.formulaLine, children: "+ Contractor overhead & profit" }), _jsx(Text, { style: styles.formulaDetail, children: "Percentage of construction cost" }), _jsx(View, { style: styles.formulaDivider }), _jsx(Text, { style: styles.formulaLine, children: "+ Construction contingency" }), _jsx(Text, { style: styles.formulaDetail, children: "Risk reserve based on quality level" }), _jsx(View, { style: styles.formulaTotalDivider }), _jsx(Text, { style: styles.formulaTotal, children: "= Total project cost" })] }) }), _jsxs(SectionCard, { title: "What's Included in the Base \u20AC /m\u00B2", icon: Home, children: [_jsx(Text, { style: styles.bodyText, children: "The base construction cost per square meter represents a standard reference building and includes:" }), _jsxs(View, { style: styles.bulletList, children: [_jsx(Text, { style: styles.bullet, children: "\u2022 KG 300 \u2013 Building construction (structure, walls, roof, insulation, windows, interior finishes)" }), _jsx(Text, { style: styles.bullet, children: "\u2022 KG 400 \u2013 Technical systems (HVAC, electrical, plumbing)" }), _jsx(Text, { style: styles.bullet, children: "\u2022 KG 600 \u2013 Built-in equipment (kitchen, wardrobes, fixtures)" })] }), _jsx(View, { style: styles.infoBox, children: _jsx(Text, { style: styles.infoBoxText, children: "Typical assumptions: reinforced concrete structure, masonry walls with ETICS insulation, standard windows, basic HVAC system (heat pump + fan-coils or VRV), standard electrical and plumbing installations, standard interior finishes, basic bathroom fixtures." }) })] }), _jsxs(SectionCard, { title: "What's NOT Included in the Base \u20AC /m\u00B2", icon: Info, children: [_jsx(Text, { style: styles.bodyText, children: "The following cost groups are calculated separately:" }), _jsxs(View, { style: styles.bulletList, children: [_jsx(Text, { style: styles.bullet, children: "\u2022 KG 200 \u2013 Site preparation & utilities" }), _jsx(Text, { style: styles.bullet, children: "\u2022 KG 500 \u2013 External works (landscaping, pool)" }), _jsx(Text, { style: styles.bullet, children: "\u2022 KG 700 \u2013 Planning & professional fees" }), _jsx(Text, { style: styles.bullet, children: "\u2022 Contractor overhead and profit" }), _jsx(Text, { style: styles.bullet, children: "\u2022 Construction contingency" }), _jsx(Text, { style: styles.bullet, children: "\u2022 VAT" })] })] }), _jsxs(SectionCard, { title: "Size Correction (Economies of Scale)", icon: TrendingDown, children: [_jsx(Text, { style: styles.bodyText, children: "Small houses have higher \u20AC /m\u00B2 costs due to fixed overhead, while larger houses benefit from economies of scale. The correction applies only to KG 300, 400, and 600." }), _jsxs(View, { style: styles.correctionTable, children: [_jsxs(View, { style: styles.correctionHeaderRow, children: [_jsx(Text, { style: styles.correctionHeaderCell, children: "Living Area" }), _jsx(Text, { style: styles.correctionHeaderCell, children: "Correction" })] }), SIZE_CORRECTION_TABLE.map((row, idx) => (_jsxs(View, { style: [styles.correctionRow, idx % 2 === 0 && styles.correctionRowEven], children: [_jsx(Text, { style: styles.correctionCell, children: row.range }), _jsx(Text, { style: styles.correctionCell, children: row.correction })] }, idx)))] })] }), _jsxs(SectionCard, { title: "Area Definitions", icon: Ruler, children: [_jsxs(View, { style: styles.definitionItem, children: [_jsx(Text, { style: styles.definitionLabel, children: "Living Area" }), _jsx(Text, { style: styles.definitionValue, children: "Full interior floor area measured to the outside face of structural walls. Excludes external insulation thickness. Habitable basements count as living area. Storage basements, terraces, and balconies do not." })] }), _jsxs(View, { style: styles.definitionItem, children: [_jsx(Text, { style: styles.definitionLabel, children: "Effective Area" }), _jsx(Text, { style: styles.definitionValue, children: "Living area + terraces (50%) + balconies (30%) + basement (weighted by type). Used for base building cost calculation." })] })] }), _jsxs(SectionCard, { title: "Site Condition Effects", icon: Mountain, children: [_jsx(Text, { style: styles.bodyText, children: "Soil conditions, groundwater, and slope affect excavation costs in KG 200. These factors do not change the base building cost (KG 300\u2013600)." }), _jsxs(View, { style: styles.bulletList, children: [_jsx(Text, { style: styles.bullet, children: "\u2022 Terrain multipliers increase excavation, foundation, and landscaping costs" }), _jsx(Text, { style: styles.bullet, children: "\u2022 Rocky soil increases basement excavation costs" }), _jsx(Text, { style: styles.bullet, children: "\u2022 High groundwater increases waterproofing and drainage costs" }), _jsx(Text, { style: styles.bullet, children: "\u2022 Site accessibility affects material transport logistics" })] })] }), _jsxs(SectionCard, { title: "Basement Cost Logic", icon: Layers, children: [_jsx(Text, { style: styles.bodyText, children: "Basement cost is not a simple \u20AC /m\u00B2 multiplier. It is calculated as two separate components:" }), _jsxs(View, { style: styles.formulaCard, children: [_jsx(Text, { style: styles.formulaLine, children: "Excavation component (KG 200)" }), _jsx(Text, { style: styles.formulaDetail, children: "Depends on basement area, soil, groundwater, slope" }), _jsx(View, { style: styles.formulaDivider }), _jsx(Text, { style: styles.formulaLine, children: "Structure component (KG 300)" }), _jsx(Text, { style: styles.formulaDetail, children: "Slab, walls, reinforcement, waterproofing, insulation" }), _jsx(View, { style: styles.formulaTotalDivider }), _jsx(Text, { style: styles.formulaTotal, children: "= Total basement cost" })] })] }), _jsxs(View, { style: styles.disclaimerCard, children: [_jsx(Info, { size: 16, color: Colors.warning }), _jsxs(View, { style: styles.disclaimerContent, children: [_jsx(Text, { style: styles.disclaimerTitle, children: "Purpose of the Estimate" }), _jsx(Text, { style: styles.disclaimerText, children: "Dometrik provides a preliminary feasibility estimate for early-stage project planning. It is not a final construction quote. Actual costs depend on detailed design development, site-specific conditions, contractor pricing, and current market conditions." })] })] }), _jsx(View, { style: styles.bottomSpacer })] })] }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        paddingBottom: 40,
    },
    heroCard: {
        margin: 16,
        marginTop: 12,
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        gap: 10,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.primary,
        letterSpacing: -0.3,
        textAlign: 'center',
    },
    heroSubtext: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 19,
    },
    sectionCard: {
        marginHorizontal: 16,
        marginTop: 12,
        backgroundColor: Colors.card,
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
        color: Colors.text,
        letterSpacing: 0.2,
    },
    bodyText: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 19,
        marginBottom: 8,
    },
    bulletList: {
        gap: 4,
    },
    bullet: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 19,
        paddingLeft: 4,
    },
    infoBox: {
        marginTop: 10,
        backgroundColor: Colors.inputBg,
        borderRadius: 10,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: Colors.accent,
    },
    infoBoxText: {
        fontSize: 12,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    formulaCard: {
        backgroundColor: Colors.inputBg,
        borderRadius: 10,
        padding: 14,
    },
    formulaLine: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.primary,
    },
    formulaDetail: {
        fontSize: 11,
        color: Colors.textTertiary,
        marginTop: 2,
    },
    formulaDivider: {
        height: 1,
        backgroundColor: Colors.borderLight,
        marginVertical: 8,
    },
    formulaTotalDivider: {
        height: 2,
        backgroundColor: Colors.primary,
        marginVertical: 10,
    },
    formulaTotal: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.primary,
    },
    correctionTable: {
        marginTop: 10,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    correctionHeaderRow: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    correctionHeaderCell: {
        flex: 1,
        fontSize: 12,
        fontWeight: '700',
        color: Colors.heroText,
    },
    correctionRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: Colors.card,
    },
    correctionRowEven: {
        backgroundColor: Colors.inputBg,
    },
    correctionCell: {
        flex: 1,
        fontSize: 13,
        color: Colors.text,
        fontWeight: '500',
    },
    definitionItem: {
        marginBottom: 12,
    },
    definitionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 4,
    },
    definitionValue: {
        fontSize: 12,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    disclaimerCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: Colors.warningBg,
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
        color: Colors.warning,
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
