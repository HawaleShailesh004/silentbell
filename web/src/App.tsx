import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CATEGORIES } from "./personas";
import { ACCOUNTS, DEMO_CREDENTIAL_ROWS, findAccount, type Account } from "./accounts";
import { clearSession, loadSession, saveSession, sessionAccount } from "./session";
import {
  COMMITTEE_PASSPHRASE,
  committeePublicKey,
  decryptReport,
  encryptReport,
  unlockCommittee,
} from "./crypto";
import {
  exportCase,
  fetchBlobs,
  fetchLedger,
  parseRosterCsv,
  patchCase,
  postBlob,
  postEnrol,
  postEnrolBatch,
  postEpoch,
  postFile,
  tryFile,
} from "./api";
import { classifyFail, successCopy, type FailKind } from "./fail";
import { FailWell } from "./FailWell";
import { ProofMeter } from "./ProofMeter";
import { Landing } from "./Landing";
import { COPY } from "./copy";
import { BrandIcon } from "./BrandIcon";

type Screen =
  | "home"
  | "signin"
  | "workspace"
  | "registrar"
  | "bell"
  | "named"
  | "inbox"
  | "explorer"
  | "demo";

type CastStep = { id: string; label: string; state: "pending" | "running" | "ok" | "fail"; detail?: string };

const SCREENS: Screen[] = [
  "home",
  "signin",
  "workspace",
  "registrar",
  "bell",
  "named",
  "inbox",
  "explorer",
  "demo",
];

const PROTECTED: Screen[] = ["workspace", "registrar", "bell", "named", "inbox"];

function screenFromLocation(): Screen {
  const hash = (location.hash || "").replace(/^#\/?/, "");
  if (SCREENS.includes(hash as Screen)) return hash as Screen;
  return "home";
}

const API = import.meta.env.VITE_BLOB_API ?? "http://127.0.0.1:8788";
const CHAIN = import.meta.env.VITE_CHAIN_API ?? "http://127.0.0.1:8789";

const SAMPLE_CSV = `alias,year,program,seed
asha,1,BTech,silentbell:asha:v1
meera,2,BTech,silentbell:meera:v1
dev,1,BTech,silentbell:dev:v1
priya,3,BTech,silentbell:priya:v1
arjun,2,BTech,silentbell:arjun:v1
neha,1,BTech,silentbell:neha:v1
kabir,4,BTech,silentbell:kabir:v1
sara,2,BTech,silentbell:sara:v1
`;

function defaultScreenFor(account: Account): Screen {
  if (account.role === "registrar") return "registrar";
  if (account.role === "committee") return "inbox";
  return "bell";
}

export function App() {
  const [screen, setScreen] = useState<Screen>(() => screenFromLocation());
  const [account, setAccount] = useState<Account | null>(() => sessionAccount(loadSession()));
  const [email, setEmail] = useState("asha@campus.edu");
  const [password, setPassword] = useState("SilentBell!Student");
  const [authError, setAuthError] = useState("");
  const [enrolled, setEnrolled] = useState<string[]>([]);
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [nextEpoch, setNextEpoch] = useState(2);
  const [category, setCategory] = useState(0);
  const [handle, setHandle] = useState("Asha Sharma, 1st year hostel B");
  const [castSteps, setCastSteps] = useState<CastStep[]>([]);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");
  const [fail, setFail] = useState<FailKind | null>(null);
  const [busy, setBusy] = useState(false);
  const [publicFacts, setPublicFacts] = useState<string[]>(["epoch 1", "roster unpublished"]);
  const [ledger, setLedger] = useState<any>(null);
  const [inbox, setInbox] = useState<any[]>([]);
  const [committeeUnlocked, setCommitteeUnlocked] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [myRings, setMyRings] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("silentbell:my-rings") || "[]");
    } catch {
      return [];
    }
  });

  const chainPersona = account?.chainPersona ?? "asha";

  useEffect(() => {
    void refreshLedger();
  }, [screen]);

  useEffect(() => {
    const onHash = () => {
      const next = screenFromLocation();
      if (PROTECTED.includes(next) && !sessionAccount(loadSession())) {
        setScreen("signin");
        location.hash = "signin";
        return;
      }
      setScreen(next);
      setAccount(sessionAccount(loadSession()));
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function go(next: Screen) {
    if (PROTECTED.includes(next) && !account) {
      setScreen("signin");
      location.hash = "signin";
      return;
    }
    setScreen(next);
    const hash = next === "home" ? "" : next;
    if (location.hash.replace(/^#\/?/, "") !== hash) location.hash = hash;
  }

  function signIn(e?: FormEvent) {
    e?.preventDefault();
    const found = findAccount(email, password);
    if (!found) {
      setAuthError("Wrong email or password. Use a demo account from the list.");
      return;
    }
    saveSession(found.id);
    setAccount(found);
    setAuthError("");
    setStatus(`Signed in as ${found.displayName}`);
    const dest = defaultScreenFor(found);
    setScreen(dest);
    location.hash = dest;
  }

  function signOut() {
    clearSession();
    setAccount(null);
    setCommitteeUnlocked(false);
    setPassphrase("");
    setStatus("");
    go("home");
  }

  function quickLogin(acc: Account) {
    setEmail(acc.email);
    setPassword(acc.password);
    saveSession(acc.id);
    setAccount(acc);
    setAuthError("");
    const dest = defaultScreenFor(acc);
    setScreen(dest);
    location.hash = dest;
  }

  const boundary = useMemo(
    () => (
      <div className="split">
        <section className="rail private">
          <h2>Never on the ledger</h2>
          <p>Your enrolment secret, which leaf you are, and the incident story stay on this device — sealed for the committee.</p>
          <div className="rail-chips">
            <span className="chip">witness</span>
            {account && <span className="chip">{account.displayName}</span>}
            {account && <span className="chip">{account.role}</span>}
            <span className="chip">committee pk {committeePublicKey().slice(0, 10)}…</span>
          </div>
        </section>
        <section className="rail public">
          <h2>What Midnight learns</h2>
          <p>Only facts a Compact circuit may disclose: membership, category, nullifier uniqueness, optional named handle.</p>
          <div className="rail-chips">
            {publicFacts.map((f) => (
              <span className="chip" key={f}>
                {f}
              </span>
            ))}
          </div>
        </section>
      </div>
    ),
    [publicFacts, account],
  );

  async function refreshLedger() {
    try {
      const L = await fetchLedger(CHAIN);
      setLedger(L);
      setPublicFacts([
        `network ${L.network}`,
        `silentCount ${L.silentCount}`,
        `namedCount ${L.namedCount}`,
        `epoch ${L.epoch}`,
        `roster ${L.rosterSize ?? "?"}`,
        String(L.address || "").slice(0, 18),
      ]);
      setNextEpoch(Number(L.epoch || 1) + 1);
    } catch {
      /* chain may be down */
    }
  }

  function rememberRing(commitment: string) {
    const next = [commitment, ...myRings.filter((c) => c !== commitment)].slice(0, 40);
    setMyRings(next);
    localStorage.setItem("silentbell:my-rings", JSON.stringify(next));
  }

  async function enrolDemo() {
    setBusy(true);
    setFail(null);
    setStatus("Publishing demo roster leaves…");
    try {
      const L = await fetchLedger(CHAIN);
      if (Number(L.rosterSize || 0) >= 16) {
        setEnrolled(["asha", "meera"]);
        setStatus("Roster already full (16/16). Asha & Meera should already be on the roll — file directly.");
        return;
      }
      for (const who of ["asha", "meera"] as const) {
        try {
          await postEnrol(CHAIN, who);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!/already|insert|member|structure bounds|exceeded/i.test(msg)) throw err;
        }
      }
      setEnrolled(["asha", "meera"]);
      await refreshLedger();
      setStatus("Roster is on chain. Names are not — only hashed leaves.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Enrol failed";
      setFail(classifyFail(msg, chainPersona));
      setStatus(msg);
    } finally {
      setBusy(false);
    }
  }

  async function enrolCsv() {
    setBusy(true);
    setFail(null);
    setStatus("Parsing CSV and proving enrol circuits…");
    try {
      const rows = parseRosterCsv(csvText);
      if (rows.length === 0) throw new Error("CSV empty");
      const result = await postEnrolBatch(CHAIN, rows);
      const ok = (result.results || []).filter((r: any) => r.ok).map((r: any) => r.alias);
      setEnrolled(ok);
      await refreshLedger();
      setStatus(`Published ${ok.length}/${rows.length} hashed leaves. Names stayed in the CSV file.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "CSV enrol failed";
      setFail(classifyFail(msg, chainPersona));
      setStatus(msg);
    } finally {
      setBusy(false);
    }
  }

  async function bumpEpoch() {
    setBusy(true);
    setFail(null);
    try {
      await postEpoch(CHAIN, nextEpoch);
      await refreshLedger();
      setStatus(`Epoch is now ${nextEpoch}. Old nullifiers stay. New filings need current leaves.`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "epoch failed");
    } finally {
      setBusy(false);
    }
  }

  async function file(named: boolean) {
    if (!account || account.role === "committee" || !account.chainPersona) {
      setFail("committee");
      setStatus("");
      return;
    }
    const persona = account.chainPersona;
    setBusy(true);
    setFail(null);
    setStatus("Generating proof. Your numbers never left this machine.");
    try {
      const packed = encryptReport(body);
      const chain = await postFile(CHAIN, persona, category, named, handle);
      try {
        await postBlob(API, {
          commitment: chain.commitment,
          category,
          rail: named ? "named" : "silent",
          handle: named ? handle : "",
          ...packed,
        });
      } catch {
        const fallback = JSON.stringify({ commitment: chain.commitment, ...packed }, null, 2);
        const blob = new Blob([fallback], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `silent-bell-${chain.commitment.slice(0, 12)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setStatus(
          "Blob API down — ciphertext downloaded for committee upload. " +
            successCopy(named, handle, chain.txId),
        );
        rememberRing(chain.commitment);
        await refreshLedger();
        return;
      }
      rememberRing(chain.commitment);
      await refreshLedger();
      setStatus(successCopy(named, handle, chain.txId));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      setFail(classifyFail(msg, persona));
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  async function loadInbox() {
    if (!committeeUnlocked) {
      setStatus("Unlock the committee key first.");
      return;
    }
    try {
      const rows = await fetchBlobs(API);
      setInbox(rows);
      setStatus("");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "inbox failed");
    }
  }

  async function setCaseStatus(commitment: string, next: string) {
    await patchCase(API, commitment, next);
    await loadInbox();
  }

  async function downloadExport(commitment: string) {
    const pack = await exportCase(API, commitment);
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `case-${commitment.slice(0, 12)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function runDemoCast() {
    const steps: CastStep[] = [
      { id: "epoch", label: "Bump epoch (fresh nullifiers)", state: "pending" },
      { id: "enrol", label: "Enrol Asha + Meera", state: "pending" },
      { id: "ravi", label: "Outsider files silent — must fail", state: "pending" },
      { id: "asha", label: "Student files silent + blob", state: "pending" },
      { id: "dup", label: "Duplicate — must fail", state: "pending" },
      { id: "named", label: "Named emergency + blob", state: "pending" },
      { id: "inbox", label: "Committee ack + export", state: "pending" },
    ];
    setCastSteps(steps);
    setBusy(true);
    setFail(null);
    setStatus("Running product demo cast…");

    const mark = (id: string, state: CastStep["state"], detail?: string) => {
      setCastSteps((prev) => prev.map((s) => (s.id === id ? { ...s, state, detail } : s)));
    };

    const cat = 2;
    const demoBody =
      "Product demo: hostel lights cut after 11pm as fake intro punishment. Synthetic. Not a real report.";

    try {
      mark("epoch", "running");
      const L0 = await fetchLedger(CHAIN);
      const epoch = Number(L0.epoch || 1) + 1;
      await postEpoch(CHAIN, epoch);
      mark("epoch", "ok", `epoch → ${epoch}`);

      mark("enrol", "running");
      const rosterSize = Number((await fetchLedger(CHAIN)).rosterSize || 0);
      if (rosterSize >= 16) {
        // Depth-4 HistoricMerkleTree holds 16 leaves. Prior CSV/demo fills are OK —
        // Asha/Meera were enrolled earlier; skip insert to avoid "exceeded structure bounds".
        mark("enrol", "ok", "roster full (16) — using existing leaves");
      } else {
        for (const who of ["asha", "meera"] as const) {
          try {
            await postEnrol(CHAIN, who);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (!/already|insert|member|structure bounds|exceeded/i.test(msg)) throw err;
          }
        }
        mark("enrol", "ok", "hashed leaves on roster");
      }

      mark("ravi", "running");
      const ravi = await tryFile(CHAIN, "ravi", cat);
      if (ravi.ok) throw new Error("Outsider should have been rejected");
      mark("ravi", "ok", "outsider rejected (expected)");

      mark("asha", "running");
      const silent = await tryFile(CHAIN, "asha", cat);
      if (!silent.ok) throw new Error(silent.error);
      const packed = encryptReport(demoBody);
      await postBlob(API, {
        commitment: silent.commitment,
        category: cat,
        rail: "silent",
        handle: "",
        ...packed,
      });
      rememberRing(silent.commitment);
      mark("asha", "ok", `tx ${silent.txId.slice(0, 14)}…`);

      mark("dup", "running");
      const dup = await tryFile(CHAIN, "asha", cat);
      if (dup.ok) throw new Error("Duplicate should have been rejected");
      mark("dup", "ok", "nullifier blocked hoax");

      mark("named", "running");
      const namedHandle = "Asha · product demo";
      const named = await tryFile(CHAIN, "asha", 3, true, namedHandle);
      if (!named.ok) throw new Error(named.error);
      const namedPacked = encryptReport(demoBody + " Named rail.");
      await postBlob(API, {
        commitment: named.commitment,
        category: 3,
        rail: "named",
        handle: namedHandle,
        ...namedPacked,
      });
      rememberRing(named.commitment);
      mark("named", "ok", `tx ${named.txId.slice(0, 14)}…`);

      mark("inbox", "running");
      if (!unlockCommittee(COMMITTEE_PASSPHRASE)) {
        throw new Error("committee unlock failed — check COMPAT.md");
      }
      setCommitteeUnlocked(true);
      setPassphrase(COMMITTEE_PASSPHRASE);
      await patchCase(API, silent.commitment, "acknowledged", "product demo ack");
      const pack = await exportCase(API, silent.commitment);
      const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `demo-case-${silent.commitment.slice(0, 12)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      mark("inbox", "ok", "acked + exported");

      await refreshLedger();
      setStatus("Demo cast complete. Sign in as committee to decrypt in Inbox.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setCastSteps((prev) => {
        const running = prev.find((s) => s.state === "running");
        if (!running) return prev;
        return prev.map((s) => (s.id === running.id ? { ...s, state: "fail", detail: msg } : s));
      });
      setStatus(msg);
      setFail(classifyFail(msg, "asha"));
    } finally {
      setBusy(false);
    }
  }

  function navClass(id: Screen) {
    if (id === "bell" && (screen === "bell" || screen === "named")) return "is-active";
    return screen === id ? "is-active" : undefined;
  }

  const siteHeader = (
    <header className="site-header">
      <div className="site-header-inner">
        <button type="button" className="brand-mark" onClick={() => go("home")}>
          <BrandIcon className="brand-icon" />
          <span>Silent Bell</span>
        </button>
        <nav className="site-nav" aria-label="Primary">
          {account?.role === "registrar" && (
            <button type="button" className={navClass("registrar")} onClick={() => go("registrar")}>
              The Roll
            </button>
          )}
          {account?.role === "student" && (
            <>
              <button type="button" className={navClass("bell")} onClick={() => go("bell")}>
                Ring
              </button>
              <button type="button" className={navClass("named")} onClick={() => go("named")}>
                Named
              </button>
            </>
          )}
          {account?.role === "committee" && (
            <button type="button" className={navClass("inbox")} onClick={() => go("inbox")}>
              Inbox
            </button>
          )}
          <button type="button" className={navClass("explorer")} onClick={() => go("explorer")}>
            Explorer
          </button>
        </nav>
        <div className="header-actions">
          {!account ? (
            <>
              <button type="button" className="ghost site-header-demo" onClick={() => go("demo")}>
                Live cast
              </button>
              <button type="button" className="primary site-header-cta" onClick={() => go("signin")}>
                Enter
              </button>
            </>
          ) : (
            <>
              <div className="user-chip">
                <strong>{account.displayName}</strong>
                <span>{account.role}</span>
              </div>
              <button type="button" className="ghost site-header-demo" onClick={signOut}>
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );

  /* ── Marketing home ─────────────────────────────────── */
  if (screen === "home") {
    return (
      <div className="app-root">
        {siteHeader}
        <Landing
          go={(s) => go(s)}
          boundary={boundary}
        />
      </div>
    );
  }

  /* ── Sign in ────────────────────────────────────────── */
  if (screen === "signin") {
    return (
      <div className="app-root">
        {siteHeader}
        <main className="shell shell-app">
          <div className="page-head">
            <p className="page-kicker">Access</p>
            <h1>{COPY.signin.title}</h1>
            <p className="tagline">{COPY.signin.lead}</p>
          </div>
          <div className="auth-grid">
            <form className="panel auth-panel" onSubmit={signIn}>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {authError && <p className="fail">{authError}</p>}
              <div className="row">
                <button className="primary" type="submit">
                  {COPY.signin.submit}
                </button>
                <button className="ghost" type="button" onClick={() => go("home")}>
                  Back
                </button>
              </div>
            </form>
            <aside className="panel cred-panel">
              <h2>{COPY.signin.demoAside}</h2>
              <p className="tagline">{COPY.signin.demoHint}</p>
              <div className="cred-list">
                {ACCOUNTS.map((a) => (
                  <button key={a.id} type="button" className="cred-row" onClick={() => quickLogin(a)}>
                    <strong>{a.displayName}</strong>
                    <span className="chip">{a.role}</span>
                    <small>
                      {a.email} · {a.password}
                    </small>
                  </button>
                ))}
              </div>
              <p className="tagline" style={{ marginTop: 20 }}>
                Committee decrypt passphrase: <code>silentbell-committee-pilot-v1</code>
              </p>
            </aside>
          </div>
        </main>
      </div>
    );
  }

  /* ── Live demo (judges) ─────────────────────────────── */
  if (screen === "demo") {
    return (
      <div className="app-root">
        {siteHeader}
        <main className="shell shell-app">
          <div className="page-head">
            <p className="page-kicker">Judges</p>
            <h1>{COPY.demo.title}</h1>
            <p className="tagline">{COPY.demo.lead}</p>
          </div>
          <div className="panel">
            <button className="primary" disabled={busy} onClick={runDemoCast}>
              Run full demo cast
            </button>
            {castSteps.length === 0 && !busy && (
              <p className="empty">Needs chain + blob + proof-server. About a minute of proofs.</p>
            )}
            <div className="cast-log">
              {castSteps.map((s) => (
                <div key={s.id} className={`cast-step ${s.state}`}>
                  <strong>{s.label}</strong>
                  <div className="tagline">
                    {s.state === "running" ? "proving…" : s.state === "pending" ? "waiting" : s.detail || s.state}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel" style={{ marginTop: 28 }}>
            <h2>Then try the product</h2>
            <p className="tagline">Sign in as each role after the cast.</p>
            <div className="cred-list">
              {DEMO_CREDENTIAL_ROWS.map((r) => (
                <div key={r.email} className="cred-row static">
                  <strong>{r.who}</strong>
                  <span className="chip">{r.role}</span>
                  <small>
                    {r.email} / {r.password}
                  </small>
                </div>
              ))}
            </div>
            <div className="row">
              <button className="primary" onClick={() => go("signin")}>
                Sign in
              </button>
              <button className="ghost" onClick={() => go("explorer")}>
                Explorer
              </button>
            </div>
          </div>
          <ProofMeter running={busy} />
          <FailWell kind={fail} />
          {status && !fail && <p className="ok">{status}</p>}
        </main>
      </div>
    );
  }

  /* ── Authenticated / public app screens ─────────────── */
  return (
    <div className="app-root">
      {siteHeader}
      <main className="shell shell-app">
        {screen === "workspace" && account && (
          <>
            <div className="page-head">
              <h1>Welcome, {account.displayName}</h1>
              <p className="tagline">{account.title}</p>
            </div>
            <div className="doors" style={{ marginTop: 8 }}>
              {account.role === "registrar" && (
                <button className="door" onClick={() => go("registrar")}>
                  <strong>The Roll</strong>
                  <small>Publish CSV roster and manage epoch.</small>
                </button>
              )}
              {account.role === "student" && (
                <>
                  <button className="door" onClick={() => go("bell")}>
                    <strong>Ring silently</strong>
                    <small>Membership without identity.</small>
                  </button>
                  <button className="door named" onClick={() => go("named")}>
                    <strong>Named emergency</strong>
                    <small>Disclose a handle on purpose.</small>
                  </button>
                </>
              )}
              {account.role === "committee" && (
                <button className="door" onClick={() => go("inbox")}>
                  <strong>Committee inbox</strong>
                  <small>Unlock, decrypt, act on cases.</small>
                </button>
              )}
              <button className="door" onClick={() => go("explorer")}>
                <strong>Explorer</strong>
                <small>Public counts only.</small>
              </button>
            </div>
          </>
        )}

        {screen === "registrar" && (
          <>
            {!account || account.role !== "registrar" ? (
              <p className="empty">Registrar account required. <button className="ghost" onClick={() => go("signin")}>Sign in</button></p>
            ) : (
              <>
                <div className="page-head">
                  <p className="page-kicker">Registrar</p>
                  <h1>{COPY.registrar.title}</h1>
                  <p className="tagline">{COPY.registrar.lead}</p>
                </div>
                <div className="panel">
                  <div className="field">
                    <label>Roster CSV</label>
                    <textarea rows={8} value={csvText} onChange={(e) => setCsvText(e.target.value)} />
                  </div>
                  <div className="row">
                    <button className="primary" disabled={busy} onClick={enrolCsv}>
                      Publish CSV roster
                    </button>
                    <button className="ghost" disabled={busy} onClick={enrolDemo}>
                      Quick publish (Asha, Meera)
                    </button>
                  </div>
                  <div className="field">
                    <label>Bump epoch to</label>
                    <input
                      type="number"
                      min={1}
                      value={nextEpoch}
                      onChange={(e) => setNextEpoch(Number(e.target.value))}
                    />
                  </div>
                  <button className="danger" disabled={busy} onClick={bumpEpoch}>
                    Freeze / set epoch
                  </button>
                  {enrolled.length > 0 && <p className="ok">Leaves accepted: {enrolled.join(", ")}</p>}
                </div>
              </>
            )}
          </>
        )}

        {screen === "bell" && (
          <>
            {!account || account.role !== "student" ? (
              <p className="empty">Student account required. <button className="ghost" onClick={() => go("signin")}>Sign in</button></p>
            ) : (
              <>
                <div className="page-head">
                  <p className="page-kicker">Student</p>
                  <h1>{COPY.bell.title}</h1>
                  <p className="tagline">
                    {account.displayName}. {account.enrolled ? COPY.bell.leadOn : COPY.bell.leadOff}
                  </p>
                </div>
                <div className="panel">
                  <div className="field">
                    <label>Category</label>
                    <select value={category} onChange={(e) => setCategory(Number(e.target.value))}>
                      {CATEGORIES.map((c, i) => (
                        <option key={c} value={i}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>What happened (sealed to committee — never ledger)</label>
                    <textarea
                      rows={5}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Describe what happened…"
                    />
                  </div>
                  <div className="row">
                    <button className="primary" disabled={busy} onClick={() => file(false)}>
                      File silent report
                    </button>
                    <button className="danger" disabled={busy} onClick={() => go("named")}>
                      Named emergency instead
                    </button>
                  </div>
                  {myRings.length > 0 ? (
                    <div className="cases">
                      <p className="tagline">My rings (this device)</p>
                      {myRings.map((c) => (
                        <span className="chip" key={c}>
                          {c.slice(0, 20)}…
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="empty">No rings on this device yet.</p>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {screen === "named" && (
          <>
            {!account || account.role !== "student" ? (
              <p className="empty">Student account required.</p>
            ) : (
              <>
                <div className="page-head">
                  <p className="page-kicker">Emergency rail</p>
                  <h1>{COPY.named.title}</h1>
                  <p className="tagline">{COPY.named.lead}</p>
                </div>
                <div className="panel">
                  <div className="field">
                    <label>Category</label>
                    <select value={category} onChange={(e) => setCategory(Number(e.target.value))}>
                      {CATEGORIES.map((c, i) => (
                        <option key={c} value={i}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Handle the committee will see</label>
                    <input value={handle} onChange={(e) => setHandle(e.target.value)} maxLength={32} />
                  </div>
                  <div className="field">
                    <label>What happened</label>
                    <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
                  </div>
                  <button className="danger" disabled={busy} onClick={() => file(true)}>
                    File named report
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {screen === "inbox" && (
          <>
            {!account || account.role !== "committee" ? (
              <p className="empty">Committee account required. <button className="ghost" onClick={() => go("signin")}>Sign in</button></p>
            ) : (
              <>
                <div className="page-head">
                  <p className="page-kicker">Committee</p>
                  <h1>{COPY.inbox.title}</h1>
                  <p className="tagline">
                    {account.displayName}. {COPY.inbox.lead}
                  </p>
                </div>
                <div className="panel">
                  {!committeeUnlocked ? (
                    <div className="field">
                      <label>Committee passphrase</label>
                      <input
                        type="password"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="pilot passphrase"
                      />
                      <div className="row">
                        <button
                          className="primary"
                          onClick={() => {
                            if (unlockCommittee(passphrase)) {
                              setCommitteeUnlocked(true);
                              setStatus("Committee key unlocked.");
                            } else {
                              setStatus("Wrong passphrase. See COMPAT.md.");
                            }
                          }}
                        >
                          Unlock inbox
                        </button>
                      </div>
                      <p className="empty">Pilot passphrase: silentbell-committee-pilot-v1</p>
                    </div>
                  ) : (
                    <button className="primary" onClick={loadInbox}>
                      Load commitments
                    </button>
                  )}
                  {inbox.length === 0 && committeeUnlocked && (
                    <p className="empty">No silent bells this epoch.</p>
                  )}
                  <div className="cases">
                    {inbox.map((row) => (
                      <article className="case" key={row.commitment}>
                        <div className="row">
                          <span className="chip">{CATEGORIES[row.category] ?? "category"}</span>
                          <span className="chip">{row.rail === "named" ? "named rail" : "silent rail"}</span>
                          <span className="chip">{row.status || "new"}</span>
                        </div>
                        {row.rail === "named" && row.handle ? (
                          <p className="ok">Disclosed handle: {row.handle}</p>
                        ) : (
                          <p className="tagline">Identity column empty.</p>
                        )}
                        <p>
                          {committeeUnlocked
                            ? decryptReport({
                                ciphertext: row.ciphertext,
                                nonce: row.nonce,
                                ephemeralPk: row.ephemeralPk,
                              })
                            : "(locked)"}
                        </p>
                        <div className="row">
                          <button className="ghost" onClick={() => setCaseStatus(row.commitment, "acknowledged")}>
                            Ack
                          </button>
                          <button className="ghost" onClick={() => setCaseStatus(row.commitment, "escalated")}>
                            Escalate
                          </button>
                          <button className="ghost" onClick={() => setCaseStatus(row.commitment, "closed")}>
                            Close
                          </button>
                          <button className="danger" onClick={() => setCaseStatus(row.commitment, "malicious")}>
                            Malicious
                          </button>
                          <button className="primary" onClick={() => downloadExport(row.commitment)}>
                            Export
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {screen === "explorer" && (
          <>
            <div className="page-head">
              <p className="page-kicker">Public</p>
              <h1>{COPY.explorer.title}</h1>
              <p className="tagline">{COPY.explorer.lead}</p>
            </div>
            <div className="panel">
              <div className="stat-grid">
                <div className="stat">
                  <span>Network</span>
                  <strong>{ledger?.network ?? "—"}</strong>
                </div>
                <div className="stat">
                  <span>Epoch</span>
                  <strong>{ledger?.epoch ?? "—"}</strong>
                </div>
                <div className="stat">
                  <span>Silent filings</span>
                  <strong>{ledger?.silentCount ?? "—"}</strong>
                </div>
                <div className="stat">
                  <span>Named filings</span>
                  <strong>{ledger?.namedCount ?? "—"}</strong>
                </div>
                <div className="stat">
                  <span>Roster leaves</span>
                  <strong>{ledger?.rosterSize ?? "—"}</strong>
                </div>
                <div className="stat">
                  <span>Contract</span>
                  <strong style={{ fontSize: "0.95rem" }}>
                    {ledger?.address ? `${String(ledger.address).slice(0, 14)}…` : "—"}
                  </strong>
                </div>
              </div>
              <div className="row">
                <button className="ghost" onClick={refreshLedger}>
                  Refresh
                </button>
              </div>
            </div>
          </>
        )}

        <ProofMeter running={busy} />
        <FailWell kind={fail} />
        {status && !fail && <p className="ok">{status}</p>}
      </main>
    </div>
  );
}
