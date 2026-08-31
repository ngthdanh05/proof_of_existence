module proof_of_existence::core;

use proof_of_existence::registry::{Self, ProofRegistry};
use std::string::String;
use sui::clock::{Self, Clock};
use sui::event;

// ============ Error Codes ============
const EHashAlreadyExists: u64 = 0;
const ENotOwner: u64 = 1;

// ============ Structs (từ Task 1) ============
public struct ProofMetadata has copy, drop, store {
    name: String,
    description: String,
    location: String,
    category: String,
}

public struct ProofObject has key, store {
    id: UID,
    hash: String,
    blob_id: String,
    owner: address,
    created_at: u64,
    metadata: ProofMetadata,
}

// ============ Events (từ Task 1) ============
public struct ProofCreated has copy, drop {
    proof_id: ID,
    hash: String,
    owner: address,
    blob_id: String,
    created_at: u64,
}

public struct ProofRevoked has copy, drop {
    proof_id: ID,
    hash: String,
    owner: address,
}

// ============ Core Functions ============

/// Tạo bằng chứng tồn tại mới (Proof of Existence) cho một content hash.
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
) {
    // 1. Đảm bảo hash chưa từng được đăng ký
    assert!(!registry::contains_proof(registry, content_hash), EHashAlreadyExists);

    let sender = tx_context::sender(ctx);
    let timestamp = clock::timestamp_ms(clock);

    // 2. Khởi tạo metadata & object
    let metadata = ProofMetadata {
        name,
        description,
        location,
        category,
    };

    let proof = ProofObject {
        id: object::new(ctx),
        hash: content_hash,
        blob_id,
        owner: sender,
        created_at: timestamp,
        metadata,
    };

    let proof_id = object::id(&proof);

    // 3. Đăng ký hash -> ID vào registry, tăng total_proofs
    registry::add_proof(registry, content_hash, proof_id);

    // 4. Emit event
    event::emit(ProofCreated {
        proof_id,
        hash: content_hash,
        owner: sender,
        blob_id: proof.blob_id,
        created_at: timestamp,
    });

    // // 5. Chuyển ProofObject cho sender
    transfer::public_transfer(proof, sender);
}

/// Kiểm tra một content hash đã được chứng thực (verify) trên registry hay chưa.
public fun verify_proof(registry: &ProofRegistry, content_hash: String): bool {
    registry::contains_proof(registry, content_hash)
}

/// Lấy Proof ID tương ứng với content hash (nếu tồn tại).
public fun get_proof_id(registry: &ProofRegistry, content_hash: String): Option<ID> {
    if (registry::contains_proof(registry, content_hash)) {
        option::some(registry::borrow_proof_id(registry, content_hash))
    } else {
        option::none()
    }
}

/// Thu hồi (revoke) một ProofObject — chỉ owner mới có quyền thực hiện.
public fun revoke_proof(registry: &mut ProofRegistry, proof: ProofObject, ctx: &TxContext) {
    // 1. Chỉ owner mới được revoke
    assert!(tx_context::sender(ctx) == proof.owner, ENotOwner);

    let ProofObject {
        id,
        hash,
        blob_id: _,
        owner,
        created_at: _,
        metadata: _,
    } = proof;

    let proof_id = object::uid_to_inner(&id);

    // 2. Xóa hash khỏi registry, giảm total_proofs
    registry::remove_proof(registry, hash);

    // 3. Emit event
    event::emit(ProofRevoked {
        proof_id,
        hash,
        owner,
    });

    // 4. Hủy UID để giải phóng object
    object::delete(id);
}

// ============ Accessor Functions ============

public fun proof_hash(proof: &ProofObject): String {
    proof.hash
}

public fun proof_owner(proof: &ProofObject): address {
    proof.owner
}

public fun proof_blob_id(proof: &ProofObject): String {
    proof.blob_id
}

public fun proof_created_at(proof: &ProofObject): u64 {
    proof.created_at
}
