# Compatibility matrix

Pinned for Brainwave 2026 Midnight Track - Silent Bell only.

| Piece              | Version |
| ------------------ | ------- |
| create-mn-app      | 0.5.0   |
| compact CLI        | 0.5.2   |
| compactc           | 0.31.1  |
| midnight-js        | 4.1.1   |
| compact-runtime    | 0.16.0  |
| wallet-sdk         | 1.2.0   |
| proof-server image | 8.1.0   |
| Node               | 22      |

`onchain-runtime-v3` must be a **single 3.0.0 copy**. `postinstall` removes nested copies.

## Networks / faucets

| Network    | Faucet                                  |
| ---------- | --------------------------------------- |
| undeployed | genesis wallet (local Docker)           |
| preprod    | https://faucet.preprod.midnight.network |
| preview    | https://faucet.preview.midnight.network |

Fund the **unshielded** `mn_addr_…` address only.

## Committee pilot secrets (local / demo - rotate for real pilots)

| Secret                         | Value                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Committee passphrase (decrypt) | `silentbell-committee-pilot-v1`                                                               |
| Blob API Bearer token          | `silentbell-committee-pilot-token` (override with `COMMITTEE_TOKEN` / `VITE_COMMITTEE_TOKEN`) |

Encryption: X25519 ECDH + AES-GCM (`@noble/curves` / `@noble/ciphers`). Not XOR.

## Product demo accounts (sign in at `#signin`)

| Role                 | Email                  | Password               |
| -------------------- | ---------------------- | ---------------------- |
| Registrar            | `registrar@campus.edu` | `SilentBell!Registrar` |
| Student (on roll)    | `asha@campus.edu`      | `SilentBell!Student`   |
| Student (on roll)    | `meera@campus.edu`     | `SilentBell!Student`   |
| Outsider (must fail) | `ravi@outsider.test`   | `SilentBell!Outsider`  |
| Committee            | `committee@campus.edu` | `SilentBell!Committee` |

After committee sign-in, unlock inbox with the committee passphrase above.

## Preview deploy (eligibility — live)

| Field | Value |
| --- | --- |
| Network | Preview |
| Contract | `5c5312147f35c25ff0ba3aa9771e46e6b19ea1522b232a08b3dacabc95fc4048` |
| Deployer | `mn_addr_preview1guclk6ltr8prs87mu7um563r46fzdtvnazg0vzc8xame8qqhe93s7v7dx6` |
| Explorer | https://explorer.preview.midnight.network/ |
| Faucet | https://faucet.preview.midnight.network |
| Deployed | 2026-08-26 |

## PreProd fund address (optional twin)

`mn_addr_preprod136fxce5gstdxjm49vsse875qwt0u99rr8gytff7raqcf86q0936s7mncqy`

Print again anytime: `npm run print-address` (does not wait for full sync).
