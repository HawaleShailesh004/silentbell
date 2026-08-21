import { FAIL_COPY, type FailKind } from "./fail";

export function FailWell({ kind }: { kind: FailKind | null }) {
  if (!kind) return null;
  const copy = FAIL_COPY[kind];
  return (
    <aside className={`failwell ${kind}`} role="alert">
      <p className="failwell-kicker">Proof refused</p>
      <h3>{copy.title}</h3>
      <p>{copy.body}</p>
    </aside>
  );
}
