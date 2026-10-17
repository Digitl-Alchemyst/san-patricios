export type AlliedGroup = {
  name: string;
  description: string;
  chapters?: string[];
};

export const ALLIED_GROUPS: AlliedGroup[] = [
  {
    name: "Black Lives Matter",
    description: "Police accountability and Black liberation organizing.",
    chapters: ["Colorado", "Louisiana", "Florida", "Minneapolis / Twin Cities", "D.C."],
  },
  {
    name: "Occupy",
    description: "Local Occupy movement chapters still active on the ground.",
    chapters: ["Denver", "LA", "Jackson, MS", "Gulf Coast"],
  },
  {
    name: "Cats Not Cops",
    description: "Anti-surveillance and anti-police-militarization direct action.",
  },
  {
    name: "Homeless Outloud",
    description: "Homeless-led advocacy and organizing.",
  },
  {
    name: "Denver Communists",
    description: "Denver-based socialist and communist organizing.",
  },
  {
    name: "Philadelphia Blessing Boxes",
    description: "Neighborhood free-pantry mutual aid network.",
  },
  {
    name: "A.N.O.N",
    description: "Anonymous Northeast Operations Network — regional affiliate network.",
  },
  {
    name: "Million Mask March",
    description: "Annual global day of action in the Anonymous tradition.",
  },
];
