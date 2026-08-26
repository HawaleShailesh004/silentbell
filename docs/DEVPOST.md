# Silent Bell - Devpost submission (paste-ready)

Paste **Inspiration → What's next** into Devpost. Preview before submit.  
Images use GitHub raw URLs from [HawaleShailesh004/silentbell](https://github.com/HawaleShailesh004/silentbell).

The personal story is a **synthetic composite** — not a real person’s case. Preview contract is live (eligibility met). Local stack is the live-cast demo path. Full scoring brief: [docs/JUDGE-BRIEF.md](JUDGE-BRIEF.md).

---

## Fields (not markdown)

**Project name:** Silent Bell

**Tagline:**  
Zero-knowledge campus incident reporting on Midnight. Proven enrolment without identity exposure.

**Description (≤200 characters):**  
Silent Bell lets students prove campus enrolment and file grievance reports via Midnight Compact - without revealing identity and without hoax-spam drowning real cases. Sealed for committee only.

*(≈194 characters)*

**Built with:**

```
midnight compact midnight.js typescript react vite express docker nodejs zero-knowledge merkle-tree x25519 aes-gcm privacy campus zk-proofs proof-server compact-runtime
```

**Repo:** [https://github.com/HawaleShailesh004/silentbell](https://github.com/HawaleShailesh004/silentbell)

**Cover image:** [devpost-thumbnail.png](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-thumbnail.png)

**Public contract (eligibility):** Midnight Preview  
`5c5312147f35c25ff0ba3aa9771e46e6b19ea1522b232a08b3dacabc95fc4048`  
Explorer: https://explorer.preview.midnight.network/

**Demo video:** [https://youtu.be/KOa5WjgBbwM](https://youtu.be/KOa5WjgBbwM)

---

## Inspiration

I still remember the night the corridor lights went out.

I was a first-year. Hostels smell like detergent and wet shoes after eleven. Someone laughed too loud. Someone else whispered that it was just “intro,” just a joke, just something juniors endure if they want to belong. My hands were cold on my phone. I opened the college grievance page twice and closed it twice.

There were only two doors, and both felt like traps.

If I put my name on the complaint, I could see the next three years already-seniors who knew, a warden who “handled it quietly,” the soft punishment of being left out of groups that decide who eats where. My stomach hurt. I was angry, and I was ashamed of being afraid, and I hated that the shame felt louder than the anger.

If I used the anonymous form, I could type everything. But I also knew what the seniors said about those forms: anyone can fill them. Outsiders. Rivalries. Hoaxes. The committee gets a pile of noise and learns to trust nothing. I pictured my words landing in that pile and disappearing. That felt worse than silence-like shouting into a well and hearing only my own echo.

So I did what too many of us do. I locked my phone. I stared at the dark ceiling. I told myself it wasn’t “serious enough.” I slept badly. In the morning I smiled in class like nothing had happened.

I am not submitting that night as a real case. It is a **composite story**-synthetic on purpose-because real harm should not be content. But the feeling is the product requirement I refused to forget: *I needed someone to believe I belonged on this campus without forcing me to hand them my name.*

When I found Brainwave’s Midnight Track, I finally had language for that need. [Midnight](https://docs.midnight.network/) is built for selective disclosure-prove a fact without publishing the private data behind it. So I asked one question, and I built Silent Bell around the answer:

> How do I prove I am on this semester’s roll-without revealing which student I am-and without letting outsiders flood the inbox until no one listens?

## What it does

I built Silent Bell as a **campus pilot product**, not a circuit toy.

![Trust boundary](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/trust-boundary.svg)

When I sign in as the **registrar**, I publish the semester roster as hashed leaves. Names stay in the CSV. Only membership reaches Compact.

When I sign in as a **student**, I can ring **silently**: Midnight learns that someone enrolled filed; it never learns it was me. My story is sealed to the committee key and stored off-chain. Or-if I am in danger and I choose it-I take the **named emergency** rail and disclose a handle on purpose.

When I sign in as an **outsider**, the filing fails. That is not a bug. That is the night I was afraid of, solved in reverse: fakes do not get a free microphone.

When I sign in as the **committee**, I unlock, decrypt on my device, acknowledge, escalate, close, or export. I read the case. On the silent rail, I still do not learn which leaf rang.

The **public explorer** shows counts and epoch-accountability without voyeurism.

Incident plaintext **never** hits the ledger. It is sealed with X25519 + AES-GCM to the committee key and stored off-chain.

## How we built it

I shaped the product around that fresher’s two bad doors, then wired Midnight underneath.

![Architecture](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/architecture.svg)

- **Compact on Midnight Preview (live):** contract `5c5312147f35c25ff0ba3aa9771e46e6b19ea1522b232a08b3dacabc95fc4048`, deployed 2026-08-26, verified via the Preview indexer. Explorer: [explorer.preview.midnight.network](https://explorer.preview.midnight.network/). Deployer: `mn_addr_preview1guclk6ltr8prs87mu7um563r46fzdtvnazg0vzc8xame8qqhe93s7v7dx6`.
- **Compact circuits**-`enrol`, `setEpoch`, `fileSilent`, `fileNamed`-with a Merkle roster and nullifiers so the same student cannot hoax-flood one category in one semester.
- **Midnight.js**, local **proof-server**, node, and indexer so the proofs are real, not mocked. The judge live cast runs on the local stack; the Preview address is the public eligibility deploy.
- A **blob API** for sealed capsules and case export, because the story must never be a ledger field.
- A **role-based UI** with FailWell states-outsider rejected, duplicate blocked-so the emotion of “they won’t believe me” has an opposite on screen: *the system believed membership, not gossip.*

```bash
git clone https://github.com/HawaleShailesh004/silentbell.git
cd silentbell
npm install && npm --prefix web install
docker compose up -d --wait
npm run blob && npm run chain && npm run web
```

Pilot accounts live in [`COMPAT.md`](https://github.com/HawaleShailesh004/silentbell/blob/main/COMPAT.md). Rotate them before any real campus.

## Challenges we ran into

I wanted the demo to feel like relief, not like debugging theatre-and Midnight’s stack fought me for it.

- Public-network wallet sync was the hardest fight: PreProd DUST checkpoints corrupted, Preview indexer threw `Wallet.Sync` retries for hours. I added `print-address` so funding does not wait on full sync, then landed the **Preview deploy** once the wallet finally synced and DUST arrived.
- Nested `onchain-runtime-v3` copies broke state in ways that looked like “my story vanished”; dedupe fixed it.
- A full roster (sixteen leaves) threw `exceeded structure bounds` mid-cast-the exact nightmare of a system that stops working when you need it. I taught the live cast to reuse existing leaves when the tree is full.
- Windows Compact compile forced a Docker path so I could ship instead of stall.

Each of those felt small next to the original fear. Shipping past them still mattered-because a product that fails when a student finally finds courage is another kind of silence.

## Accomplishments that we're proud of

I am proud that Silent Bell shows the **whole corridor**, not one happy screen: registrar, student, outsider fail, duplicate fail, named emergency, committee unlock, public counts.

I am proud of the **one-click live cast**-judges watch membership proven and identity withheld in one breath on real Compact proofs.

I am proud the Compact circuit is **on Midnight Preview** for track eligibility-not only on a laptop Docker net.

I am proud we kept the trust boundary honest in the UI: what stays on the device, what Midnight may learn, what the committee never sees on the silent rail.

And I am proud we label the narrative **synthetic**. The emotion is the brief. Real people deserve process, counsel, and keys we have not finished yet.

## What we learned

I learned that privacy tech only matters when someone is already shivering with a phone in their hands.

I learned Midnight is not “ZK for fun.” It is for the moment you need a campus to trust *enrolment* without demanding *identity*.

I learned institutional products need roles, empty states, export, and recovery-because courage is rare, and systems must not waste it.

## What's next for Silent Bell

Next, I want the fresher in that dark corridor to open a button inside the portal she already uses-not a crypto app she has never heard of.

- Campus SSO instead of pilot passwords
- SIS roster ingest instead of demo CSV seeds
- Committee keys in a real ceremony, rotated each semester
- One college MoU for a synthetic pilot under counsel
- Later: the same membership pattern for employment whistleblowing and benefits eligibility-prove you belong, without putting your name on the fire

Silent Bell is my answer to that night I locked my phone. Prove you are on the roll. Never force the name. Never let fakes own the microphone.

![Cover](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-thumbnail.png)

---

## Gallery (files on GitHub)

Upload from [`docs/media/devpost-gallery/`](https://github.com/HawaleShailesh004/silentbell/tree/main/docs/media/devpost-gallery).

| Shot | File |
| --- | --- |
| Cover | [00-devpost-thumbnail.png](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-gallery/00-devpost-thumbnail.png) |
| Landing | [01-hero-landing.png](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-gallery/01-hero-landing.png) |
| Two doors | [02-the-trap.png](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-gallery/02-the-trap.png) |
| Trust boundary | [03-trust-boundary-solution.png](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-gallery/03-trust-boundary-solution.png) |
| Sign-in | [04-signin.png](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-gallery/04-signin.png) |
| Registrar | [05-registrar-roll.png](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-gallery/05-registrar-roll.png) |
| Silent ring | [06-student-silent-ring.png](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-gallery/06-student-silent-ring.png) |
| Outsider fail | [07-failwell-outsider.png](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-gallery/07-failwell-outsider.png) |
| Duplicate fail | [07b-failwell-duplicate.png](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-gallery/07b-failwell-duplicate.png) |
| Named emergency | [08-named-emergency.png](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-gallery/08-named-emergency.png) |
| Committee inbox | [09-committee-inbox.png](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-gallery/09-committee-inbox.png) |
| Explorer | [10-public-explorer.png](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-gallery/10-public-explorer.png) |
| Live cast | [11-live-cast.png](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-gallery/11-live-cast.png) |
| Preview contract | [12-preview-contract-card.png](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/devpost-gallery/12-preview-contract-card.png) |

Diagrams: [architecture.svg](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/architecture.svg) · [trust-boundary.svg](https://raw.githubusercontent.com/HawaleShailesh004/silentbell/main/docs/media/trust-boundary.svg)

**Demo video:** [https://youtu.be/KOa5WjgBbwM](https://youtu.be/KOa5WjgBbwM)
