# Silent Bell

**The report that cannot be traced. The student who cannot be faked.**

Brainwave 2026 — Midnight Track. A **campus pilot product**: Compact proves the reporter is on this semester’s roll. The ledger never learns which student. A nullifier stops hoax floods. Incident plaintext is sealed off-chain for the committee only.

| Private (device / sealed store) | Public (ledger) |
|------------------|-----------------|
| Student secret, Merkle path, report plaintext | Membership, category, nullifier, commitment |
| Committee X25519 secret (passphrase-unlocked) | Named handle **only** on the Named rail |

## Docs for judges

| Doc | Purpose |
|-----|---------|
| [OVERVIEW.md](OVERVIEW.md) | Human story — problem → Midnight → product |
| [docs/DEVPOST.md](docs/DEVPOST.md) | Paste-ready Devpost description |
| [docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md) | What to show / what to say |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Components + circuits |
| [COMPAT.md](COMPAT.md) | Versions + demo accounts + pilot secrets |
| [docs/media/](docs/media/) | Architecture SVGs + Devpost thumbnail |

![Architecture](docs/media/architecture.svg)

![Trust boundary](docs/media/trust-boundary.svg)

## Sponsor stack

- **Compact** — `contracts/silent-bell.compact` (`enrol`, `setEpoch`, `fileSilent`, `fileNamed`)
- **Midnight.js 4.1.1** — deploy + callTx
- **proof-server 8.1.0** — proving
- **node + indexer** — local Docker / PreProd public endpoints
- **PreProd faucet** — eligibility funding

## Quick start (local)

```bash
cd silent-bell
npm install && npm --prefix web install
npm run compile
docker compose up -d --wait
SKIP_COMPILE=1 npm run setup
npm run blob          # :8788
npm run chain         # :8789
npm run web           # :5173
```

Open **http://localhost:5173/** → **Live cast** or **Sign in** (accounts in `COMPAT.md`).

## Product flows

1. **Sign in** — role accounts (`COMPAT.md`).
2. **Registrar** — CSV roster → hashed leaves → epoch freeze.
3. **Student** — silent file / named emergency / My rings.
4. **Outsider** — silent file → FailWell (not on the roll).
5. **Duplicate** — same category → nullifier FailWell.
6. **Committee** — unlock → decrypt → Ack / Escalate / Close / Export.
7. **Explorer** — public counts only.
8. **Live demo** — one-click cast for judges.

## PreProd

Wallet sync against public RPC can hang. Prefer:

```bash
npm run print-address
# Fund mn_addr_preprod… at https://faucet.preprod.midnight.network
npx tsx src/deploy.ts --network preprod
npm run network undeployed
```

**PreProd unshielded:**  
`mn_addr_preprod136fxce5gstdxjm49vsse875qwt0u99rr8gytff7raqcf86q0936s7mncqy`

**PreProd contract:** _pending — paste address after deploy finishes._

## Threat model (pilot)

| Threat | Mitigation |
|--------|------------|
| Story on chain | Off-chain ciphertext; chain stores commitment |
| Who filed | Merkle membership without leaf reveal |
| Outsider | Circuit fails without valid path |
| Hoax flood | Nullifier per epoch+category |
| Open inbox | Committee passphrase + Bearer on GET |
| Metadata | Blob API binds localhost; no IP persistence |

Not a UGC-certified production system. Synthetic hostel-lights narrative only.

## Layout

- `contracts/silent-bell.compact`
- `src/` — deploy, chain API, witnesses
- `web/` — product UI
- `services/blob-api.mjs` — sealed blobs + case status
- `fixtures/roster.csv` — sample issuer CSV
- `docs/` — Devpost, demo script, architecture, media

Pramaan is a **separate** repo: `../pramaan`.
