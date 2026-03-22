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
    label: 'Building - Technical Systems',
    description: 'Construction works and supplied systems required to create the building’s technical installations. Includes cross-system measures associated with technical systems. The individual technical systems include associated supports, fixings, valves, thermal and cold insulation, acoustic and fire protection provisions, covers, enclosures, coatings, markings, and factory-integrated measuring, control, and regulating components.',
    children: [
      {
        code: '410',
        label: 'Wastewater, Water, and Gas Systems',
        description: 'Technical systems for wastewater, water, and gas services, primarily sanitary engineering installations.',
        children: [
          {
            code: '411',
            label: 'Wastewater Systems',
            description: 'Drains, wastewater pipes, wastewater collection systems, wastewater treatment systems, and lifting units.',
          },
          {
            code: '412',
            label: 'Water Systems',
            description: 'Water extraction, treatment, and pressure-boosting systems, piping, decentralized water heaters, and sanitary fixtures.',
          },
        ],
      },
      {
        code: '420',
        label: 'Heat Supply Systems',
        description: 'Systems for heat generation, heat distribution, and heat emission within the building.',
        children: [
          {
            code: '421',
            label: 'Heat Generation Systems',
            description: 'Fuel supply, heat transfer stations, heat generation based on fuels or renewable/inexhaustible energy sources, including chimney connections and central water-heating systems.',
          },
          {
            code: '422',
            label: 'Heat Distribution Networks',
            description: 'Pumps, manifolds, and piping for heating surfaces, ventilation systems, and other heat consumers.',
          },
          {
            code: '423',
            label: 'Room Heating Surfaces',
            description: 'Radiators and surface heating systems.',
          },
        ],
      },
      {
        code: '430',
        label: 'Ventilation and Air-Handling Systems',
        description: 'Ventilation and air-handling systems, with or without ventilation functions depending on the specific subgroup.',
        children: [
          {
            code: '433',
            label: 'Air-Conditioning Systems',
            description: 'Systems with four thermodynamic air-treatment functions.',
          },
        ],
      },
      {
        code: '440',
        label: 'Electrical Systems',
        description: 'Electrical power installations including fire-protection penetrations where not included in other cost groups, but excluding the systems assigned to KG 450.',
        children: [
          {
            code: '442',
            label: 'Self-Generated Power Supply Systems',
            description: 'Power-generation units including cooling, exhaust systems, fuel supply, central battery systems, uninterruptible power supply systems, and photovoltaic systems.',
          },
          {
            code: '444',
            label: 'Low-Voltage Installation Systems',
            description: 'Cables, lines, sub-distribution boards, installation systems, and electrical installation devices.',
          },
        ],
      },
      {
        code: '450',
        label: 'Communication, Security, and Information Technology Systems',
        description: 'Communication, safety, and information technology systems including associated distribution boards, cables, lines, and fire-protection penetrations.',
        children: [
          {
            code: '451',
            label: 'Telecommunications Systems',
            description: 'Systems for data transmission of voice, text, and image, where not included in KG 630.',
          },
          {
            code: '455',
            label: 'Audiovisual Media and Antenna Systems',
            description: 'Audiovisual media systems, where not included in other cost groups, including transmitting and receiving antenna systems and converters.',
          },
          {
            code: '456',
            label: 'Hazard Detection and Alarm Systems',
            description: 'Fire alarm, intrusion alarm, hold-up alarm, guard control, access control, and surveillance systems in private and public areas.',
          },
          {
            code: '457',
            label: 'Data Transmission Networks',
            description: 'Networks for transmitting voice, text, and image data, where not included in other cost groups, including installation systems where not included in KG 444.',
          },
        ],
      },
      { code: '460', label: 'Conveying Systems' },
      { code: '470', label: 'Kitchen Installation' },
      {
        code: '480',
        label: 'Building and System Automation',
        description: 'Monitoring, control, regulation, and optimization facilities for the automatic execution of technical functional processes.',
        children: [
          {
            code: '481',
            label: 'Automation Devices',
            description: 'Automation stations, operating/display/output devices, hardware and software, licenses, functions, interfaces, field devices, and programming equipment.',
          },
          {
            code: '482',
            label: 'Control Cabinets and Automation Centers',
            description: 'Control cabinets for housing automation devices, power assemblies, control assemblies, and protection assemblies.',
          },
          {
            code: '483',
            label: 'Automation Management',
            description: 'Higher-level automation and management systems including operating/display/output devices, hardware and software, licenses, functions, and interfaces.',
          },
          {
            code: '484',
            label: 'Cables, Lines, and Installation Systems',
            description: 'Cables, lines, and installation systems where not included in other cost groups.',
          },
          {
            code: '485',
            label: 'Data Transmission Networks',
            description: 'Data transmission networks where not included in other cost groups.',
          },
        ],
      },
      { code: '490', label: 'Other Technical Systems' },
    ],
  },
  {
    code: '500',
    label: 'Outdoor Facilities and Open Spaces',
    description: 'Outdoor facilities and open-space works on the property, including surfaces, external constructions, technical systems, fittings, and planting. Excludes independent buildings that belong in KG 300.',
    children: [
      { code: '510', label: 'Earthworks' },
      { code: '520', label: 'Foundations and Substructure' },
      {
        code: '530',
        label: 'Surface Construction, Paving, and Surfacing',
        description: 'Upper construction layers and finished surface build-ups for open-space areas, including circulation areas, terraces, and parking-related surfaces.',
        children: [
          {
            code: '533',
            label: 'Squares, Courtyards, Terraces',
            description: 'Upper construction and surface layers for squares, courtyards, terraces, and seating areas.',
          },
          {
            code: '534',
            label: 'Parking Spaces',
            description: 'Upper construction and surface layers for areas intended for parked vehicles.',
          },
        ],
      },
      {
        code: '540',
        label: 'External Constructions',
        description: 'Building constructions in outdoor facilities and open spaces that are independent and not part of a building. Earthworks belong to KG 510, and foundations/substructure belong to KG 520. Independent standalone buildings belong in KG 300.',
        children: [
          {
            code: '541',
            label: 'Enclosures / Fences',
            description: 'Fences, walls, doors, gates, protective grilles, barrier systems, and similar enclosure elements.',
          },
          {
            code: '543',
            label: 'Wall Constructions',
            description: 'Retaining walls, gravity walls, and segmented or panelized wall constructions, including claddings, infill components, and waterproofing.',
          },
          {
            code: '544',
            label: 'Ramps, Stairs, Terraces / Tiers',
            description: 'Ramps, stairs, and stepped or tiered structures, including railings, handrails, and fall-protection elements.',
          },
          {
            code: '545',
            label: 'Canopies / Shelters',
            description: 'Canopies, shelters, weather-protection structures, and pergolas, including their supporting structures.',
          },
        ],
      },
      { code: '548', label: 'Pool Basin / Structural Pool Works' },
      { code: '550', label: 'Technical Systems' },
      {
        code: '560',
        label: 'General Outdoor Installations',
        description: 'General built-in outdoor elements and fittings that support use of the open space.',
        children: [
          {
            code: '561',
            label: 'General Fixtures / Installations',
            description: 'Site furnishings and utility items such as benches, bicycle stands, planters, waste bins, flagpoles, bollards, and impact protection elements.',
          },
        ],
      },
      {
        code: '570',
        label: 'Planting and Vegetation Areas',
        description: 'Planting areas and vegetated landscape works, including establishment-related scope.',
        children: [
          {
            code: '573',
            label: 'Planting Areas',
            description: 'Planting of trees, shrubs, and perennials, including fine grading and establishment care.',
          },
          {
            code: '574',
            label: 'Lawn and Seeded Areas',
            description: 'Seeding and lawn installation, including turf and ready-made grass, together with fine grading and establishment care.',
          },
        ],
      },
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
