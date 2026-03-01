// Mapping from CSV checklist numbers (2-11) to Core Principle numbers (1-12)
// CSV categories don't cover Core Principles 11 and 12

export interface CorePrinciple {
  numeral: number;
  name: string;
  description: string;
}

// The 12 Core Principles with their descriptions
export const CORE_PRINCIPLES: CorePrinciple[] = [
  {
    numeral: 1,
    name: 'Advanced Building Envelope',
    description:
      '- Continuous external insulation creates thermal breaks\n- Intelligent moisture barriers with vapor-variable permeability\n- Strategic flashing systems for lifetime water intrusion prevention\n- Building cavities designed for proper drying capabilities\n- Air-sealing techniques exceeding code requirements by 60%+',
  },
  {
    numeral: 2,
    name: 'Bio-Compatible Materials Matrix',
    description:
      '- Zero-VOC structural components and finishes\n- Mold-resistant building materials with hydrophobic properties\n- Formaldehyde-free insulation and cabinetry\n- Natural mineral finishes that actively purify indoor air\n- Antimicrobial surfaces in critical moisture zones',
  },
  {
    numeral: 3,
    name: 'Low-EMF Electrical Architecture',
    description:
      '- Shielded wiring throughout sleeping areas\n- Remote kill switches for bedroom circuits\n- Properly grounded systems reducing electric field exposure\n- Strategic circuit planning separating high and low-voltage lines\n- EMF mitigation techniques at service panels and major appliances',
  },
  {
    numeral: 4,
    name: 'Human-Centric Lighting Ecosystem',
    description:
      '- Full-spectrum LED lighting matching natural daylight profiles\n- Programmable circadian rhythm systems supporting melatonin production\n- Blue-light minimization protocols for evening hours\n- Strategic daylighting design maximizing natural light exposure\n- Low-EMF lighting fixtures with flicker-free operation',
  },
  {
    numeral: 5,
    name: 'Comprehensive Water Purification',
    description:
      '- Whole-house filtration removing sediment, chemicals, and biologicals\n- Specialized shower filters eliminating chlorine and chloramines\n- Structured water technology enhancing cellular hydration\n- Under-counter reverse osmosis systems for drinking water\n- Water softening solutions preserving mineral content',
  },
  {
    numeral: 6,
    name: 'Low-Radiation Technology Integration',
    description:
      '- Hardwired internet throughout with fiber optic capabilities\n- Shielded CAT8 cabling for minimal EMF emissions\n- Wired security systems eliminating wireless radiation\n- Smart home controls via wired connections\n- Strategic placement of necessary wireless access points',
  },
  {
    numeral: 7,
    name: 'Clean Power Systems',
    description:
      '- Solar arrays with battery backup capabilities\n- Dirty electricity filters on critical circuits\n- Whole-house surge protection and power conditioning\n- Ground fault detection beyond code requirements\n- Harmonized electrical systems reducing electromagnetic interference',
  },
  {
    numeral: 8,
    name: 'Comprehensive Mold Prevention Protocol',
    description:
      '- Proactive moisture monitoring systems\n- Real-time humidity controls with automated response\n- Mold-resistant construction techniques in high-risk areas\n- Strategic water detection sensors throughout plumbing systems\n- Proper drainage planes and vapor barriers',
  },
  {
    numeral: 9,
    name: 'Advanced Climate Regulation',
    description:
      '- ERV/HRV systems providing continuous fresh air exchange\n- MERV 13+ filtration removing particulates down to 0.3 microns\n- Active dehumidification maintaining optimal 40-50% humidity\n- Zoned temperature control for personalized comfort\n- VOC sensors triggering increased ventilation when needed',
  },
  {
    numeral: 10,
    name: 'Hygienic Plumbing Infrastructure',
    description:
      '- PEX or copper piping eliminating leaching concerns\n- Proper venting systems preventing sewer gas intrusion\n- Legionella prevention protocols\n- Water hammer arrestors reducing pipe stress\n- Accessible shutoffs and isolation valves',
  },
  {
    numeral: 11,
    name: 'Therapeutic Spatial Design',
    description:
      '- Dedicated wellness spaces (saunas, cold plunge, meditation rooms)\n- Biophilic design elements connecting occupants with nature\n- Acoustic engineering reducing stress-inducing noise\n- Non-toxic materials palette supporting respiratory health\n- Thoughtful space planning',
  },
  {
    numeral: 12,
    name: 'Non-Toxic Furnishing Protocol',
    description:
      '- GOTS-certified organic bedding and textiles\n- Solid wood furniture avoiding particle board off-gassing\n- Natural fiber rugs without synthetic backing\n- Low-VOC paints and finishes throughout\n- Natural material window treatments avoiding vinyl blinds',
  },
];

// Mapping: CSV Master Category number -> Core Principle numeral
// The CSV uses the Project Responsibility Checklist numbering
export const CSV_TO_CORE_PRINCIPLE: Record<number, number> = {
  2: 1,  // Performance Building Strategies -> Advanced Building Envelope
  3: 2,  // Non-Toxic Building Materials -> Bio-Compatible Materials Matrix
  4: 9,  // Climate Control and Ventilation -> Advanced Climate Regulation
  5: 3,  // Electrical Systems (Low-EMF Design) -> Low-EMF Electrical Architecture
  6: 4,  // Circadian Lighting Systems -> Human-Centric Lighting Ecosystem
  7: 6,  // Low-Voltage and Smart Integration -> Low-Radiation Technology Integration
  8: 7,  // Solar and Alternative Power -> Clean Power Systems
  9: 10, // Plumbing -> Hygienic Plumbing Infrastructure
  10: 5, // Water Quality and Advanced Filtration -> Comprehensive Water Purification
  11: 8, // Non-Toxic Cleaning & Mold Reduction -> Comprehensive Mold Prevention Protocol
};

// Extract the leading number from a CSV category string like "2 PERFORMANCE BUILDING STRATEGIES"
export function extractCsvCategoryNumber(categoryStr: string): number | null {
  const match = categoryStr.trim().match(/^(\d+)\s/);
  return match ? parseInt(match[1], 10) : null;
}

// Extract the subcategory number from strings like "2.3 Windows and Exterior Doors"
export function extractSubCategoryInfo(subCatStr: string): {
  fullNumeral: string;
  sortOrder: number;
  name: string;
} | null {
  const match = subCatStr.trim().match(/^(\d+)\.(\d+)\s+(.+)$/);
  if (!match) return null;
  return {
    fullNumeral: `${match[1]}.${match[2]}`,
    sortOrder: parseInt(match[2], 10),
    name: match[3].trim(),
  };
}

// Extract tertiary category info from strings like "2.3.4 Flush/ Hollow Core Doors"
export function extractTertiaryCategoryInfo(tertiaryCatStr: string): {
  fullNumeral: string;
  sortOrder: number;
  name: string;
} | null {
  const match = tertiaryCatStr.trim().match(/^(\d+)\.(\d+)\.(\d+)\s+(.+)$/);
  if (!match) return null;
  return {
    fullNumeral: `${match[1]}.${match[2]}.${match[3]}`,
    sortOrder: parseInt(match[3], 10),
    name: match[4].trim(),
  };
}
