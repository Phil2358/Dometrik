import { formatEuro } from '@/constants/construction';
import { formatBasementSummary } from '@/utils/computeScenarioCosts';

export interface ClientReportData {
  location: string;
  effectiveArea: number;
  mainArea: number;
  qualityName: string;
  balconyArea: number;
  basementArea: number;
  storageBasementArea: number;
  parkingBasementArea: number;
  habitableBasementArea: number;
  includePool: boolean;
  poolArea: number;
  poolDepth: number;
  poolQualityName: string;
  poolTypeName: string;
  siteConditionName: string;
  groundwaterConditionName: string;
  siteAccessibilityName: string;
  hvacOptions: string[];
  kg200Total: number;
  kg300Cost: number;
  kg400Total: number;
  kg500Total: number;
  kg600Cost: number;
  permitDesignFee: number;
  contingencyCost: number;
  contractorCost: number;
  totalCost: number;
  constructionSubtotal: number;
  contingencyPercent: number;
  sizeCorrectionFactor: number;
}

interface ChartSegment {
  label: string;
  value: number;
  color: string;
  percent: number;
}

const ACCENT = '#D4782F';
const PRIMARY = '#1B3A4B';
const PRIMARY_LIGHT = '#2C5F6E';
const TEXT_BODY = '#4B5563';
const TEXT_MUTED = '#6B7280';
const TEXT_FAINT = '#9CA3AF';
const BG_WARM = '#F9F6F2';
const BORDER = '#E5DDD4';
const BORDER_LIGHT = '#F0EBE5';

const CHART_COLORS = [
  '#1B3A4B',
  '#2C5F6E',
  '#5B8C5A',
  '#D4782F',
  '#3B82C4',
  '#8B6E5A',
];

function getSizeCorrectionText(factor: number): string {
  if (factor > 1.05) return '+10%';
  if (factor > 1.0) return '+5%';
  if (factor < 0.95) return '−10%';
  if (factor < 1.0) return '−5%';
  return 'none';
}

function buildAssumptions(data: ClientReportData): string[] {
  const assumptions: string[] = [];
  assumptions.push(`${data.siteConditionName} site conditions`);
  assumptions.push(`${data.groundwaterConditionName}`);
  assumptions.push(`${data.siteAccessibilityName}`);
  assumptions.push('Detached house geometry');
  assumptions.push('Reinforced concrete structure');
  assumptions.push('ETICS insulation system');
  assumptions.push('Standard HVAC system (heat pump + fan-coil/VRV)');
  const corrText = getSizeCorrectionText(data.sizeCorrectionFactor);
  if (corrText !== 'none') {
    assumptions.push(`Size correction: ${corrText} (living area ${data.mainArea} m²)`);
  }
  if (data.basementArea > 0) {
    assumptions.push(`Basement mix: ${formatBasementSummary(data.storageBasementArea, data.parkingBasementArea, data.habitableBasementArea)}`);
  }
  if (data.includePool) {
    assumptions.push(`${data.poolQualityName} · ${data.poolTypeName}`);
  }
  if (data.hvacOptions.length > 0) {
    data.hvacOptions.forEach((opt) => assumptions.push(opt));
  }
  if (data.siteConditionName.toLowerCase().includes('inclined') && data.siteConditionName.toLowerCase().includes('unstable')) {
    assumptions.push('⚠ Inclined or unstable soil conditions may significantly increase costs');
  }
  if (data.groundwaterConditionName.toLowerCase().includes('high')) {
    assumptions.push('⚠ High groundwater may increase basement waterproofing costs');
  }
  if (data.siteAccessibilityName.toLowerCase().includes('difficult')) {
    assumptions.push('⚠ Difficult site access may increase transport and logistics costs');
  }
  return assumptions;
}

function buildChartSegments(data: ClientReportData): ChartSegment[] {
  const items: { label: string; value: number }[] = [
    { label: 'Site preparation', value: data.kg200Total },
    { label: 'Structure', value: data.kg300Cost },
    { label: 'Technical systems', value: data.kg400Total },
    { label: 'Interior fit-out', value: data.kg600Cost },
    { label: 'External works', value: data.kg500Total },
    { label: 'Planning & fees', value: data.permitDesignFee },
  ];

  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  let colorIdx = 0;

  return items
    .filter((i) => i.value > 0)
    .map((i) => ({
      ...i,
      color: CHART_COLORS[colorIdx++ % CHART_COLORS.length],
      percent: Math.round((i.value / total) * 100),
    }));
}

function renderPieChart(segments: ChartSegment[]): string {
  const size = 150;
  const cx = size / 2;
  const cy = size / 2;
  const r = 58;

  let cumulativePercent = 0;
  const slices = segments.map((seg) => {
    const startAngle = cumulativePercent * 3.6 * (Math.PI / 180);
    cumulativePercent += seg.percent;
    const endAngle = cumulativePercent * 3.6 * (Math.PI / 180);
    const largeArc = seg.percent > 50 ? 1 : 0;
    const x1 = cx + r * Math.sin(startAngle);
    const y1 = cy - r * Math.cos(startAngle);
    const x2 = cx + r * Math.sin(endAngle);
    const y2 = cy - r * Math.cos(endAngle);

    if (seg.percent >= 100) {
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${seg.color}" />`;
    }

    return `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z" fill="${seg.color}" />`;
  });

  const legend = segments
    .map(
      (s) => `
    <div style="display:flex;align-items:center;margin-bottom:4px;">
      <div style="width:9px;height:9px;border-radius:2px;background:${s.color};margin-right:7px;flex-shrink:0;"></div>
      <div style="flex:1;font-size:9.5px;color:${TEXT_BODY};">${s.label}</div>
      <div style="font-size:9.5px;font-weight:600;color:${PRIMARY};margin-left:10px;">${s.percent}%</div>
    </div>`
    )
    .join('');

  return `
    <div style="display:flex;align-items:center;gap:28px;justify-content:center;">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        ${slices.join('')}
        <circle cx="${cx}" cy="${cy}" r="30" fill="#fff" />
      </svg>
      <div style="min-width:150px;">
        ${legend}
      </div>
    </div>`;
}

export function generateClientReportHtml(data: ClientReportData, reportTitle?: string): string {
  const title = reportTitle || 'Project Cost Estimate';
  const segments = buildChartSegments(data);
  const assumptions = buildAssumptions(data);

  const rangeLow = Math.round(data.totalCost * 0.88);
  const rangeHigh = Math.round(data.totalCost * 1.12);

  const breakdownRows = [
    { label: 'Site preparation (KG 200)', value: data.kg200Total },
    { label: 'Building construction (KG 300)', value: data.kg300Cost },
    { label: 'Technical systems (KG 400)', value: data.kg400Total },
    { label: 'Built-in equipment (KG 600)', value: data.kg600Cost },
    { label: 'External works (KG 500)', value: data.kg500Total },
    { label: 'Planning & professional fees (KG 700)', value: data.permitDesignFee },
    { label: 'Construction contingency', value: data.contingencyCost },
    { label: 'Contractor overhead & profit', value: data.contractorCost },
  ].filter((r) => r.value > 0);

  const overviewItems: { label: string; value: string }[] = [
    { label: 'Location', value: data.location },
    { label: 'Living area', value: `${data.mainArea} m²` },
    { label: 'Effective area', value: `${data.effectiveArea.toFixed(0)} m²` },
    { label: 'Quality level', value: data.qualityName },
    { label: 'Site conditions', value: data.siteConditionName },
    { label: 'Groundwater', value: data.groundwaterConditionName },
    { label: 'Site access', value: data.siteAccessibilityName },
  ];
  const corrText = getSizeCorrectionText(data.sizeCorrectionFactor);
  if (corrText !== 'none') {
    overviewItems.push({ label: 'Size correction', value: corrText });
  }
  if (data.balconyArea > 0) {
    overviewItems.push({ label: 'Balconies', value: `${data.balconyArea} m² (30% weighting)` });
  }
  if (data.basementArea > 0) {
    overviewItems.push({ label: 'Basement', value: formatBasementSummary(data.storageBasementArea, data.parkingBasementArea, data.habitableBasementArea) });
  }
  if (data.includePool) {
    overviewItems.push({ label: 'Swimming pool', value: `${data.poolArea} m² · ${data.poolDepth.toFixed(2)} m · ${data.poolTypeName}` });
  }
  if (data.hvacOptions.length > 0) {
    overviewItems.push({ label: 'Energy options', value: data.hvacOptions.join(', ') });
  }

  const overviewHtml = overviewItems
    .map(
      (item) => `
      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid ${BORDER_LIGHT};">
        <span style="font-size:10px;color:${TEXT_MUTED};letter-spacing:0.2px;">${item.label}</span>
        <span style="font-size:10px;font-weight:600;color:${PRIMARY};">${item.value}</span>
      </div>`
    )
    .join('');

  const breakdownHtml = breakdownRows
    .map(
      (r) => `
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid ${BORDER_LIGHT};">
        <span style="font-size:10.5px;color:${TEXT_BODY};">${r.label}</span>
        <span style="font-size:10.5px;font-weight:600;color:${PRIMARY};">${formatEuro(r.value)}</span>
      </div>`
    )
    .join('');

  const assumptionsHtml = assumptions
    .map(
      (a) => `<div style="font-size:10px;color:${TEXT_BODY};padding:3px 0 3px 14px;position:relative;line-height:1.6;">
        <span style="position:absolute;left:0;color:${ACCENT};font-weight:700;">•</span>${a}
      </div>`
    )
    .join('');

  const costBasisNote = `The base construction cost reflects direct building construction costs (KG 300 + KG 400 + KG 600). Site preparation (KG 200), external works (KG 500), contractor margin, planning costs, and VAT are calculated separately. A size-dependent cost correction is applied to reflect economies of scale.`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  @page {
    margin: 28px 34px;
    size: A4;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: ${PRIMARY};
    background: #fff;
    font-size: 11px;
    line-height: 1.5;
    padding: 32px 40px;
  }

  .no-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .page-two {
    page-break-before: always;
    break-before: page;
  }
  .page-two-section {
    page-break-inside: avoid;
    break-inside: avoid;
    page-break-after: avoid;
    break-after: avoid;
  }

  .section-divider {
    border: none;
    border-top: 1px solid ${BORDER};
    margin: 16px 0;
  }
  .section-divider-strong {
    border: none;
    border-top: 2px solid ${PRIMARY};
    margin: 18px 0;
  }
  .section-heading {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: ${PRIMARY};
    margin-top: 24px;
    margin-bottom: 10px;
  }
</style>
</head>
<body>

<!-- PAGE 1 -->

<div class="no-break" style="margin-bottom:4px;">
  <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.8px;color:${ACCENT};font-weight:600;margin-bottom:3px;">Feasibility Estimate</div>
  <div style="font-size:22px;font-weight:800;color:${PRIMARY};letter-spacing:-0.5px;line-height:1.2;">${title}</div>
  <div style="font-size:10.5px;color:${TEXT_MUTED};margin-top:3px;">Preliminary cost assessment for early-stage project planning</div>
</div>

<hr class="section-divider-strong" />

<div class="no-break" style="margin-bottom:16px;">
  <div class="section-heading" style="margin-top:0;">Project Overview</div>
  <div style="background:${BG_WARM};border-radius:6px;padding:12px 16px;">
    ${overviewHtml}
  </div>
</div>

<hr class="section-divider" />

<div class="no-break" style="margin-bottom:4px;">
  <div style="background:linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_LIGHT} 100%);border-radius:10px;padding:26px 20px;text-align:center;">
    <div style="font-size:8.5px;text-transform:uppercase;letter-spacing:1.8px;color:rgba(255,255,255,0.55);margin-bottom:6px;font-weight:600;">Estimated Total Project Cost</div>
    <div style="font-size:38px;font-weight:800;color:#FFFFFF;letter-spacing:-1.2px;line-height:1.1;">${formatEuro(data.totalCost)}</div>
  </div>
</div>
<div style="font-size:9.5px;color:${TEXT_MUTED};text-align:center;font-style:italic;margin-bottom:18px;line-height:1.5;padding:0 20px;">
  This estimate represents the likely total project budget based on the parameters defined above.
</div>

<hr class="section-divider" />

<div class="no-break" style="margin-bottom:14px;">
  <div class="section-heading" style="margin-top:0;">Construction Cost Distribution</div>
  ${renderPieChart(segments)}
</div>

<hr class="section-divider" />

<div class="no-break" style="margin-bottom:14px;">
  <div class="section-heading" style="margin-top:0;">Cost Breakdown</div>
  <div style="padding:0 2px;">
    ${breakdownHtml}
    <div style="display:flex;justify-content:space-between;padding:10px 0 4px 0;border-top:2px solid ${PRIMARY};margin-top:4px;">
      <span style="font-size:11.5px;font-weight:700;color:${PRIMARY};">Total Project Cost</span>
      <span style="font-size:11.5px;font-weight:800;color:${PRIMARY};">${formatEuro(data.totalCost)}</span>
    </div>
  </div>
</div>

<hr class="section-divider" />

<div class="no-break" style="margin-bottom:0;">
  <div class="section-heading" style="margin-top:0;">Assumptions</div>
  <div style="padding:0 2px;">
    ${assumptionsHtml}
  </div>
  <div style="margin-top:10px;padding:10px 14px;background:#FFFBF5;border-left:3px solid ${ACCENT};border-radius:0 4px 4px 0;font-size:9px;color:${TEXT_MUTED};line-height:1.6;">
    ${costBasisNote}
  </div>
</div>


<!-- PAGE 2 -->
<div class="page-two">

  <div class="page-two-section" style="margin-bottom:20px;">
    <div class="section-heading" style="margin-top:0;">Estimated Cost Range</div>
    <div style="background:${BG_WARM};border:1px solid ${BORDER};border-radius:8px;padding:18px 22px;text-align:center;">
      <div style="font-size:8.5px;text-transform:uppercase;letter-spacing:1px;color:${TEXT_MUTED};margin-bottom:5px;font-weight:600;">Likely project cost</div>
      <div style="font-size:22px;font-weight:800;color:${PRIMARY};letter-spacing:-0.5px;">${formatEuro(rangeLow)}  –  ${formatEuro(rangeHigh)}</div>
      <div style="font-size:9px;color:${TEXT_FAINT};margin-top:5px;">Based on ±12% estimation uncertainty</div>
    </div>
  </div>

  <hr class="section-divider" />

  <div class="page-two-section" style="margin-bottom:20px;">
    <div class="section-heading" style="margin-top:0;">Disclaimer</div>
    <div style="background:#FFFBF5;border-left:3px solid ${ACCENT};border-radius:0 6px 6px 0;padding:14px 16px;font-size:10px;color:${TEXT_MUTED};line-height:1.7;">
      Preliminary estimate based on typical construction assumptions. Final costs depend on design development, site conditions, and contractor pricing.
    </div>
  </div>

  <hr class="section-divider" />

  <div class="page-two-section" style="padding-top:6px;">
    <div style="font-size:8px;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_FAINT};margin-bottom:7px;font-weight:600;">Prepared by</div>
    <div style="font-size:15px;font-weight:800;color:${PRIMARY};letter-spacing:-0.3px;">Philipp Doukakis</div>
    <div style="font-size:10.5px;color:${TEXT_MUTED};margin-bottom:7px;">Architect</div>
    <a href="https://philippdoukakis.com" style="font-size:10.5px;color:${ACCENT};text-decoration:none;font-weight:600;border-bottom:1px solid #F0DFD1;">philippdoukakis.com</a>
  </div>

</div>

</body>
</html>`;
}
