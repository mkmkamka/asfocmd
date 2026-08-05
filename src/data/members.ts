// Placeholder members for the directory concept. Real data will come from the CMS.
// `services` are indices into home.hero.services in the dictionaries:
// 0 Chimney cleaning · 1 Chimney building · 2 Stoves · 3 Fireplaces · 4 Ventilation
export type Member = {
  id: string;
  name: string;
  initials: string;
  districtId: string;
  services: number[];
};

export const members: Member[] = [
  { id: "1", name: "Ion Rusu", initials: "IR", districtId: "chisinau", services: [0, 1] },
  { id: "2", name: "Andrei Ciobanu", initials: "AC", districtId: "chisinau", services: [3, 2] },
  { id: "3", name: "Sergiu Moraru", initials: "SM", districtId: "chisinau", services: [0, 4] },
  { id: "4", name: "Vasile Croitoru", initials: "VC", districtId: "balti", services: [1, 3] },
  { id: "5", name: "Nicolae Ursu", initials: "NU", districtId: "balti", services: [0] },
  { id: "6", name: "Mihai Popescu", initials: "MP", districtId: "orhei", services: [2, 4] },
  { id: "7", name: "Grigore Lungu", initials: "GL", districtId: "cahul", services: [0, 1] },
  { id: "8", name: "Pavel Rotaru", initials: "PR", districtId: "gagauzia", services: [3] },
  { id: "9", name: "Dumitru Cazacu", initials: "DC", districtId: "ungheni", services: [0, 2] },
  { id: "10", name: "Radu Balan", initials: "RB", districtId: "soroca", services: [1] },
];

// Placeholder per-district totals used to color the map + the readout.
// (Kept realistic rather than tied to the tiny sample above.)
export const districtCounts: Record<string, number> = {
  chisinau: 68,
  balti: 24,
  orhei: 15,
  cahul: 11,
  gagauzia: 9,
  ungheni: 7,
  soroca: 6,
};

export const TOTAL_MEMBERS = 230;
