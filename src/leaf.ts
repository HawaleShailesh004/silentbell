import { Buffer } from "node:buffer";
import { persistentHash } from "@midnight-ntwrk/compact-runtime";
import { CompactTypeBytes, CompactTypeVector } from "@midnight-ntwrk/compact-runtime";

const Bytes32 = new CompactTypeBytes(32);
const Vec2 = new CompactTypeVector(2, Bytes32);

export function pad32(text: string): Uint8Array {
  const out = new Uint8Array(32);
  const encoded = new TextEncoder().encode(text);
  out.set(encoded.subarray(0, 32));
  return out;
}

export function deriveStudentPk(sk: Uint8Array): Uint8Array {
  return persistentHash(Vec2, [pad32("silentbell:pk:"), sk]);
}

export function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

export function fromHex(hex: string): Uint8Array {
  return Uint8Array.from(Buffer.from(hex.replace(/^0x/, ""), "hex"));
}
