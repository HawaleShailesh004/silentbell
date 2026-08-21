/** Deterministic 32-byte secrets for the hackathon demo. Not for mainnet. */

function labelSecret(label: string): Uint8Array {
  const out = new Uint8Array(32);
  const encoded = new TextEncoder().encode(label);
  out.set(encoded.subarray(0, 32));
  return out;
}

export const DEMO_SECRETS = {
  registrar: labelSecret("silentbell:registrar:v1"),
  asha: labelSecret("silentbell:asha:v1"),
  meera: labelSecret("silentbell:meera:v1"),
  ravi: labelSecret("silentbell:ravi:v1"),
} as const;

export type StudentPersona = "asha" | "meera" | "ravi";
