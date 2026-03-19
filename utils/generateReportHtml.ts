import { formatEuro } from '@/constants/construction';
import { formatBasementSummary } from '@/utils/computeScenarioCosts';

export interface ReportData {
  location: string;
  buildingArea: number;
  terraceArea: number;
  baseBuildingAreaBenchmarkContribution: number;
  qualityName: string;
  balconyArea: number;
  coveredTerracesBenchmarkContribution: number;
  balconyAreaBenchmarkContribution: number;
  totalBenchmarkContributionBeforeGroupAllocation: number;
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
}

interface ChartSegment {
  label: string;
  value: number;
  color: string;
  percent: number;
}

function buildAssumptions(data: ReportData): string[] {
  const assumptions: string[] = [];
  assumptions.push(`${data.siteConditionName} site conditions`);
  assumptions.push(`${data.groundwaterConditionName}`);
  assumptions.push(`${data.siteAccessibilityName}`);
  assumptions.push('Detached house geometry');
  assumptions.push('Reinforced concrete structure');
  assumptions.push('ETICS insulation system');
  assumptions.push('Standard HVAC system (heat pump + fan-coil/VRV)');
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

const CHART_COLORS = [
  '#1B3A4B',
  '#2C5F6E',
  '#5B8C5A',
  '#D4782F',
  '#3B82C4',
  '#8B6E5A',
];

function buildChartSegments(data: ReportData): ChartSegment[] {
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
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 60;

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
    <div style="display:flex;align-items:center;margin-bottom:5px;">
      <div style="width:10px;height:10px;border-radius:2px;background:${s.color};margin-right:8px;flex-shrink:0;"></div>
      <div style="flex:1;font-size:10px;color:#4B5563;">${s.label}</div>
      <div style="font-size:10px;font-weight:600;color:#1F2937;margin-left:12px;">${s.percent}%</div>
    </div>`
    )
    .join('');

  return `
    <div style="display:flex;align-items:center;gap:32px;justify-content:center;">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        ${slices.join('')}
        <circle cx="${cx}" cy="${cy}" r="32" fill="#fff" />
      </svg>
      <div style="min-width:160px;">
        ${legend}
      </div>
    </div>`;
}

export function generateReportHtml(data: ReportData, reportTitle?: string): string {
  const title = reportTitle || 'Project Cost Estimate';
  const segments = buildChartSegments(data);
  const assumptions = buildAssumptions(data);

  const rangeLow = Math.round(data.totalCost * 0.88);
  const rangeHigh = Math.round(data.totalCost * 1.12);

  const breakdownRows = [
    { label: 'Site preparation', value: data.kg200Total },
    { label: 'Structure', value: data.kg300Cost },
    { label: 'Technical systems', value: data.kg400Total },
    { label: 'Interior fit-out', value: data.kg600Cost },
    { label: 'External works', value: data.kg500Total },
    { label: 'Planning & permit fees', value: data.permitDesignFee },
    { label: 'Construction contingency', value: data.contingencyCost },
    { label: 'Contractor overhead & profit', value: data.contractorCost },
  ].filter((r) => r.value > 0);

  const overviewItems: { label: string; value: string }[] = [
    { label: 'Location', value: data.location },
    { label: 'Building Area', value: `${data.buildingArea.toFixed(0)} m²` },
    { label: 'Quality level', value: data.qualityName },
    { label: 'Site conditions', value: data.siteConditionName },
    { label: 'Groundwater', value: data.groundwaterConditionName },
    { label: 'Site access', value: data.siteAccessibilityName },
  ];
  if (data.terraceArea > 0) {
    overviewItems.push({ label: 'Covered Terraces', value: `${data.terraceArea} m² (50% factor) · ${formatEuro(data.coveredTerracesBenchmarkContribution)} benchmark contribution` });
  }
  if (data.balconyArea > 0) {
    overviewItems.push({ label: 'Balcony Area', value: `${data.balconyArea} m² (30% factor) · ${formatEuro(data.balconyAreaBenchmarkContribution)} benchmark contribution` });
  }
  overviewItems.push({ label: 'Building Area benchmark', value: formatEuro(data.baseBuildingAreaBenchmarkContribution) });
  overviewItems.push({ label: 'Total benchmark before allocation', value: formatEuro(data.totalBenchmarkContributionBeforeGroupAllocation) });
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
      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #F0EBE5;">
        <span style="font-size:10px;color:#6B7280;letter-spacing:0.2px;">${item.label}</span>
        <span style="font-size:10px;font-weight:600;color:#1F2937;">${item.value}</span>
      </div>`
    )
    .join('');

  const breakdownHtml = breakdownRows
    .map(
      (r) => `
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F0EBE5;">
        <span style="font-size:10.5px;color:#4B5563;">${r.label}</span>
        <span style="font-size:10.5px;font-weight:600;color:#1F2937;">${formatEuro(r.value)}</span>
      </div>`
    )
    .join('');

  const assumptionsHtml = assumptions
    .map(
      (a) => `<div style="font-size:10px;color:#4B5563;padding:3px 0 3px 16px;position:relative;">
        <span style="position:absolute;left:0;color:#D4782F;font-weight:700;">•</span>${a}
      </div>`
    )
    .join('');

  const costBasisNote = `The base construction cost reflects direct building construction costs (KG 300–600) from above-ground building area only. Covered Terraces and Balcony Area do not count into building area; instead, they feed upstream into the benchmark allocation as weighted benchmark contributions using the corrected benchmark rate. Basement remains a separate bucket. Contractor margin, planning costs, external works, and VAT are calculated separately.`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  @page { margin: 32px 36px; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #1F2937;
    background: #fff;
    font-size: 11px;
    line-height: 1.5;
    padding: 36px 44px;
  }
  .page-break {
    page-break-before: always;
    break-before: page;
  }
  .divider {
    border: none;
    border-top: 1px solid #E5DDD4;
    margin: 20px 0;
  }
  .divider-strong {
    border: none;
    border-top: 2px solid #1B3A4B;
    margin: 20px 0;
  }
</style>
</head>
<body>

<!-- HEADER -->
<div style="margin-bottom:6px;">
  <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#D4782F;font-weight:600;margin-bottom:4px;">Feasibility Estimate</div>
  <div style="font-size:24px;font-weight:800;color:#1B3A4B;letter-spacing:-0.5px;line-height:1.2;">${title}</div>
  <div style="font-size:11px;color:#6B7280;margin-top:4px;">Preliminary cost assessment for early-stage project planning</div>
</div>

<hr class="divider-strong" />

<!-- PROJECT OVERVIEW -->
<div style="margin-bottom:18px;">
  <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#1B3A4B;margin-bottom:10px;">Project Overview</div>
  <div style="background:#F9F6F2;border-radius:6px;padding:14px 18px;">
    ${overviewHtml}
  </div>
</div>

<!-- ESTIMATED TOTAL PROJECT COST -->
<div style="margin-bottom:6px;">
  <div style="background:linear-gradient(135deg, #1B3A4B 0%, #2C5F6E 100%);border-radius:10px;padding:28px 24px;text-align:center;">
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.6);margin-bottom:8px;">Estimated Total Project Cost</div>
    <div style="font-size:36px;font-weight:800;color:#FFFFFF;letter-spacing:-1px;line-height:1.1;">${formatEuro(data.totalCost)}</div>
  </div>
</div>
<div style="font-size:10px;color:#6B7280;text-align:center;font-style:italic;margin-bottom:22px;line-height:1.5;">
  This estimate represents the likely total project budget based on the parameters defined above.
</div>

<hr class="divider" />

<!-- COST DISTRIBUTION CHART -->
<div style="margin-bottom:18px;">
  <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#1B3A4B;margin-bottom:14px;">Construction Cost Distribution</div>
  ${renderPieChart(segments)}
</div>

<hr class="divider" />

<!-- COST BREAKDOWN -->
<div style="margin-bottom:18px;">
  <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#1B3A4B;margin-bottom:10px;">Cost Breakdown</div>
  <div style="padding:0 4px;">
    ${breakdownHtml}
    <div style="display:flex;justify-content:space-between;padding:10px 0 6px 0;border-top:2px solid #1B3A4B;margin-top:4px;">
      <span style="font-size:12px;font-weight:700;color:#1B3A4B;">Total Project Cost</span>
      <span style="font-size:12px;font-weight:800;color:#1B3A4B;">${formatEuro(data.totalCost)}</span>
    </div>
  </div>
</div>

<hr class="divider" />

<!-- ASSUMPTIONS -->
<div style="margin-bottom:4px;">
  <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#1B3A4B;margin-bottom:10px;">Assumptions</div>
  <div style="padding:0 4px;">
    ${assumptionsHtml}
  </div>
  <div style="margin-top:10px;padding:10px 14px;background:#FFFBF5;border-left:3px solid #D4782F;border-radius:0 4px 4px 0;font-size:9px;color:#6B7280;line-height:1.6;">
    ${costBasisNote}
  </div>
</div>

<!-- PAGE 2 -->
<div class="page-break"></div>

<!-- ESTIMATED COST RANGE -->
<div style="margin-bottom:22px;">
  <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#1B3A4B;margin-bottom:12px;">Estimated Cost Range</div>
  <div style="background:#F9F6F2;border:1px solid #E5DDD4;border-radius:8px;padding:20px 24px;text-align:center;">
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#6B7280;margin-bottom:6px;">Likely project cost</div>
    <div style="font-size:22px;font-weight:800;color:#1B3A4B;letter-spacing:-0.5px;">${formatEuro(rangeLow)}  –  ${formatEuro(rangeHigh)}</div>
    <div style="font-size:9px;color:#9CA3AF;margin-top:6px;">Based on ±12% estimation uncertainty</div>
  </div>
</div>

<hr class="divider" />

<!-- DISCLAIMER -->
<div style="margin-bottom:22px;">
  <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#1B3A4B;margin-bottom:10px;">Disclaimer</div>
  <div style="background:#FFFBF5;border-left:3px solid #D4782F;border-radius:0 6px 6px 0;padding:14px 18px;font-size:10px;color:#6B7280;line-height:1.7;">
    Preliminary estimate based on typical construction assumptions. Final costs depend on design development, site conditions, and contractor pricing.
  </div>
</div>

<hr class="divider" />

<!-- PREPARED BY -->
<div style="padding-top:8px;">
  <div style="font-size:8px;text-transform:uppercase;letter-spacing:1.5px;color:#9CA3AF;margin-bottom:8px;">Prepared by</div>
  <div style="font-size:16px;font-weight:800;color:#1B3A4B;letter-spacing:-0.3px;">Philipp Doukakis</div>
  <div style="font-size:11px;color:#6B7280;margin-bottom:8px;">Architect</div>
  <a href="https://philippdoukakis.com" style="font-size:11px;color:#D4782F;text-decoration:none;font-weight:600;border-bottom:1px solid #F0DFD1;">philippdoukakis.com</a>
</div>

</body>
</html>`;
}
