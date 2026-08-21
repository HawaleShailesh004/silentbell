import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { BrandIcon } from "./BrandIcon";

type Go = (screen: "home" | "signin" | "demo" | "explorer") => void;

type Props = {
  go: Go;
  boundary: ReactNode;
};

/**
 * Marketing landing — story first, solution unavoidable.
 * Photos: real Unsplash stock (see public/images/CREDITS.md).
 */
export function Landing({ go, boundary }: Props) {
  return (
    <>
      <section className="hero" aria-label="Silent Bell">
        <div className="hero-visual" aria-hidden="true">
          <img
            className="hero-photo"
            src="/images/hero-campus.jpg"
            alt=""
            width={2400}
            height={1600}
            fetchPriority="high"
          />
          <div className="hero-gradient" />
          <div className="mist-drift" />
          <div className="campus-glow" />
          <div className="bell-stage">
            <svg className="bell-svg" viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path
                d="M120 28c-6 0-11 5-11 11v14c-38 10-66 46-66 88v42c0 8-10 14-18 18l-8 4v14h206v-14l-8-4c-8-4-18-10-18-18v-42c0-42-28-78-66-88V39c0-6-5-11-11-11z"
                fill="#f2f5f1"
                fillOpacity="0.94"
              />
              <path d="M88 219h64c0 18-14 33-32 33s-32-15-32-33z" fill="#c5d0c9" />
              <circle cx="120" cy="48" r="7" fill="#c9a227" />
              <path d="M155 72l28 28M183 72l-28 28" stroke="#c9a227" strokeWidth="8" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div className="hero-copy">
          <div className="hero-brand-row">
            <BrandIcon className="hero-brand-icon" />
            <p className="hero-eyebrow">Campus intake · Midnight Compact</p>
          </div>
          <h1 className="hero-brand">Silent Bell</h1>
          <p className="hero-line">The report that cannot be traced. The student who cannot be faked.</p>
          <p className="hero-support">
            Prove you belong on this semester’s roll — without ever naming which leaf you are.
          </p>
          <div className="hero-cta">
            <button className="primary" onClick={() => go("signin")}>
              Enter the product
            </button>
            <button
              className="ghost hero-ghost"
              onClick={() => document.getElementById("solution")?.scrollIntoView({ behavior: "smooth" })}
            >
              See how it works
            </button>
          </div>
        </div>
      </section>

      <section className="section trap-section" aria-labelledby="trap-title">
        <div className="section-inner">
          <Reveal>
            <p className="section-kicker">The trap</p>
            <h2 id="trap-title">Campuses are forced to choose the wrong kind of silence.</h2>
            <p className="section-lead story-lead">
              Students who fear retaliation stay quiet. Forms that accept anyone drown real harm in spam. Equity cells
              inherit both failures — and none of the trust.
            </p>
          </Reveal>
          <div className="trap-grid">
            <Reveal className="trap-col" delay={80}>
              <p className="trap-label">Named complaint</p>
              <p className="trap-outcome">Retaliation risk. Juniors never file.</p>
            </Reveal>
            <div className="trap-or" aria-hidden>
              or
            </div>
            <Reveal className="trap-col" delay={160}>
              <p className="trap-label">Anonymous form</p>
              <p className="trap-outcome">Outsiders spam. Committee cannot trust a word.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section solution-section" id="solution" aria-labelledby="solution-title">
        <div className="solution-wash" aria-hidden="true" />
        <div className="section-inner">
          <Reveal>
            <p className="section-kicker">The solution</p>
            <h2 id="solution-title">Silent Bell breaks the trap with one proof.</h2>
            <p className="section-lead story-lead">
              A student proves membership in the semester roster. Midnight accepts the filing. The ledger never learns
              which student. The story stays sealed for the committee alone.
            </p>
          </Reveal>

          <div className="solution-visual-row">
            <Reveal className="photo-frame" delay={60}>
              <div className="icon-panel icon-panel-seal" aria-hidden="true">
                <svg className="feature-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="14" y="18" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="2.2" />
                  <path d="M14 24l18 12 18-12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="46" cy="42" r="10" fill="var(--teal-mist)" stroke="currentColor" strokeWidth="2.2" />
                  <path d="M46 37v6l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="photo-caption">Sealed on purpose — plaintext never hits the ledger.</p>
            </Reveal>
            <Reveal className="photo-frame" delay={140}>
              <div className="icon-panel icon-panel-quiet" aria-hidden="true">
                <svg className="feature-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="22" r="10" stroke="currentColor" strokeWidth="2.2" />
                  <path d="M14 50c2.5-10 10-15 18-15s15.5 5 18 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M12 12l40 40" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </div>
              <p className="photo-caption">Quiet intake. No parade of names.</p>
            </Reveal>
          </div>

          <div className="proof-stage" aria-label="How Silent Bell proves enrolment privately">
            <Reveal className="proof-node private-node" delay={80}>
              <span className="proof-kicker">Stays on device</span>
              <strong>Your leaf</strong>
              <p>Secret enrolment. Incident text. Never published.</p>
            </Reveal>
            <div className="proof-arrow" aria-hidden>
              <span />
              <em>Compact proof</em>
              <span />
            </div>
            <Reveal className="proof-node public-node" delay={180}>
              <span className="proof-kicker">On the ledger</span>
              <strong>Public facts only</strong>
              <ul>
                <li>
                  <b>Enrolled</b> — yes
                </li>
                <li>
                  <b>Which student</b> — never
                </li>
                <li>
                  <b>Story</b> — sealed off-chain
                </li>
                <li>
                  <b>Hoax flood</b> — nullifier stops it
                </li>
              </ul>
            </Reveal>
          </div>

          <Reveal className="promise-strip" delay={100}>
            <p>
              <strong>Outsiders fail.</strong> Not on the roll → proof rejected.
            </p>
            <p>
              <strong>Duplicates fail.</strong> Same category, same semester → blocked.
            </p>
            <p>
              <strong>Committee reads the case.</strong> Not the silent identity.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section boundary-section" aria-labelledby="boundary-title">
        <div className="section-inner">
          <Reveal>
            <p className="section-kicker">Trust boundary</p>
            <h2 id="boundary-title">What Midnight sees. What it never sees.</h2>
            <p className="section-lead story-lead">
              This is the product promise — drawn as a line, not a slogan.
            </p>
          </Reveal>
          <Reveal delay={100}>{boundary}</Reveal>
        </div>
      </section>

      <section className="section roles-section" aria-labelledby="roles-title">
        <div className="roles-photo-bleed" aria-hidden="true">
          <img src="/images/campus-dusk.jpg" alt="" width={1600} height={1048} loading="lazy" />
          <div className="roles-photo-veil" />
        </div>
        <div className="section-inner roles-inner">
          <Reveal>
            <p className="section-kicker">Who uses it</p>
            <h2 id="roles-title">Three campus doors. One shared truth.</h2>
            <p className="section-lead story-lead">
              Sign in as the role you are. The public explorer needs no account.
            </p>
          </Reveal>
          <ol className="role-flow">
            <Reveal as="li" delay={60}>
              <span className="role-num">01</span>
              <div>
                <h3>Registrar</h3>
                <p>Publishes the semester roll as hashed leaves. Freezes the epoch when the term turns.</p>
              </div>
            </Reveal>
            <Reveal as="li" delay={120}>
              <span className="role-num">02</span>
              <div>
                <h3>Student</h3>
                <p>Rings silently — or takes the named emergency rail when danger requires a handle.</p>
              </div>
            </Reveal>
            <Reveal as="li" delay={180}>
              <span className="role-num">03</span>
              <div>
                <h3>Committee</h3>
                <p>Unlocks on device, decrypts the sealed case, acts — without learning which silent leaf filed.</p>
              </div>
            </Reveal>
          </ol>
          <Reveal className="cta-band" delay={80}>
            <div>
              <h3>Ready to walk the product</h3>
              <p>Use pilot accounts, or run the live cast for judges.</p>
            </div>
            <div className="cta-band-actions">
              <button className="primary" onClick={() => go("signin")}>
                Sign in
              </button>
              <button className="ghost" onClick={() => go("demo")}>
                Live demo
              </button>
              <button className="ghost" onClick={() => go("explorer")}>
                Public explorer
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="footer-brand">
            <strong className="brand-mark footer-logo">
              <BrandIcon className="brand-icon" />
              <span>Silent Bell</span>
            </strong>
            <p>Anonymous campus intake with Compact membership proofs. Built on Midnight.</p>
          </div>
          <div className="footer-cols">
            <div>
              <h4>Product</h4>
              <button type="button" onClick={() => go("signin")}>
                Sign in
              </button>
              <button type="button" onClick={() => go("demo")}>
                Live demo
              </button>
              <button type="button" onClick={() => go("explorer")}>
                Explorer
              </button>
            </div>
            <div>
              <h4>Promise</h4>
              <p>Traceable never · Faked never</p>
              <p>Plaintext never on-chain</p>
              <p>Photos · Unsplash (CREDITS.md)</p>
            </div>
          </div>
        </div>
        <div className="site-footer-bar">
          <span>Silent Bell · Brainwave Midnight Track</span>
          <span>The ledger learns enrolment — never the name</span>
        </div>
      </footer>
    </>
  );
}
