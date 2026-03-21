"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIN276_GROUPS = void 0;
exports.getDin276Group = getDin276Group;
exports.getDin276Subgroup = getDin276Subgroup;
exports.DIN276_GROUPS = [
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
        label: 'Building - Construction Works',
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
function getDin276Group(code) {
    return exports.DIN276_GROUPS.find((group) => group.code === code);
}
function getDin276Subgroup(code) {
    for (const group of exports.DIN276_GROUPS) {
        const subgroup = group.children.find((child) => child.code === code);
        if (subgroup)
            return subgroup;
    }
    return undefined;
}
