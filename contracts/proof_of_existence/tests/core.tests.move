#[test_only]
module proof_of_existence::core_tests;

use proof_of_existence::core::{Self, ProofObject};
use proof_of_existence::registry::{Self, ProofRegistry};
use std::string;
use sui::clock;
use sui::test_scenario as ts;

// ============ Test Addresses ============
const ALICE: address = @0xA;
const BOB: address = @0xB;

// ============ Test Fixtures ============
fun sample_hash(): string::String {
    string::utf8(b"content_hash_abc123")
}

fun sample_blob_id(): string::String {
    string::utf8(b"blob_id_xyz789")
}

fun sample_name(): string::String {
    string::utf8(b"Test Proof")
}

fun sample_description(): string::String {
    string::utf8(b"A test proof of existence")
}

fun sample_location(): string::String {
    string::utf8(b"Ho Chi Minh City")
}

fun sample_category(): string::String {
    string::utf8(b"document")
}

// ============ Test 1: create_proof success ============
#[test]
fun test_create_proof_success() {
    let mut scenario = ts::begin(ALICE);

    // 1. Khởi tạo ProofRegistry shared object
    {
        registry::init_for_testing(ts::ctx(&mut scenario));
    };

    // 2. ALICE tạo proof
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut registry = ts::take_shared<ProofRegistry>(&scenario);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        core::create_proof(
            &mut registry,
            sample_hash(),
            sample_blob_id(),
            sample_name(),
            sample_description(),
            sample_location(),
            sample_category(),
            &clock,
            ts::ctx(&mut scenario),
        );

        assert!(registry::registry_total(&registry) == 1, 0);

        clock::destroy_for_testing(clock);
        ts::return_shared(registry);
    };

    // 3. Kiểm tra ProofObject của ALICE
    ts::next_tx(&mut scenario, ALICE);
    {
        let proof = ts::take_from_sender<ProofObject>(&scenario);

        assert!(core::proof_owner(&proof) == ALICE, 1);
        assert!(core::proof_hash(&proof) == sample_hash(), 2);
        assert!(core::proof_blob_id(&proof) == sample_blob_id(), 3);

        ts::return_to_sender(&scenario, proof);
    };

    ts::end(scenario);
}

// ============ Test 2: duplicate hash should fail ============
#[test]
#[expected_failure(abort_code = core::EHashAlreadyExists)]
fun test_create_proof_duplicate_hash_should_fail() {
    let mut scenario = ts::begin(ALICE);

    {
        registry::init_for_testing(ts::ctx(&mut scenario));
    };

    // ALICE tạo proof lần 1 -> thành công
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut registry = ts::take_shared<ProofRegistry>(&scenario);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        core::create_proof(
            &mut registry,
            sample_hash(),
            sample_blob_id(),
            sample_name(),
            sample_description(),
            sample_location(),
            sample_category(),
            &clock,
            ts::ctx(&mut scenario),
        );

        clock::destroy_for_testing(clock);
        ts::return_shared(registry);
    };

    // BOB tạo proof cùng hash -> abort EHashAlreadyExists
    ts::next_tx(&mut scenario, BOB);
    {
        let mut registry = ts::take_shared<ProofRegistry>(&scenario);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        core::create_proof(
            &mut registry,
            sample_hash(),
            sample_blob_id(),
            sample_name(),
            sample_description(),
            sample_location(),
            sample_category(),
            &clock,
            ts::ctx(&mut scenario),
        );

        clock::destroy_for_testing(clock);
        ts::return_shared(registry);
    };

    ts::end(scenario);
}

// ============ Test 3: verify_proof & get_proof_id ============
#[test]
fun test_verify_and_get_proof_id() {
    let mut scenario = ts::begin(ALICE);

    {
        registry::init_for_testing(ts::ctx(&mut scenario));
    };

    // 1. Trước khi tạo proof: verify = false, get_proof_id = none
    ts::next_tx(&mut scenario, ALICE);
    {
        let registry = ts::take_shared<ProofRegistry>(&scenario);

        assert!(core::verify_proof(&registry, sample_hash()) == false, 0);
        assert!(option::is_none(&core::get_proof_id(&registry, sample_hash())), 1);

        ts::return_shared(registry);
    };

    // 2. ALICE tạo proof
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut registry = ts::take_shared<ProofRegistry>(&scenario);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        core::create_proof(
            &mut registry,
            sample_hash(),
            sample_blob_id(),
            sample_name(),
            sample_description(),
            sample_location(),
            sample_category(),
            &clock,
            ts::ctx(&mut scenario),
        );

        clock::destroy_for_testing(clock);
        ts::return_shared(registry);
    };

    // 3. Sau khi tạo proof: verify = true, get_proof_id = some
    ts::next_tx(&mut scenario, ALICE);
    {
        let registry = ts::take_shared<ProofRegistry>(&scenario);

        assert!(core::verify_proof(&registry, sample_hash()) == true, 2);
        assert!(option::is_some(&core::get_proof_id(&registry, sample_hash())), 3);

        ts::return_shared(registry);
    };

    ts::end(scenario);
}

// ============ Test 4: revoke_proof success ============
#[test]
fun test_revoke_proof_success() {
    let mut scenario = ts::begin(ALICE);

    {
        registry::init_for_testing(ts::ctx(&mut scenario));
    };

    // ALICE tạo proof
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut registry = ts::take_shared<ProofRegistry>(&scenario);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        core::create_proof(
            &mut registry,
            sample_hash(),
            sample_blob_id(),
            sample_name(),
            sample_description(),
            sample_location(),
            sample_category(),
            &clock,
            ts::ctx(&mut scenario),
        );

        clock::destroy_for_testing(clock);
        ts::return_shared(registry);
    };

    // ALICE revoke proof
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut registry = ts::take_shared<ProofRegistry>(&scenario);
        let proof = ts::take_from_sender<ProofObject>(&scenario);

        core::revoke_proof(&mut registry, proof, ts::ctx(&mut scenario));

        assert!(registry::registry_total(&registry) == 0, 0);
        assert!(core::verify_proof(&registry, sample_hash()) == false, 1);

        ts::return_shared(registry);
    };

    ts::end(scenario);
}

// ============ Test 5: revoke_proof by non-owner should fail ============
#[test]
#[expected_failure(abort_code = core::ENotOwner)]
fun test_revoke_proof_by_non_owner_should_fail() {
    let mut scenario = ts::begin(ALICE);

    {
        registry::init_for_testing(ts::ctx(&mut scenario));
    };

    // ALICE tạo proof
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut registry = ts::take_shared<ProofRegistry>(&scenario);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        core::create_proof(
            &mut registry,
            sample_hash(),
            sample_blob_id(),
            sample_name(),
            sample_description(),
            sample_location(),
            sample_category(),
            &clock,
            ts::ctx(&mut scenario),
        );

        clock::destroy_for_testing(clock);
        ts::return_shared(registry);
    };

    // BOB lấy ProofObject của ALICE và cố tình revoke -> abort ENotOwner
    ts::next_tx(&mut scenario, BOB);
    {
        let mut registry = ts::take_shared<ProofRegistry>(&scenario);
        let proof = ts::take_from_address<ProofObject>(&scenario, ALICE);

        core::revoke_proof(&mut registry, proof, ts::ctx(&mut scenario));

        ts::return_shared(registry);
    };

    ts::end(scenario);
}
