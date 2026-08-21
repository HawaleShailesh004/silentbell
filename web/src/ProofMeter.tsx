import { useEffect, useState } from "react";

export function ProofMeter({ running }: { running: boolean }) {
  const [sec, setSec] = useState(0);

  useEffect(() => {
    if (!running) {
      setSec(0);
      return;
    }
    const t0 = Date.now();
    const id = window.setInterval(() => setSec(Math.floor((Date.now() - t0) / 1000)), 200);
    return () => window.clearInterval(id);
  }, [running]);

  if (!running) return null;

  const cold = sec >= 45;

  return (
    <div className="meter" role="status" aria-live="polite">
      <span className="pulse" aria-hidden />
      <div>
        <p className="meter-kicker">ProofMeter</p>
        <strong>{sec}s elapsed — proving on this machine</strong>
        <p>
          Your numbers never left this device. 5–15 seconds is honest. This bar does not turn green until the circuit
          returns.
        </p>
        {cold && (
          <p className="fail">Past 45s the proof-server is cold — not a fake spinner succeeding in the background.</p>
        )}
      </div>
    </div>
  );
}
