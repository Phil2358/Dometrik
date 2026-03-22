export interface Din276Node {
  code: string;
  label: string;
  description?: string;
  children?: Din276Node[];
}

export interface Din276Group extends Din276Node {
  children: Din276Node[];
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
    label: 'Building - Building Constructions',
    description: 'Construction works and building fabric required to create the building structure, excluding technical systems in KG 400. Includes fixed built-in elements serving the building’s purpose and construction-related overarching measures.',
    children: [
      { code: '310', label: 'Earthworks and Excavation' },
      { code: '320', label: 'Foundations and Substructure' },
      {
        code: '330',
        label: 'External Walls / Vertical Building Structures, External',
        description: 'Load-bearing and non-load-bearing vertical building structures located at the outer sides of the building, exposed to the exterior climate, the ground, or adjacent structures.',
        children: [
          {
            code: '331',
            label: 'Load-Bearing External Walls',
            description: 'External walls and planar structural elements required for the stability of the building, including horizontal waterproofing, chases, and penetrations.',
          },
          {
            code: '332',
            label: 'Non-Load-Bearing External Walls',
            description: 'External walls and planar elements not required for the structural stability of the building, such as parapets, attics, and infill elements, including horizontal waterproofing, penetrations, and filling layers such as insulation.',
          },
          {
            code: '333',
            label: 'External Columns',
            description: 'External columns, pillars, pylons, and piers located on the outer sides of the building.',
          },
          {
            code: '334',
            label: 'External Wall Openings',
            description: 'Doors, gates, windows, shopfronts, glazed façades, and other external wall openings, including sills, frames, fittings, drives, ventilation elements, and similar built-in components.',
          },
          {
            code: '335',
            label: 'External Wall Claddings, External Side',
            description: 'Exterior-side finishes and claddings on walls and columns, including plaster, sealing, insulation, and protective layers. Also includes façade and wall greening systems fixed to the exterior side of external walls.',
          },
          {
            code: '336',
            label: 'External Wall Claddings, Internal Side',
            description: 'Interior-side finishes and claddings on walls and columns of external wall constructions, including plaster, sealing, insulation, and protective layers. Also includes wall greening systems fixed to the interior side of external walls.',
          },
        ],
      },
      {
        code: '340',
        label: 'Internal Walls / Vertical Building Structures, Internal',
        description: 'Load-bearing and non-load-bearing vertical building structures located within the building.',
        children: [
          {
            code: '341',
            label: 'Load-Bearing Internal Walls',
            description: 'Internal walls and planar structural elements required for the stability of the building, including horizontal waterproofing, chases, and penetrations.',
          },
          {
            code: '342',
            label: 'Non-Load-Bearing Internal Walls',
            description: 'Internal walls and planar elements not required for structural stability, such as partitions and infill elements, including horizontal waterproofing, penetrations, and filling layers such as insulation.',
          },
          {
            code: '343',
            label: 'Internal Columns',
            description: 'Internal columns, pillars, pylons, and piers located within the building.',
          },
          {
            code: '344',
            label: 'Internal Wall Openings',
            description: 'Internal windows, doors, gates, shopfront-type elements, and other openings within internal wall constructions, including sills, frames, fittings, drives, ventilation elements, and similar built-in components.',
          },
          {
            code: '345',
            label: 'Internal Wall Claddings',
            description: 'Finishes and claddings on internal walls and columns, including plaster, sealing, insulation, and protective layers. Also includes greening systems fixed to internal walls.',
          },
        ],
      },
      {
        code: '350',
        label: 'Floors / Horizontal Building Structures',
        description: 'Load-bearing and non-load-bearing construction elements for slabs, stairs, ramps, and other horizontal building structures.',
        children: [
          {
            code: '351',
            label: 'Slab / Floor Structures',
            description: 'Load-bearing structural constructions for slabs, stairs, ramps, and balconies.',
          },
          {
            code: '353',
            label: 'Floor Finishes',
            description: 'Layers on slab and floor structures, including screeds, sealing, insulation, protective layers, wear layers, sprung floors, and raised access floors. Also includes greening systems fixed to horizontal structures where relevant.',
          },
          {
            code: '354',
            label: 'Ceiling Finishes / Ceiling Linings',
            description: 'Finishes and linings below slab structures, including plaster, sealing, insulation, protective layers, and light or combined ceiling systems.',
          },
        ],
      },
      {
        code: '360',
        label: 'Roofs',
        description: 'Load-bearing and non-load-bearing construction elements for flat roofs, pitched roofs, and other horizontal structures that form the upper closure of the building.',
        children: [
          {
            code: '361',
            label: 'Roof Structures',
            description: 'Load-bearing roof structures including roofs, canopies, roof frames, space frames, domes, vaults, beams, supports, and filling elements such as insulation or void-forming layers.',
          },
          {
            code: '363',
            label: 'Roof Coverings',
            description: 'Layers on roof structures for unused and used roof areas, including sheathing, battens, slope-forming layers, sealing, insulation, drainage, protective layers, wear layers, and roof drainage up to the connection to wastewater systems. Also includes extensive and intensive green roof systems.',
          },
        ],
      },
      { code: '370', label: 'Infrastructure Installations' },
      { code: '380', label: 'Built-In Construction Elements' },
      { code: '390', label: 'Other Construction Works' },
    ],
  },
  {
    code: '400',
    label: 'Technical Systems',
    children: [
      { code: '410', label: 'Sanitary / Plumbing' },
      { code: '420', label: 'Heating' },
      { code: '430', label: 'Ventilation / Cooling' },
      { code: '440', label: 'Electrical' },
      { code: '450', label: 'Data / Security' },
      { code: '460', label: 'Conveying Systems' },
      { code: '470', label: 'Kitchen Installation' },
      { code: '480', label: 'Automation / Smart Home' },
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
      { code: '548', label: 'Pool Basin / Structural Pool Works' },
      { code: '550', label: 'Technical Systems' },
      { code: '560', label: 'Built-In Elements in External Works and Open Spaces' },
      { code: '570', label: 'Green Areas' },
      { code: '580', label: 'Water Features' },
      { code: '590', label: 'Other External Works' },
    ],
  },
  {
    code: '600',
    label: 'Furnishings and Artworks',
    children: [
      { code: '610', label: 'General Furnishings' },
      { code: '620', label: 'Special Furnishings' },
      { code: '630', label: 'Information Technology Furnishings' },
      { code: '640', label: 'Artistic Furnishings' },
      { code: '690', label: 'Other Furnishings' },
    ],
  },
  {
    code: '700',
    label: 'Planning & Professional Fees',
    children: [
      { code: '710', label: 'Architectural Services' },
      { code: '720', label: 'Engineering Services' },
      { code: '750', label: 'Permits and Approvals' },
    ],
  },
];

function findDin276Node(code: string, nodes: Din276Node[]): Din276Node | undefined {
  for (const node of nodes) {
    if (node.code === code) return node;
    if (node.children) {
      const childMatch = findDin276Node(code, node.children);
      if (childMatch) return childMatch;
    }
  }
  return undefined;
}

export function getDin276Group(code: string): Din276Group | undefined {
  return DIN276_GROUPS.find((group) => group.code === code);
}

export function getDin276Subgroup(code: string): Din276Node | undefined {
  for (const group of DIN276_GROUPS) {
    const subgroup = findDin276Node(code, group.children);
    if (subgroup) return subgroup;
  }
  return undefined;
}
