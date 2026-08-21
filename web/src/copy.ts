/** Shared marketing / product voice. Keep UI strings sharp and human. */

export const COPY = {
  metaDescription:
    "Silent Bell — prove you are on the campus roll without revealing which student. Midnight Compact membership proofs for anonymous incident intake.",
  brandLine: "The report that cannot be traced. The student who cannot be faked.",
  signin: {
    title: "Enter as your campus role",
    lead: "Registrar, student, or committee — each door opens a different part of the same product.",
    submit: "Continue",
    demoAside: "Pilot accounts for judges",
    demoHint: "Click a row to walk that role. Replace with campus SSO before any real deploy.",
  },
  demo: {
    title: "Live cast",
    lead: "Real proofs on the local stack — enrol, reject outsider, silent file, block duplicate, named rail, committee ack.",
  },
  registrar: {
    title: "The Roll",
    lead: "Publish this semester’s roster as hashed leaves. Names stay in your CSV. Only membership reaches Compact.",
  },
  bell: {
    title: "Ring silently",
    leadOn: "You are on the roll. File without disclosing which leaf you are.",
    leadOff: "You are not on the roll. Filing will fail — that is the product working.",
  },
  named: {
    title: "Named emergency",
    lead: "You choose to disclose a handle. Use only when silence itself is unsafe.",
  },
  inbox: {
    title: "Committee inbox",
    lead: "Unlock the committee key on this device. Read sealed cases. Act — without learning silent identity.",
  },
  explorer: {
    title: "Public explorer",
    lead: "Anyone can verify epoch and counts. Nobody gets bodies or silent names.",
  },
} as const;
