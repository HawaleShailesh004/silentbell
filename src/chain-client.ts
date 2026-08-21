import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { WebSocket } from "ws";
import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";
import { resolveNetwork, getOrCreateWallet, getDeployment } from "./network";
import { createWallet, persistWalletState, type WalletContext } from "./wallet";
import { witnesses, emptyPrivateState, type BellPrivateState } from "./witnesses";
import { DEMO_SECRETS, type StudentPersona } from "./demo-keys";
import { deriveStudentPk, pad32 } from "./leaf";

// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

const PRIVATE_STATE_ID = "silentBellPrivateState";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, "..", "contracts", "managed", "silent-bell");

const SilentBell = await import(pathToFileURL(path.join(zkConfigPath, "contract", "index.js")).href);

const compiledContractFactory: any = CompiledContract.make("silent-bell", SilentBell.Contract);
const compiledContract = compiledContractFactory.pipe(
  CompiledContract.withWitnesses(witnesses as any) as any,
  CompiledContract.withCompiledFileAssets(zkConfigPath) as any,
);

export type ChainHandle = {
  walletCtx: WalletContext;
  providers: any;
  deployed: any;
  network: string;
  address: string;
};

async function createProviders(walletCtx: WalletContext) {
  const privateStatePassword =
    process.env.PRIVATE_STATE_PASSWORD?.trim() || "Local-Devnet-Development-Placeholder-1";
  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();
  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: "silent-bell-state",
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(
      resolveNetwork().config.indexer,
      resolveNetwork().config.indexerWS,
    ),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(resolveNetwork().config.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

export async function connectChain(): Promise<ChainHandle> {
  if (!fs.existsSync(path.join(zkConfigPath, "contract", "index.js"))) {
    throw new Error("Contract not compiled");
  }
  const { network, config: networkConfig } = resolveNetwork();
  const deployment = getDeployment(network);
  if (!deployment) {
    throw new Error(`No deploy for ${network}. Run npm run setup first.`);
  }
  const WALLET = getOrCreateWallet(network);
  const walletCtx = await createWallet({ network, networkConfig, seed: WALLET.seed });
  await walletCtx.wallet.waitForSyncedState();
  await persistWalletState(network, walletCtx);
  const providers = await createProviders(walletCtx);
  providers.privateStateProvider.setContractAddress(deployment.address);
  await providers.privateStateProvider.set(
    PRIVATE_STATE_ID,
    emptyPrivateState(DEMO_SECRETS.registrar) as BellPrivateState,
  );
  const deployed = await findDeployedContract(providers, {
    compiledContract: compiledContract as any,
    contractAddress: deployment.address,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: emptyPrivateState(DEMO_SECRETS.registrar),
  });
  return { walletCtx, providers, deployed, network, address: deployment.address };
}

export async function withPersona(handle: ChainHandle, secret: Uint8Array) {
  handle.providers.privateStateProvider.setContractAddress(handle.address);
  await handle.providers.privateStateProvider.set(
    PRIVATE_STATE_ID,
    emptyPrivateState(secret) as BellPrivateState,
  );
  return handle.deployed;
}

export async function enrolStudent(handle: ChainHandle, persona: StudentPersona) {
  return enrolBySecret(handle, DEMO_SECRETS[persona], persona);
}

export async function enrolBySecret(handle: ChainHandle, secret: Uint8Array, alias = "seed") {
  const admin = await withPersona(handle, DEMO_SECRETS.registrar);
  const pk = deriveStudentPk(secret);
  const tx = await admin.callTx.enrol(pk);
  return { txId: tx.public.txId, pk, alias };
}

export async function enrolBySeedLabel(handle: ChainHandle, seedLabel: string, alias?: string) {
  const secret = labelSecret(seedLabel);
  return enrolBySecret(handle, secret, alias || seedLabel);
}

function labelSecret(label: string): Uint8Array {
  const out = new Uint8Array(32);
  const encoded = new TextEncoder().encode(label);
  out.set(encoded.subarray(0, 32));
  return out;
}

export async function setEpoch(handle: ChainHandle, next: number) {
  const admin = await withPersona(handle, DEMO_SECRETS.registrar);
  const tx = await admin.callTx.setEpoch(BigInt(next));
  return { txId: tx.public.txId, epoch: next };
}

export async function fileSilent(handle: ChainHandle, persona: StudentPersona, category: number) {
  const student = await withPersona(handle, DEMO_SECRETS[persona]);
  const commitment = crypto.getRandomValues(new Uint8Array(32));
  const tx = await student.callTx.fileSilent(BigInt(category), commitment);
  return { txId: tx.public.txId, commitment };
}

export async function fileNamed(
  handle: ChainHandle,
  persona: StudentPersona,
  category: number,
  handleLabel: string,
) {
  const student = await withPersona(handle, DEMO_SECRETS[persona]);
  const commitment = crypto.getRandomValues(new Uint8Array(32));
  const namedHandle = pad32(handleLabel);
  const tx = await student.callTx.fileNamed(BigInt(category), commitment, namedHandle);
  return { txId: tx.public.txId, commitment };
}

export async function readLedger(handle: ChainHandle) {
  const contractState = await handle.providers.publicDataProvider.queryContractState(handle.address);
  if (!contractState) return { silentCount: 0, namedCount: 0, epoch: 0 };
  const ledger = SilentBell.ledger(contractState.data);
  const count = (v: unknown) =>
    Number(typeof v === "object" && v && "read" in v ? (v as { read: () => bigint }).read() : v);
  return {
    silentCount: count(ledger.silentCount),
    namedCount: count(ledger.namedCount),
    epoch: count(ledger.epoch),
    rosterSize: Number(ledger.roster.firstFree()),
    address: handle.address,
    network: handle.network,
  };
}

export { deriveStudentPk, SilentBell };
