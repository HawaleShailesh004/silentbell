export type FailKind =
  | "outsider"
  | "duplicate"
  | "committee"
  | "network"
  | "other";

export const FAIL_COPY: Record<FailKind, { title: string; body: string }> = {
  outsider: {
    title: "Not on the roll",
    body: "This wallet is not on the roll. Midnight rejected the proof. We never saw a name - there was not a valid leaf.",
  },
  duplicate: {
    title: "Already rang this category",
    body: "This credential already rang this category this epoch. That is how hoaxes die. The ledger still does not know which student.",
  },
  committee: {
    title: "Committee does not file",
    body: "Dr. Mehta reads the inbox. Filing is a student circuit. Open The Inbox.",
  },
  network: {
    title: "Chain API unreachable",
    body: "The Compact circuit never ran. Start the chain API on 8789 and the blob API on 8788.",
  },
  other: {
    title: "Proof did not land",
    body: "The circuit refused this call. The public rail did not gain a fake success chip.",
  },
};

export function classifyFail(message: string, persona: string): FailKind {
  const m = message.toLowerCase();
  if (persona === "mehta") return "committee";
  if (
    persona === "ravi" ||
    m.includes("not on the roll") ||
    m.includes("checkroot")
  )
    return "outsider";
  if (m.includes("already rang") || m.includes("already rang this category"))
    return "duplicate";
  if (
    m.includes("failed to fetch") ||
    m.includes("network") ||
    m.includes("chain api")
  )
    return "network";
  return "other";
}

export function successCopy(named: boolean, handle: string, txId: string) {
  if (named) {
    return `Named rail is a choice, not a leak. Handle “${handle}” is on the ledger. tx ${txId}`;
  }
  return (
    "The roll says you belong. The ledger does not say who you are. " + txId
  );
}
