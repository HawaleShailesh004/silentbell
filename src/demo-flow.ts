import {
  connectChain,
  enrolStudent,
  fileSilent,
  readLedger,
} from "./chain-client";

async function expectFail(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    throw new Error(`${label}: expected failure`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("expected failure")) throw err;
    console.log(`  FAIL as expected (${label}): ${msg.split("\n")[0]}`);
  }
}

async function main() {
  console.log("\nSilent Bell demo flow (local/active network)\n");
  const handle = await connectChain();
  console.log(`  Network: ${handle.network}`);
  console.log(`  Contract: ${handle.address}\n`);

  console.log("1. Enrol Asha + Meera");
  const a = await enrolStudent(handle, "asha");
  console.log(`  Asha enrol tx ${a.txId}`);
  const m = await enrolStudent(handle, "meera");
  console.log(`  Meera enrol tx ${m.txId}`);

  console.log("\n2. Ravi (outsider) files silent - must fail");
  await expectFail("ravi", () => fileSilent(handle, "ravi", 2));

  console.log("\n3. Asha files silent (Hostel)");
  const filed = await fileSilent(handle, "asha", 2);
  console.log(`  Asha file tx ${filed.txId}`);

  console.log("\n4. Asha files same category again - must fail (nullifier)");
  await expectFail("duplicate", () => fileSilent(handle, "asha", 2));

  const ledger = await readLedger(handle);
  console.log("\nLedger:", ledger);
  await handle.walletCtx.wallet.stop();
  console.log("\nDemo flow complete.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
