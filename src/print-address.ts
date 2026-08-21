/**
 * Print PreProd unshielded address without waiting for full chain sync.
 * Use this to fund the faucet while deploy sync is blocked/slow.
 */
import { WebSocket } from "ws";
import { resolveNetwork, getOrCreateWallet, setActiveNetwork } from "./network";
import { createWallet } from "./wallet";

// @ts-expect-error Required for wallet SDK
globalThis.WebSocket = WebSocket;

async function main() {
  setActiveNetwork("preprod");
  const { network, config: networkConfig } = resolveNetwork({
    argv: ["node", "print-address", "--network", "preprod"],
  });
  const WALLET = getOrCreateWallet(network);
  const walletCtx = await createWallet({
    network,
    networkConfig,
    seed: WALLET.seed,
    restore: false,
  });
  const address = walletCtx.unshieldedKeystore.getBech32Address().toString();
  console.log("\nPreProd unshielded address (fund this):\n");
  console.log(`  ${address}\n`);
  console.log(`Faucet: ${networkConfig.faucet}`);
  console.log("After funding, run: npx tsx src/deploy.ts --network preprod\n");
  if (WALLET.mnemonic) {
    console.log("(Recovery phrase is in .midnight-state.json — do not commit.)\n");
  }
  await walletCtx.wallet.stop();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
