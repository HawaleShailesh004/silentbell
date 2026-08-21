import type { Account, AccountId } from "./accounts";
import { accountById } from "./accounts";

const KEY = "silentbell:session:v1";

export type Session = {
  accountId: AccountId;
  signedInAt: string;
};

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s?.accountId) return null;
    accountById(s.accountId);
    return s;
  } catch {
    return null;
  }
}

export function saveSession(accountId: AccountId): Session {
  const session: Session = { accountId, signedInAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function clearSession(): void {
  localStorage.removeItem(KEY);
}

export function sessionAccount(session: Session | null): Account | null {
  if (!session) return null;
  try {
    return accountById(session.accountId);
  } catch {
    return null;
  }
}
