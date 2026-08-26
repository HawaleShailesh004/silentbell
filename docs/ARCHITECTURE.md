# Silent Bell - architecture

## One diagram in words

```
Registrar (CSV) ──enrol──► Compact roster (Merkle leaves)
                              │
Student secret ──fileSilent / fileNamed──► Midnight ledger
                              │              (membership, category,
                              │               nullifier, commitment,
                              │               optional named handle)
                              │
Encrypted body ──X25519+AES-GCM──► Blob API ──► Committee inbox
```

## Components

| Layer          | What                                 | Port / note                |
| -------------- | ------------------------------------ | -------------------------- |
| Web UI         | React + Vite product shell           | 5173                       |
| Blob API       | Sealed capsules, case status, export | 8788                       |
| Chain API      | Enrol / file / epoch / ledger        | 8789                       |
| Proof server   | ZK proving                           | 6300 (Docker)              |
| Node + indexer | Local Midnight stack                 | Docker Compose             |
| Compact        | `silent-bell.compact`                | managed under `contracts/` |

## Circuits

| Circuit      | Who       | Effect                              |
| ------------ | --------- | ----------------------------------- |
| `enrol`      | Registrar | Insert student pk leaf              |
| `setEpoch`   | Registrar | New semester; old nullifiers remain |
| `fileSilent` | Student   | Membership + nullifier; no handle   |
| `fileNamed`  | Student   | Same + disclosed handle             |

## Trust boundary

| Private (device / sealed store) | Public (ledger)                 |
| ------------------------------- | ------------------------------- |
| Student secret, Merkle path     | Roster root / membership check  |
| Incident plaintext              | Category, nullifier, commitment |
| Committee decryption key        | Named handle only on named rail |

## Diagrams

- [architecture.svg](media/architecture.svg)
- [trust-boundary.svg](media/trust-boundary.svg)

## Threat model (pilot)

See root [README.md](../README.md#threat-model-pilot) and [COMPAT.md](../COMPAT.md).
