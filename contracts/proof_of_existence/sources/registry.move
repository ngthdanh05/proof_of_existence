module proof_of_existence::registry;

use std::string::String;
use sui::table::{Self, Table};

// ============ Struct (từ Task 1) ============
public struct ProofRegistry has key {
    id: UID,
    proofs: Table<String, ID>,
    total_proofs: u64,
}

// ============ Init ============
fun init(ctx: &mut TxContext) {
    let registry = ProofRegistry {
        id: object::new(ctx),
        proofs: table::new<String, ID>(ctx),
        total_proofs: 0,
    };
    transfer::share_object(registry);
}

// ============ Package-level helpers (dùng bởi core.move) ============

/// Thêm cặp hash -> proof ID vào registry, tăng total_proofs.
/// Gọi trong core::create_proof sau khi đã assert không trùng hash.
public(package) fun add_proof(registry: &mut ProofRegistry, content_hash: String, proof_id: ID) {
    table::add(&mut registry.proofs, content_hash, proof_id);
    registry.total_proofs = registry.total_proofs + 1;
}

/// Xóa hash khỏi registry, giảm total_proofs.
/// Gọi trong core::revoke_proof.
public(package) fun remove_proof(registry: &mut ProofRegistry, content_hash: String) {
    table::remove(&mut registry.proofs, content_hash);
    registry.total_proofs = registry.total_proofs - 1;
}

/// Kiểm tra hash đã tồn tại trong registry chưa.
public(package) fun contains_proof(registry: &ProofRegistry, content_hash: String): bool {
    table::contains(&registry.proofs, content_hash)
}

/// Lấy proof ID tương ứng hash (yêu cầu hash đã tồn tại — caller tự kiểm tra trước).
public(package) fun borrow_proof_id(registry: &ProofRegistry, content_hash: String): ID {
    *table::borrow(&registry.proofs, content_hash)
}

// ============ Public accessor ============

public fun registry_total(registry: &ProofRegistry): u64 {
    registry.total_proofs
}

// ============ Test-only helper ============
#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
