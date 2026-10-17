export type AlliedGroup = {
  name: string;
  description: string;
  chapters?: string[];
};

// Movements San Patricios draws its lineage and organizing model from, not a
// claim of formal partnership with any specific present-day organization's
// chapters. "Aligned with" here means shared tradition and solidarity.
export const ALLIED_GROUPS: AlliedGroup[] = [
  {
    name: "Brown Berets",
    description:
      "San Patricios grew out of the Brown Beret tradition of Chicano and Indigenous community defense, education, and youth organizing dating to 1960s East Los Angeles — we consider ourselves part of that lineage, not a separate thing standing next to it.",
  },
  {
    name: "Black Panther Party (1966 model)",
    description:
      "Our community programs — food distribution, know-your-rights and cop-watch patrols, political and cultural education — are structured after the original Black Panther Party's \"survival pending revolution\" model: concrete community service paired with organizing, not charity alone.",
  },
  {
    name: "Black Lives Matter",
    description:
      "We stand in solidarity with Black Lives Matter's organizing against police violence and for Black liberation. An attack on one community's safety is everyone's fight.",
  },
  {
    name: "The broader Panther-descended network",
    description:
      "We're aligned with the wider network of modern Black Panther-descended and Panther-inspired community self-defense organizations carrying that model forward today, alongside Indigenous land- and water-defense movements and the Irish republican mutual-aid tradition.",
  },
  {
    name: "Irish Anti-Colonial Struggle",
    description:
      "We stand in solidarity with the Irish struggle against British occupation and colonialism — the same fight for self-determination the original San Patricios carried with them from Ireland into Mexico. Tiocfaidh ár lá.",
  },
  {
    name: "Free Palestine Movement",
    description:
      "We stand in solidarity with the Palestinian people's fight against occupation and for self-determination, and with the international movement demanding it.",
  },
];
