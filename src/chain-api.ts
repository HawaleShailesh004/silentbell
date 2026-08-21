import { Buffer } from "node:buffer";
import express from "express";
import cors from "cors";
import {
  connectChain,
  enrolBySeedLabel,
  enrolStudent,
  fileNamed,
  fileSilent,
  readLedger,
  setEpoch,
  type ChainHandle,
} from "./chain-client";
import type { StudentPersona } from "./demo-keys";

const port = Number(process.env.CHAIN_PORT || 8789);
let handle: ChainHandle | null = null;

async function chain() {
  if (!handle) handle = await connectChain();
  return handle;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_req, res) => {
  try {
    const h = await chain();
    res.json({ ok: true, network: h.network, address: h.address });
  } catch (err) {
    res.status(503).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
});

app.get("/v1/ledger", async (_req, res) => {
  try {
    res.json(await readLedger(await chain()));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.post("/v1/enrol", async (req, res) => {
  try {
    const persona = req.body?.persona as StudentPersona;
    if (persona !== "asha" && persona !== "meera") {
      res.status(400).json({ error: "enrol asha or meera, or use /v1/enrol-batch" });
      return;
    }
    const result = await enrolStudent(await chain(), persona);
    res.json({ ok: true, ...result, pk: Buffer.from(result.pk).toString("hex") });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/structure bounds|exceeded/i.test(msg)) {
      res.status(409).json({
        error:
          "Roster full (16/16 leaves). Depth-4 tree is at capacity — redeploy for a fresh roll, or file with already-enrolled students.",
      });
      return;
    }
    res.status(500).json({ error: msg });
  }
});

/** CSV-shaped batch: [{ alias, seed }] — seed is the student secret label, never a name on chain. */
app.post("/v1/enrol-batch", async (req, res) => {
  try {
    const rows = req.body?.rows as Array<{ alias?: string; seed?: string }> | undefined;
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(400).json({ error: "rows: [{ alias, seed }] required" });
      return;
    }
    if (rows.length > 16) {
      res.status(400).json({ error: "max 16 leaves (tree depth 4)" });
      return;
    }
    const h = await chain();
    const out: Array<{ alias: string; txId: string; pk: string; ok: boolean; error?: string }> = [];
    for (const row of rows) {
      const seed = String(row.seed || "").trim();
      const alias = String(row.alias || seed).trim();
      if (!seed) {
        out.push({ alias, txId: "", pk: "", ok: false, error: "missing seed" });
        continue;
      }
      try {
        const result = await enrolBySeedLabel(h, seed, alias);
        out.push({
          alias,
          txId: result.txId,
          pk: Buffer.from(result.pk).toString("hex"),
          ok: true,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Idempotent-ish: already inserted leaves are reported, not fatal for the batch.
        out.push({ alias, txId: "", pk: "", ok: false, error: msg.split("\n")[0] });
      }
    }
    res.json({ ok: out.some((r) => r.ok), results: out, ledger: await readLedger(h) });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.post("/v1/epoch", async (req, res) => {
  try {
    const epoch = Number(req.body?.epoch);
    if (!Number.isFinite(epoch) || epoch < 1) {
      res.status(400).json({ error: "epoch must be a positive integer" });
      return;
    }
    const result = await setEpoch(await chain(), Math.floor(epoch));
    res.json({ ok: true, ...result, ledger: await readLedger(await chain()) });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.post("/v1/file", async (req, res) => {
  try {
    const persona = req.body?.persona as StudentPersona;
    const category = Number(req.body?.category ?? 0);
    if (persona !== "asha" && persona !== "meera" && persona !== "ravi") {
      res.status(400).json({ error: "persona asha|meera|ravi" });
      return;
    }
    const named = Boolean(req.body?.named);
    const handleLabel = String(req.body?.handle || persona);
    const result = named
      ? await fileNamed(await chain(), persona, category, handleLabel)
      : await fileSilent(await chain(), persona, category);
    res.json({
      ok: true,
      txId: result.txId,
      rail: named ? "named" : "silent",
      commitment: Buffer.from(result.commitment).toString("hex"),
    });
  } catch (err) {
    res.status(400).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
});

app.listen(port, () => {
  console.log(`Silent Bell chain API on http://127.0.0.1:${port}`);
});
