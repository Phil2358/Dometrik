import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Stack } from 'expo-router';
import { Info, BookOpen, Ruler, Mountain, Home, Layers, TrendingDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { SIZE_CORRECTION_TABLE } from '@/constants/construction';

function SectionCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionCardHeader}>
        <Icon size={16} color={Colors.accent} />
        <Text style={styles.sectionCardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function HowItWorksScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'How the Estimate Works' }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <BookOpen size={28} color={Colors.accent} />
          <Text style={styles.heroTitle}>How the Estimate Works</Text>
          <Text style={styles.heroSubtext}>
            This page explains the calculation logic behind Dometrik to ensure full transparency.
          </Text>
        </View>

        <SectionCard title="Overview" icon={Info}>
          <Text style={styles.bodyText}>
            The estimate is based on three components:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Base building cost per square meter (KG 300 + 400 + 600)</Text>
            <Text style={styles.bullet}>• Site-specific adjustments (KG 200, KG 500)</Text>
            <Text style={styles.bullet}>• Project-specific inputs (fees, contingency, contractor overhead)</Text>
          </View>
        </SectionCard>

        <SectionCard title="Cost Calculation Structure" icon={Layers}>
          <View style={styles.formulaCard}>
            <Text style={styles.formulaLine}>Base building cost</Text>
            <Text style={styles.formulaDetail}>= € /m² × building area (+ size correction)</Text>
            <View style={styles.formulaDivider} />
            <Text style={styles.formulaLine}>+ Site preparation costs (KG 200)</Text>
            <Text style={styles.formulaDetail}>Excavation, utilities, basement excavation</Text>
            <View style={styles.formulaDivider} />
            <Text style={styles.formulaLine}>+ External works (KG 500)</Text>
            <Text style={styles.formulaDetail}>Landscaping, pool, outdoor areas</Text>
            <View style={styles.formulaDivider} />
            <Text style={styles.formulaLine}>+ Professional fees (KG 700)</Text>
            <Text style={styles.formulaDetail}>Architecture, engineering, permits</Text>
            <View style={styles.formulaDivider} />
            <Text style={styles.formulaLine}>+ Contractor overhead & profit</Text>
            <Text style={styles.formulaDetail}>Percentage of construction cost</Text>
            <View style={styles.formulaDivider} />
            <Text style={styles.formulaLine}>+ Construction contingency</Text>
            <Text style={styles.formulaDetail}>Risk reserve based on quality level</Text>
            <View style={styles.formulaTotalDivider} />
            <Text style={styles.formulaTotal}>= Total project cost</Text>
          </View>
        </SectionCard>

        <SectionCard title="What's Included in the Base € /m²" icon={Home}>
          <Text style={styles.bodyText}>
            The base construction cost per square meter represents a standard reference building and includes:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• KG 300 – Building construction (structure, walls, roof, insulation, windows, interior finishes)</Text>
            <Text style={styles.bullet}>• KG 400 – Technical systems (HVAC, electrical, plumbing)</Text>
            <Text style={styles.bullet}>• KG 600 – Built-in equipment (kitchen, wardrobes, fixtures)</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxText}>
              Typical assumptions: reinforced concrete structure, masonry walls with ETICS insulation, standard windows, basic HVAC system (heat pump + fan-coils or VRV), standard electrical and plumbing installations, standard interior finishes, basic bathroom fixtures.
            </Text>
          </View>
        </SectionCard>

        <SectionCard title="What's NOT Included in the Base € /m²" icon={Info}>
          <Text style={styles.bodyText}>
            The following cost groups are calculated separately:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• KG 200 – Site preparation & utilities</Text>
            <Text style={styles.bullet}>• KG 500 – External works (landscaping, pool)</Text>
            <Text style={styles.bullet}>• KG 700 – Planning & professional fees</Text>
            <Text style={styles.bullet}>• Contractor overhead and profit</Text>
            <Text style={styles.bullet}>• Construction contingency</Text>
            <Text style={styles.bullet}>• VAT</Text>
          </View>
        </SectionCard>

        <SectionCard title="Size Correction (Economies of Scale)" icon={TrendingDown}>
          <Text style={styles.bodyText}>
            Small houses have higher € /m² costs due to fixed overhead, while larger houses benefit from economies of scale. The correction applies only to KG 300, 400, and 600.
          </Text>
          <View style={styles.correctionTable}>
            <View style={styles.correctionHeaderRow}>
              <Text style={styles.correctionHeaderCell}>Building Area</Text>
              <Text style={styles.correctionHeaderCell}>Correction</Text>
            </View>
            {SIZE_CORRECTION_TABLE.map((row, idx) => (
              <View key={idx} style={[styles.correctionRow, idx % 2 === 0 && styles.correctionRowEven]}>
                <Text style={styles.correctionCell}>{row.range}</Text>
                <Text style={styles.correctionCell}>{row.correction}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <SectionCard title="Area Definitions" icon={Ruler}>
          <View style={styles.definitionItem}>
            <Text style={styles.definitionLabel}>Building Area</Text>
            <Text style={styles.definitionValue}>
              Total above-ground building area, including walls, measured to the outer face of the exterior structural walls. Basement, covered terraces, and balconies are entered separately.
            </Text>
          </View>
          <View style={styles.definitionItem}>
            <Text style={styles.definitionLabel}>Benchmark Contributions</Text>
            <Text style={styles.definitionValue}>
              Building Area feeds the core benchmark directly. Covered Terraces contribute at 50% of area and Balcony Area at 30% of area as separate upstream benchmark contributions. Basement is benchmarked separately by basement type, then merged into the main KG 300 and KG 400 totals.
            </Text>
          </View>
        </SectionCard>

        <SectionCard title="Site Condition Effects" icon={Mountain}>
          <Text style={styles.bodyText}>
            Soil conditions, groundwater, and slope affect site preparation in KG 200 and also apply targeted surcharges to the basement-related KG 300 subgroups. The above-ground benchmark allocation for KG 300–600 does not change directly.
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Terrain multipliers increase excavation, foundation, and landscaping costs</Text>
            <Text style={styles.bullet}>• Rocky or difficult terrain increases basement-related structural surcharges in KG 300</Text>
            <Text style={styles.bullet}>• High groundwater increases basement waterproofing and below-grade structural costs</Text>
            <Text style={styles.bullet}>• Site accessibility affects material transport logistics</Text>
          </View>
        </SectionCard>

        <SectionCard title="Basement Cost Logic" icon={Layers}>
          <Text style={styles.bodyText}>
            Basement cost is not a simple € /m² multiplier. Each basement type is benchmarked separately, split into DIN groups, and then merged into the main DIN totals:
          </Text>
          <View style={styles.formulaCard}>
            <Text style={styles.formulaLine}>Type-based basement benchmark</Text>
            <Text style={styles.formulaDetail}>Area × corrected benchmark rate × basement type factor</Text>
            <View style={styles.formulaDivider} />
            <Text style={styles.formulaLine}>KG 300 share</Text>
            <Text style={styles.formulaDetail}>Split into basement KG 300 subgroups, then adjusted for site condition, groundwater, and accessibility</Text>
            <View style={styles.formulaDivider} />
            <Text style={styles.formulaLine}>KG 400 share</Text>
            <Text style={styles.formulaDetail}>Allocated into KG 400 categories and merged into the main KG 400 total</Text>
            <View style={styles.formulaTotalDivider} />
            <Text style={styles.formulaTotal}>= Basement contribution included in the main DIN 300 / 400 totals</Text>
          </View>
        </SectionCard>

        <View style={styles.disclaimerCard}>
          <Info size={16} color={Colors.warning} />
          <View style={styles.disclaimerContent}>
            <Text style={styles.disclaimerTitle}>Purpose of the Estimate</Text>
            <Text style={styles.disclaimerText}>
              Dometrik provides a preliminary feasibility estimate for early-stage project planning. It is not a final construction quote. Actual costs depend on detailed design development, site-specific conditions, contractor pricing, and current market conditions.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
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
    alignItems: 'center' as const,
    gap: 10,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.primary,
    letterSpacing: -0.3,
    textAlign: 'center' as const,
  },
  heroSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
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
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
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
    fontWeight: '600' as const,
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
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  correctionTable: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  correctionHeaderRow: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  correctionHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.heroText,
  },
  correctionRow: {
    flexDirection: 'row' as const,
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
    fontWeight: '500' as const,
  },
  definitionItem: {
    marginBottom: 12,
  },
  definitionLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  definitionValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  disclaimerCard: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
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
    fontWeight: '700' as const,
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
