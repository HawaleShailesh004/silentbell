import type { Ledger } from "../contracts/managed/silent-bell/contract/index.js";

export type BellPrivateState = {
  secret: Uint8Array;
};

export const emptyPrivateState = (secret: Uint8Array): BellPrivateState => ({ secret });

export const witnesses = {
  local_secret_key({ privateState }: { privateState: BellPrivateState }): [BellPrivateState, Uint8Array] {
    return [privateState, privateState.secret];
  },
  getRosterPath(
    { privateState, ledger }: { privateState: BellPrivateState; ledger: Ledger },
    leaf: Uint8Array,
  ) {
    const path = ledger.roster.findPathForLeaf(leaf);
    if (!path) {
      throw new Error("Not on the roll");
    }
    return [privateState, path] as const;
  },
};
