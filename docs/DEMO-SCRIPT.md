# Silent Bell - live presentation script (~3–4 min)

**Goal:** Judges feel a _product_, not a circuit tour. Problem → trap → Midnight fit → live proof → institutional next step.

---

## Setup (before you speak)

```bash
docker compose up -d --wait
npm run blob
npm run chain
npm run web
```

Open `http://localhost:5173/`. Hard refresh. Optional: run **Live cast** once before judges arrive so proofs are warm.

**Have ready:** `COMPAT.md` demo accounts; committee passphrase `silentbell-committee-pilot-v1`.  
**Eligibility line (say once near the end):** Preview contract `5c5312147f35c25ff0ba3aa9771e46e6b19ea1522b232a08b3dacabc95fc4048` on [explorer.preview.midnight.network](https://explorer.preview.midnight.network/).

---

## Script

### 0. Open (15s) - brand on screen

_[Landing hero visible]_

> “This is **Silent Bell**. Tagline: _the report that cannot be traced; the student who cannot be faked._  
> Campuses need serious reports. Students won’t file if they fear retaliation. Forms that accept anyone drown real harm in spam.”

### 1. The trap (20s)

_[Scroll to “The trap”]_

> “Named complaint → juniors stay silent. Anonymous form → outsiders spam.  
> The real question: prove someone is **on this semester’s roll** without revealing **which** student-and without letting outsiders flood the inbox.”

### 2. Why Midnight (20s)

_[Scroll to solution / trust boundary]_

> “That’s Midnight’s job: **selective disclosure**. Compact proves membership. The ledger never learns the leaf. The story is sealed off-chain for the committee only. Nullifiers stop the same student from flooding one category in one semester.”

### 3. Live cast (90–120s) - do not narrate every button

_[Open Live cast → Run full demo cast]_

While it runs:

> “This is a **one-click product cast** on real local proofs-not a slide.  
> Watch for four beats: outsider **fails**, enrolled student **files**, duplicate **fails**, named rail **discloses a handle on purpose**, then committee **acks and exports**.”

If enrol shows “roster full - using existing leaves”:

> “The pilot tree holds sixteen leaves. We’ve already enrolled Asha-capacity is a real ops constraint we handle in product.”

When cast completes:

> “Judges can sign in as each role after this. Demo passwords are in COMPAT-pilot only.”

### 4. Role walk (45s) - pick two

**A - Outsider (optional if cast already showed fail)**  
Sign in `ravi@outsider.test` → Ring → file → FailWell.

> “Not on the roll. Circuit rejects. That’s the product working.”

**B - Committee**  
Sign in `committee@campus.edu` → unlock passphrase → decrypt.

> “Committee reads the **case**, not the silent identity. Export for their process-still no leaf on chain.”

**C - Explorer**

> “Public accountability without voyeurism: counts and epoch only.”

### 5. Close (25s)

> “Silent Bell is a **campus pilot product** for Brainwave’s Midnight Track-not a DeFi demo.  
> Compact is live on **Midnight Preview** - contract `5c531214…95fc4048`. Judges can look it up on the Preview explorer.  
> The cast you just watched runs on the local proof stack so latency stays demo-friendly.  
> Next: campus SSO, SIS roster ingest, committee keys in a real ceremony, one college MoU.  
> Same pattern scales to employment whistleblowing and benefits eligibility.  
> Today: prove enrolment, never the name.”

---

## Don’t say

- “It’s just a demo.”
- Long ZK theory.
- “Production-ready for UGC / POSH cases” (it’s a synthetic pilot).
- Wallet sync drama unless asked-then be honest: we hit PreProd/Preview sync pain; **Preview deploy succeeded**; local cast is still the smooth judge path.

## Do say if asked “Would campuses use this?”

> “Not as a Lace wallet app. As a button inside the counselling portal: SSO in front, Compact in back, campus holds keys. That’s the path from pilot to product.”
