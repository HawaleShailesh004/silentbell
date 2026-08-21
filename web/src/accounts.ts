/** Pilot / market-demo accounts. Replace with campus SSO in production. */

export type AppRole = "registrar" | "student" | "committee" | "public";

export type AccountId = "registrar" | "asha" | "meera" | "ravi" | "mehta";

export type Account = {
  id: AccountId;
  email: string;
  password: string;
  displayName: string;
  role: AppRole;
  /** Maps to chain persona for student filings; null for staff. */
  chainPersona: "asha" | "meera" | "ravi" | null;
  enrolled: boolean;
  title: string;
};

/**
 * Demo credentials for judges and pilots.
 * Password policy is intentionally simple for the hackathon booth — rotate before any real campus.
 */
export const ACCOUNTS: Account[] = [
  {
    id: "registrar",
    email: "registrar@campus.edu",
    password: "SilentBell!Registrar",
    displayName: "Campus Registrar",
    role: "registrar",
    chainPersona: null,
    enrolled: false,
    title: "Issues the semester roll",
  },
  {
    id: "asha",
    email: "asha@campus.edu",
    password: "SilentBell!Student",
    displayName: "Asha Sharma",
    role: "student",
    chainPersona: "asha",
    enrolled: true,
    title: "1st year · on the roll",
  },
  {
    id: "meera",
    email: "meera@campus.edu",
    password: "SilentBell!Student",
    displayName: "Meera Iyer",
    role: "student",
    chainPersona: "meera",
    enrolled: true,
    title: "2nd year · on the roll",
  },
  {
    id: "ravi",
    email: "ravi@outsider.test",
    password: "SilentBell!Outsider",
    displayName: "Ravi (not enrolled)",
    role: "student",
    chainPersona: "ravi",
    enrolled: false,
    title: "Outsider — used to show rejection",
  },
  {
    id: "mehta",
    email: "committee@campus.edu",
    password: "SilentBell!Committee",
    displayName: "Dr. Mehta",
    role: "committee",
    chainPersona: null,
    enrolled: false,
    title: "Equity / ICC committee",
  },
];

export function findAccount(email: string, password: string): Account | null {
  const e = email.trim().toLowerCase();
  const row = ACCOUNTS.find((a) => a.email.toLowerCase() === e && a.password === password);
  return row ?? null;
}

export function accountById(id: AccountId): Account {
  return ACCOUNTS.find((a) => a.id === id)!;
}

/** Short cheat-sheet for the sign-in / demo panel. */
export const DEMO_CREDENTIAL_ROWS = ACCOUNTS.map((a) => ({
  role: a.role,
  email: a.email,
  password: a.password,
  who: a.displayName,
}));
