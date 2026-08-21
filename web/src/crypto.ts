import { x25519 } from "@noble/curves/ed25519.js";
import { gcm } from "@noble/ciphers/aes.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { utf8ToBytes, bytesToHex, hexToBytes } from "@noble/hashes/utils.js";

const INFO = utf8ToBytes("silentbell:report-box:v1");
const SALT = utf8ToBytes("silentbell:committee:hkdf");

/** Pilot ceremony passphrase. Committee unlocks the inbox with this. Not a production HSM. */
export const COMMITTEE_PASSPHRASE = "silentbell-committee-pilot-v1";

function toB64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function fromB64(s: string) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function clampPrivate(seed: Uint8Array): Uint8Array {
  const out = new Uint8Array(seed);
  out[0] &= 248;
  out[31] &= 127;
  out[31] |= 64;
  return out;
}

/** Derive deterministic X25519 secret from passphrase (pilot key ceremony). */
export function committeeSecretFromPassphrase(passphrase: string): Uint8Array {
  return clampPrivate(sha256(utf8ToBytes(`silentbell:x25519:${passphrase}`)));
}

export function committeePublicKey(passphrase = COMMITTEE_PASSPHRASE): string {
  return bytesToHex(x25519.getPublicKey(committeeSecretFromPassphrase(passphrase)));
}

function aesKeyFromShared(shared: Uint8Array): Uint8Array {
  return hkdf(sha256, shared, SALT, INFO, 32);
}

export type SealedReport = {
  ciphertext: string;
  nonce: string;
  ephemeralPk: string;
};

/** Seal report to the committee X25519 pubkey (ephemeral sender). */
export function encryptReport(plaintext: string, committeePkHex = committeePublicKey()): SealedReport {
  const ephemeralSk = x25519.utils.randomSecretKey();
  const ephemeralPk = x25519.getPublicKey(ephemeralSk);
  const shared = x25519.getSharedSecret(ephemeralSk, hexToBytes(committeePkHex));
  const key = aesKeyFromShared(shared);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = gcm(key, iv);
  const ct = cipher.encrypt(utf8ToBytes(plaintext));
  return {
    ciphertext: toB64(ct),
    nonce: toB64(iv),
    ephemeralPk: bytesToHex(ephemeralPk),
  };
}

/** Open a sealed report with the committee passphrase. */
export function decryptReport(
  sealed: { ciphertext: string; nonce: string; ephemeralPk: string },
  passphrase = COMMITTEE_PASSPHRASE,
): string {
  try {
    const sk = committeeSecretFromPassphrase(passphrase);
    const shared = x25519.getSharedSecret(sk, hexToBytes(sealed.ephemeralPk));
    const key = aesKeyFromShared(shared);
    const cipher = gcm(key, fromB64(sealed.nonce));
    const pt = cipher.decrypt(fromB64(sealed.ciphertext));
    return new TextDecoder().decode(pt);
  } catch {
    return "(could not decrypt — wrong committee key or corrupt capsule)";
  }
}

export function unlockCommittee(passphrase: string): boolean {
  return passphrase.trim() === COMMITTEE_PASSPHRASE;
}
