import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "data");
fs.mkdirSync(dir, { recursive: true });
const blobFile = path.join(dir, "blobs.json");
const caseFile = path.join(dir, "cases.json");

const COMMITTEE_TOKEN =
  process.env.COMMITTEE_TOKEN?.trim() || "silentbell-committee-pilot-token";
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;
const hits = new Map();

function load(file) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function save(file, db) {
  fs.writeFileSync(file, JSON.stringify(db, null, 2));
}

function requireCommittee(req, res) {
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token !== COMMITTEE_TOKEN) {
    res.status(401).json({ error: "committee auth required" });
    return false;
  }
  return true;
}

function rateLimit(req, res) {
  // Bucket by coarse path only - never persist IP.
  const key = `${req.method}:${req.path}`;
  const now = Date.now();
  const row = hits.get(key) || { t: now, n: 0 };
  if (now - row.t > RATE_WINDOW_MS) {
    row.t = now;
    row.n = 0;
  }
  row.n += 1;
  hits.set(key, row);
  if (row.n > RATE_MAX) {
    res.status(429).json({ error: "rate limited" });
    return false;
  }
  return true;
}

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", false);
app.use(cors());
app.use(express.json({ limit: "512kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, auth: "committee Bearer required for inbox/cases" });
});

app.post("/v1/blobs", (req, res) => {
  if (!rateLimit(req, res)) return;
  const { commitment, ciphertext, nonce, ephemeralPk, category, rail, handle } =
    req.body ?? {};
  if (!commitment || !ciphertext || !nonce || !ephemeralPk) {
    res
      .status(400)
      .json({ error: "commitment, ciphertext, nonce, ephemeralPk required" });
    return;
  }
  const db = load(blobFile);
  db[commitment] = {
    ciphertext,
    nonce,
    ephemeralPk,
    category,
    rail: rail || "silent",
    handle: handle || "",
    at: Date.now(),
  };
  save(blobFile, db);

  const cases = load(caseFile);
  if (!cases[commitment]) {
    cases[commitment] = {
      status: "new",
      notes: "",
      updatedAt: Date.now(),
    };
    save(caseFile, cases);
  }
  res.json({ ok: true });
});

app.get("/v1/blobs", (req, res) => {
  if (!requireCommittee(req, res)) return;
  const db = load(blobFile);
  const cases = load(caseFile);
  res.json(
    Object.entries(db).map(([commitment, v]) => ({
      commitment,
      ...v,
      status: cases[commitment]?.status || "new",
      notes: cases[commitment]?.notes || "",
    })),
  );
});

app.get("/v1/blobs/:commitment", (req, res) => {
  if (!requireCommittee(req, res)) return;
  const db = load(blobFile);
  const row = db[req.params.commitment];
  if (!row) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const cases = load(caseFile);
  res.json({
    commitment: req.params.commitment,
    ...row,
    status: cases[req.params.commitment]?.status || "new",
    notes: cases[req.params.commitment]?.notes || "",
  });
});

app.patch("/v1/cases/:commitment", (req, res) => {
  if (!requireCommittee(req, res)) return;
  const allowed = new Set([
    "new",
    "acknowledged",
    "escalated",
    "closed",
    "malicious",
  ]);
  const status = String(req.body?.status || "");
  if (!allowed.has(status)) {
    res
      .status(400)
      .json({
        error: "status must be new|acknowledged|escalated|closed|malicious",
      });
    return;
  }
  const db = load(blobFile);
  if (!db[req.params.commitment]) {
    res.status(404).json({ error: "commitment unknown" });
    return;
  }
  const cases = load(caseFile);
  cases[req.params.commitment] = {
    status,
    notes: String(req.body?.notes || cases[req.params.commitment]?.notes || ""),
    updatedAt: Date.now(),
  };
  save(caseFile, cases);
  res.json({ ok: true, ...cases[req.params.commitment] });
});

app.get("/v1/export/:commitment", (req, res) => {
  if (!requireCommittee(req, res)) return;
  const db = load(blobFile);
  const row = db[req.params.commitment];
  if (!row) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const cases = load(caseFile);
  // Case pack: never includes leaf / student id.
  res.json({
    exportedAt: new Date().toISOString(),
    commitment: req.params.commitment,
    category: row.category,
    rail: row.rail,
    namedHandle: row.rail === "named" ? row.handle : "",
    ciphertextMeta: {
      nonce: row.nonce,
      ephemeralPk: row.ephemeralPk,
      // ciphertext included so committee can re-decrypt offline
      ciphertext: row.ciphertext,
    },
    status: cases[req.params.commitment]?.status || "new",
    notes: cases[req.params.commitment]?.notes || "",
  });
});

const port = Number(process.env.PORT || 8788);
app.listen(port, "127.0.0.1", () => {
  console.log(`Silent Bell blob API on http://127.0.0.1:${port}`);
  console.log(
    `Committee token: set COMMITTEE_TOKEN (default pilot token in use)`,
  );
});
