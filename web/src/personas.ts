export const CATEGORIES = ["Harassment", "Discrimination", "Hostel", "Other"] as const;

export type PersonaId = "asha" | "ravi" | "mehta" | "meera";

export const PERSONAS: Record<
  PersonaId,
  { id: PersonaId; label: string; role: string; enrolled: boolean }
> = {
  asha: { id: "asha", label: "Asha · fresher", role: "student", enrolled: true },
  meera: { id: "meera", label: "Meera · student", role: "student", enrolled: true },
  ravi: { id: "ravi", label: "Ravi · outsider", role: "not on the roll", enrolled: false },
  mehta: { id: "mehta", label: "Dr. Mehta · committee", role: "committee", enrolled: false },
};
