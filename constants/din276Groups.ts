export interface Din276Subgroup {
  code: string;
  label: string;
}

export interface Din276Group {
  code: string;
  label: string;
  children: Din276Subgroup[];
}

export const DIN276_GROUPS: Din276Group[] = [
  {
    code: '100',
    label: 'Land',
    children: [
      { code: '110', label: 'Land Value' },
      { code: '120', label: 'Incidental Land Acquisition Costs' },
      { code: '130', label: 'Third-Party Rights' },
    ],
  },
  {
    code: '200',
    label: 'Preparatory Measures',
    children: [
      { code: '210', label: 'Site Preparation' },
      { code: '220', label: 'Public Utilities Connections' },
      { code: '230', label: 'Private Utilities Connections' },
      { code: '240', label: 'Compensation Measures and Levies' },
      { code: '250', label: 'Temporary Measures' },
    ],
  },
  {
    code: '300',
    label: 'Building – Construction Works',
    children: [
      { code: '310', label: 'Earthworks and Excavation' },
      { code: '320', label: 'Foundations and Substructure' },
      { code: '330', label: 'External Walls' },
      { code: '340', label: 'Internal Walls' },
      { code: '350', label: 'Floors and Slabs' },
      { code: '360', label: 'Roofs' },
      { code: '370', label: 'Infrastructure Installations' },
      { code: '380', label: 'Built-In Construction Elements' },
      { code: '390', label: 'Other Construction Works' },
    ],
  },
  {
    code: '400',
    label: 'Building – Technical Systems',
    children: [
      { code: '410', label: 'Wastewater, Water, Gas and Sanitary Fixtures' },
      { code: '420', label: 'Heat Supply Systems' },
      { code: '430', label: 'Ventilation and Air-Handling Systems' },
      { code: '440', label: 'Electrical Systems' },
      { code: '450', label: 'Communication, Security and Information Systems' },
      { code: '460', label: 'Conveying Systems' },
      { code: '470', label: 'Kitchen Installation' },
      { code: '480', label: 'Building and Systems Automation' },
      { code: '490', label: 'Other Technical Systems' },
    ],
  },
  {
    code: '500',
    label: 'External Works and Open Spaces',
    children: [
      { code: '510', label: 'Earthworks' },
      { code: '520', label: 'Foundations and Substructure' },
      { code: '530', label: 'Base Courses and Surface Layers' },
      { code: '540', label: 'Structural Works' },
      { code: '550', label: 'Technical Systems' },
      { code: '560', label: 'Built-In Elements in External Works and Open Spaces' },
      { code: '570', label: 'Green Areas' },
      { code: '580', label: 'Water Features' },
      { code: '590', label: 'Other External Works' },
    ],
  },
];