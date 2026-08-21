// Midnight.js ChargedState uses instanceof against onchain-runtime-v3.
// Two physical copies of the same version still fail instanceof. Keep one.
import fs from "node:fs";
import path from "node:path";

const nested = [
  "node_modules/@midnight-ntwrk/compact-runtime/node_modules/@midnight-ntwrk/onchain-runtime-v3",
  "node_modules/@midnight-ntwrk/midnight-js-protocol/node_modules/@midnight-ntwrk/onchain-runtime-v3",
];

for (const rel of nested) {
  const abs = path.join(process.cwd(), rel);
  if (fs.existsSync(abs)) {
    fs.rmSync(abs, { recursive: true, force: true });
    process.stdout.write(`deduped ${rel}\n`);
  }
}
