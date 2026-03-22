export type UserMode = 'private' | 'pro' | 'developer';

export type BreakdownDisplayType = 'private' | 'pro' | 'developer';

export interface UserModeConfig {
  id: UserMode;
  label: string;
  description: string;
  breakdownDisplayType: BreakdownDisplayType;
  showLandPlotModule: boolean;
  supportsDinCodes: boolean;
  supportsDinStructure: boolean;
  supportsDeveloperSummary: boolean;
}

export const USER_MODE_CONFIGS: Record<UserMode, UserModeConfig> = {
  private: {
    id: 'private',
    label: 'Private User',
    description: 'Simple cost breakdown in clear everyday language.',
    breakdownDisplayType: 'private',
    showLandPlotModule: false,
    supportsDinCodes: false,
    supportsDinStructure: false,
    supportsDeveloperSummary: false,
  },
  pro: {
    id: 'pro',
    label: 'Pro / Contractor',
    description: 'Practical execution view with more detail and optional DIN drill-down.',
    breakdownDisplayType: 'pro',
    showLandPlotModule: false,
    supportsDinCodes: true,
    supportsDinStructure: true,
    supportsDeveloperSummary: false,
  },
  developer: {
    id: 'developer',
    label: 'Developer / Real Estate Investor',
    description: 'Feasibility-focused view with risk, value, and soft-cost perspective.',
    breakdownDisplayType: 'developer',
    showLandPlotModule: true,
    supportsDinCodes: true,
    supportsDinStructure: true,
    supportsDeveloperSummary: true,
  },
};

export const USER_MODE_ORDER: UserMode[] = ['private', 'pro', 'developer'];

export function isUserMode(value: string | null | undefined): value is UserMode {
  return value === 'private' || value === 'pro' || value === 'developer';
}

export function migrateLegacyUserMode(value: string | null | undefined): UserMode | null {
  if (isUserMode(value)) return value;
  if (value === 'professional') return 'pro';
  if (value === 'guided') return 'developer';
  return null;
}
