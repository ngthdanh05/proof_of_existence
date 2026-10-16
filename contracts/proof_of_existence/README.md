# Proof of Existence Contract

Sui Move 2024 package `proof_of_existence`. The package shares one `ProofRegistry` during initialization. Each successful `create_proof` call transfers a `ProofObject` to its creator and stores the hash-to-object-ID mapping in that registry.

## Modules and Data

### `proof_of_existence::registry`

- `ProofRegistry has key`: shared registry containing `Table<String, ID>` and `total_proofs`.
- `registry_total(registry: &ProofRegistry): u64`: return the number of active proofs.
- The package-private helpers `add_proof`, `remove_proof`, `contains_proof`, and `borrow_proof_id` are used by `core`; they are not callable from external packages or transactions.

### `proof_of_existence::core`

- `ProofMetadata`: `name`, `description`, `location`, and `category` strings.
- `ProofObject has key, store`: contains its hash, Walrus blob ID, owner, creation time in milliseconds, and metadata.
- `ProofCreated`: emitted with proof ID, hash, owner, blob ID, and timestamp.
- `ProofRevoked`: emitted with proof ID, hash, and owner.

The Move field is named `hash`; the frontend's input parameter is named `contentHash`. The hash should be the 64-character lowercase hexadecimal SHA-256 digest of the original file.

## Public API

```move
public fun create_proof(
    registry: &mut ProofRegistry,
    content_hash: String,
    blob_id: String,
    name: String,
    description: String,
    location: String,
    category: String,
    clock: &Clock,
    ctx: &mut TxContext,
)

public fun verify_proof(registry: &ProofRegistry, content_hash: String): bool
public fun get_proof_id(registry: &ProofRegistry, content_hash: String): Option<ID>
public fun revoke_proof(registry: &mut ProofRegistry, proof: ProofObject, ctx: &TxContext)

public fun proof_hash(proof: &ProofObject): String
public fun proof_owner(proof: &ProofObject): address
public fun proof_blob_id(proof: &ProofObject): String
public fun proof_created_at(proof: &ProofObject): u64
public fun registry_total(registry: &ProofRegistry): u64
```

`create_proof` rejects a duplicate hash, records the current Sui clock timestamp, emits `ProofCreated`, and transfers the proof object to the sender. `revoke_proof` requires the sender to own the proof, removes the hash from the registry, emits `ProofRevoked`, and deletes the proof object. Revoking a proof does not delete the Walrus blob.

| Abort constant | Code | Meaning |
| --- | ---: | --- |
| `EHashAlreadyExists` | `0` | A proof with this hash is already registered |
| `ENotOwner` | `1` | The sender is not the proof object's owner |

## Build and Test

Run from this directory:

```bash
sui move build
sui move test
```

## CLI Transaction Examples

The examples below assume the active Sui CLI environment is the same network as the package and registry, the active address has gas, and the shell variables are set:

```bash
export PACKAGE_ID=0x56a51cb422b069f443ff2e5157584f3235e3ad6f2018b051183c0d2c7c542a9e
export REGISTRY_ID=0x68e1db437480f79f88f1883750fef0eca4983c9bf736af84ec57b3e4e08f4dfc
export HASH=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

Create a proof (the CLI prints transaction effects, including the created `ProofObject` ID):

```bash
sui client ptb \
  --move-call "${PACKAGE_ID}::core::create_proof" \
  "@${REGISTRY_ID}" "\"${HASH}\"" '"<WALRUS_BLOB_ID>"' \
  '"Example file"' '"Description"' '""' '"document"' \
  @0x6 \
  --gas-budget 100000000
```

Read-only calls can be inspected without submitting a transaction:

```bash
# Verify a hash; the dev-inspect result contains the returned bool.
sui client ptb --dev-inspect \
  --move-call "${PACKAGE_ID}::core::verify_proof" \
  "@${REGISTRY_ID}" "\"${HASH}\""

# Look up the optional proof ID for a hash.
sui client ptb --dev-inspect \
  --move-call "${PACKAGE_ID}::core::get_proof_id" \
  "@${REGISTRY_ID}" "\"${HASH}\""

# Read the registry count.
sui client ptb --dev-inspect \
  --move-call "${PACKAGE_ID}::registry::registry_total" \
  "@${REGISTRY_ID}"
```

Set `PROOF_OBJECT_ID` to the owned object ID from the create transaction. The wallet or active CLI address must be its owner to revoke it:

```bash
export PROOF_OBJECT_ID=0x<proof-object-id>
sui client ptb \
  --move-call "${PACKAGE_ID}::core::revoke_proof" \
  "@${REGISTRY_ID}" "@${PROOF_OBJECT_ID}" \
  --gas-budget 100000000
```

Read an accessor by passing the proof object ID:

```bash
sui client ptb --dev-inspect \
  --move-call "${PACKAGE_ID}::core::proof_hash" "@${PROOF_OBJECT_ID}"
sui client ptb --dev-inspect \
  --move-call "${PACKAGE_ID}::core::proof_owner" "@${PROOF_OBJECT_ID}"
sui client ptb --dev-inspect \
  --move-call "${PACKAGE_ID}::core::proof_blob_id" "@${PROOF_OBJECT_ID}"
sui client ptb --dev-inspect \
  --move-call "${PACKAGE_ID}::core::proof_created_at" "@${PROOF_OBJECT_ID}"
```

Use the IDs and Walrus blob ID from your deployment/upload rather than the example values. The testnet registry and package defaults are also listed in the root README and `frontend/src/lib/constants.ts`.