# Silent Bell — Simple Overview

**One line:** A campus can take serious reports without knowing _who_ filed — but still knowing the reporter is a real student on this semester’s roll.

**Hackathon:** Brainwave 2026 · Midnight Track  
**Tagline:** _The report that cannot be traced. The student who cannot be faked._

---

## 1. What’s the problem?

Campuses need students to report harassment, discrimination, hostel abuse, etc.

Today students usually get two bad options:

| Option                    | What goes wrong                                                          |
| ------------------------- | ------------------------------------------------------------------------ |
| **Named complaint**       | Fear of retaliation. Juniors stay silent.                                |
| **Anonymous Google Form** | Anyone can spam. Committee can’t trust it. Fake reports drown real ones. |

So the real problem is:

> How do we prove **“this person is on the roll”** without revealing **which person**, and without letting outsiders flood the inbox?

---

## 2. Why are we solving this? (for the hackathon)

Brainwave’s Midnight Track wants **real products** that use privacy tech for civic / campus problems — not DeFi demos.

Silent Bell is a **campus pilot product**:

- Solves a pain judges understand (helplines, equity cells, hostels)
- Uses Midnight’s strength (prove something private without publishing it)
- Shows a full workflow: registrar → student → committee → public counts

We’re not building “ZK for fun.” We’re building **intake that a committee could try on synthetic data**.

---

## 3. What is Midnight?

**Midnight** is a blockchain network built for **privacy**.

Most blockchains put almost everything on a public ledger. Midnight lets apps use **zero-knowledge proofs** (ZK):

- You can **prove** a fact is true
- Without **showing** the private data that made it true

**Compact** is Midnight’s language for writing those proof circuits (the rules of what must be proven).

**Simple analogy:**  
You show a bouncer a sealed wristband that only people on the guest list can get. The club learns “you’re allowed in.” It does **not** learn your name from the wristband.

---

## 4. How are we using Midnight to solve this?

Silent Bell puts **only public, safe facts** on Midnight. Private stuff stays on the student’s device (and sealed for the committee).

### On the ledger (public)

- That someone **on the current roll** filed
- **Category** (e.g. Hostel, Harassment)
- A **nullifier** (stops the same student from flooding the same category this semester)
- A **commitment** (fingerprint of the sealed report — not the story)
- Optional: a **named handle** only if the student chooses the emergency rail

### Never on the ledger

- Student name / roll number / leaf identity
- The incident story (plaintext)
- Who filed the silent report

### How the proof works (simple)

1. The college publishes a **hashed roster** (Merkle tree leaves) for this semester (**epoch**).
2. A student proves: “I have a secret that matches **one leaf** in that tree” — without saying which leaf.
3. Midnight accepts the transaction only if the proof is valid.
4. Outsiders (not on the roll) **fail**. That’s intentional.

We use:

- **Compact** circuit — `enrol`, `setEpoch`, `fileSilent`, `fileNamed`
- **Midnight.js** — deploy and call the contract
- **proof-server** — builds the ZK proofs
- Local Docker **node + indexer** (and later PreProd for public demo)

---

## 5. How are we solving it? (product design)

Silent Bell has **two rails** and a clear trust split.

### Silent rail (default)

- Prove membership → file report
- Committee gets the **story**, not the **identity**
- Story is encrypted to the committee key and stored off-chain (blob API)
- Ledger only stores a commitment + category + nullifier

### Named rail (emergency)

- Student **chooses** to disclose a handle (e.g. “Asha, hostel B”)
- Still proves they are on the roll
- Use when danger > anonymity

### Anti-hoax

- One silent filing per **student + category + epoch**
- Second try → “Already rang this category” (FailWell)
- Stops spam without naming anyone

### What stays private vs public (Boundary)

| On this device                       | On the ledger                                      |
| ------------------------------------ | -------------------------------------------------- |
| Student secret, report text          | Membership proved, category, nullifier, commitment |
| Committee decrypt key (after unlock) | Named handle **only** if student opted in          |

---

## 6. What roles exist, and what can they do?

### Registrar — “The Roll”

**Who:** Admin / academic office issuing this semester’s list.

**Can do:**

- Paste/import a **CSV** of students (aliases + seed labels)
- Publish **hashed leaves** to Midnight (names stay in the CSV, not on chain)
- **Bump / freeze epoch** when the semester changes

**Cannot do:**

- Read silent report bodies from the ledger (there are none)

---

### Student — “Ring silently” / “Named emergency”

**Demo personas:**

| Persona       | Role                                         |
| ------------- | -------------------------------------------- |
| **Asha**      | Fresher on the roll — silent + named success |
| **Meera**     | Student on the roll                          |
| **Ravi**      | Outsider — **must fail**                     |
| **Dr. Mehta** | Committee — reads inbox, does not file       |

**Students can:**

- File a **silent** report (identity hidden)
- File a **named** report (handle disclosed on purpose)
- See **My rings** (commitments saved on this browser only)

**Students cannot:**

- File if not enrolled (Ravi FailWell)
- Spam the same category twice in one epoch

---

### Committee — “The Inbox” (Dr. Mehta)

**Can do:**

- Unlock with committee passphrase
- Load sealed reports
- **Decrypt** story on this device
- See empty identity for silent filings; see handle for named
- **Ack / Escalate / Close / Mark malicious**
- **Export** a case pack (JSON)

**Cannot do:**

- Learn which silent leaf filed (circuit didn’t reveal it)
- Read inbox without the passphrase + auth token

---

### Public — “Explorer”

**Anyone can:**

- See network, epoch, silent count, named count, roster size
- See contract address

**Nobody can:**

- See report bodies or silent identities on Explorer

---

## 7. How can I use it? (product + demo)

### Start services

```bash
cd silent-bell
docker compose up -d --wait   # proof-server + node + indexer
npm run blob                  # :8788
npm run chain                 # :8789
npm run web                   # :5173
```

Open: **http://localhost:5173/**

### Product path (feels like a real campus app)

1. **Sign in** with a role account (table below).
2. **Registrar** → publish CSV / set epoch.
3. **Student** → ring silently or named emergency.
4. **Committee** → unlock passphrase → decrypt → act / export.
5. **Explorer** is public (no login).

### Live demo path (judges)

1. Open **Live demo** → **Run full demo cast**.
2. Then **Sign in** as each role to walk the product UI.

### Demo accounts

| Role      | Email                | Password             |
| --------- | -------------------- | -------------------- |
| Registrar | registrar@campus.edu | SilentBell!Registrar |
| Student   | asha@campus.edu      | SilentBell!Student   |
| Student   | meera@campus.edu     | SilentBell!Student   |
| Outsider  | ravi@outsider.test   | SilentBell!Outsider  |
| Committee | committee@campus.edu | SilentBell!Committee |

**Committee decrypt passphrase:** `silentbell-committee-pilot-v1`  
Full list: `COMPAT.md`.

---

## 8. FAQ (simple answers)

**Is the story on the blockchain?**  
No. Only a commitment. The story is encrypted off-chain.

**Does the committee know who filed silently?**  
No. They know someone enrolled filed, and they can read the sealed text after unlock.

**Can a random person spam reports?**  
Not if they’re not on the roll. Proof fails.

**Can one student flood the inbox?**  
Not for the same category in the same semester — nullifier blocks it.

**Is this production / UGC-certified?**  
No. It’s a **hackathon pilot** with a **synthetic** hostel narrative. Real campus use would need legal, ops, and key management work (see Roadmap).

**What’s PreProd?**  
Midnight’s public test network. We fund a wallet from the faucet and deploy the contract there so judges can see real txs (local Docker works for development).

**What’s Pramaan?**  
A **separate** product/repo. Silent Bell is the primary Brainwave bet. Don’t mix them.

---

## 9. Midnight sentence (for Devpost / judges)

> A Compact circuit proves the reporter is on this semester’s roll. The ledger never learns which leaf. A nullifier makes a hoax flood fail.

---

## 10. One picture in words

```
Registrar  →  hashed roll on Midnight
Student    →  ZK proof “I’m on the roll” + sealed story to committee
Committee  →  unlock → decrypt → act on cases
Public     →  explorer counts only
```

**Result:** authenticity without identity — and a committee that can still do its job.
