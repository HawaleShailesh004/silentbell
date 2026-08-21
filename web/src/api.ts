const COMMITTEE_TOKEN =
  import.meta.env.VITE_COMMITTEE_TOKEN ?? "silentbell-committee-pilot-token";

export async function postBlob(
  api: string,
  body: {
    commitment: string;
    ciphertext: string;
    nonce: string;
    ephemeralPk: string;
    category: number;
    rail?: string;
    handle?: string;
  },
) {
  const res = await fetch(`${api}/v1/blobs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Blob API " + res.status);
  return res.json();
}

export async function fetchBlobs(api: string, token = COMMITTEE_TOKEN) {
  const res = await fetch(`${api}/v1/blobs`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error("committee auth required");
  if (!res.ok) throw new Error("Blob API " + res.status);
  return res.json();
}

export async function patchCase(
  api: string,
  commitment: string,
  status: string,
  notes = "",
  token = COMMITTEE_TOKEN,
) {
  const res = await fetch(`${api}/v1/cases/${commitment}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, notes }),
  });
  if (!res.ok) throw new Error("case update " + res.status);
  return res.json();
}

export async function exportCase(api: string, commitment: string, token = COMMITTEE_TOKEN) {
  const res = await fetch(`${api}/v1/export/${commitment}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("export " + res.status);
  return res.json();
}

export async function postEnrol(chain: string, persona: string) {
  const res = await fetch(`${chain}/v1/enrol`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ persona }),
  });
  const json = await res.json();
  if (!res.ok || json.ok === false) throw new Error(json.error || "enrol failed");
  return json;
}

export async function postEnrolBatch(
  chain: string,
  rows: Array<{ alias: string; seed: string }>,
) {
  const res = await fetch(`${chain}/v1/enrol-batch`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ rows }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "enrol-batch failed");
  return json;
}

export async function postEpoch(chain: string, epoch: number) {
  const res = await fetch(`${chain}/v1/epoch`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ epoch }),
  });
  const json = await res.json();
  if (!res.ok || json.ok === false) throw new Error(json.error || "epoch failed");
  return json;
}

export async function postFile(
  chain: string,
  persona: string,
  category: number,
  named = false,
  handle?: string,
) {
  const res = await fetch(`${chain}/v1/file`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ persona, category, named, handle }),
  });
  const json = await res.json();
  if (!res.ok || json.ok === false) throw new Error(json.error || "file failed");
  return json;
}

/** Like postFile, but returns { ok:false, error } instead of throwing. */
export async function tryFile(
  chain: string,
  persona: string,
  category: number,
  named = false,
  handle?: string,
): Promise<{ ok: true; txId: string; commitment: string; rail: string } | { ok: false; error: string }> {
  const res = await fetch(`${chain}/v1/file`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ persona, category, named, handle }),
  });
  const json = await res.json();
  if (!res.ok || json.ok === false) {
    return { ok: false, error: String(json.error || `file ${res.status}`) };
  }
  return {
    ok: true,
    txId: String(json.txId),
    commitment: String(json.commitment),
    rail: String(json.rail || (named ? "named" : "silent")),
  };
}

export async function fetchLedger(chain: string) {
  const res = await fetch(`${chain}/v1/ledger`);
  if (!res.ok) throw new Error("ledger " + res.status);
  return res.json();
}

export function parseRosterCsv(text: string): Array<{ alias: string; seed: string }> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const aliasIdx = header.indexOf("alias");
  const seedIdx = header.indexOf("seed");
  if (aliasIdx < 0 || seedIdx < 0) throw new Error("CSV needs alias,seed columns");
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    return { alias: cols[aliasIdx], seed: cols[seedIdx] };
  });
}
