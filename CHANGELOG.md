# Changelog

## [Unreleased]

### Changed - Issues #1730, #1731, #1732, #1733

#### #1733 — Property-based tests for reward/payout math
- Extended `contracts/scavenger/src/test_reward_fuzz.rs` with additional
  invariants: `total_distributed >= 0`, zero-weight sub-kilogram invariant,
  and a `fuzz_payout_monotone` test that verifies reward scales with weight.

#### #1732 — Minimize WASM size (opt-level, strip, dedupe deps)
- Root `Cargo.toml` `[profile.release]` already carries `opt-level = "z"`,
  `strip = "symbols"`, `lto = true`, `codegen-units = 1`, `panic = "abort"`.
  No ABI-breaking changes.
- Added `required-features = []` to the `[[bench]]` target in
  `stellar-contract/Cargo.toml` to make the bench dependency explicit.
- `soroban-sdk` with `testutils` feature remains in `[dev-dependencies]` only,
  so it is never compiled into the production WASM.

#### #1731 — Validate all inputs (zero/negative amounts, empty strings)
- Fixed broken `validate_string_max_len` in `stellar-contract/src/validation.rs`:
  removed orphaned identifier-validator code and extracted it into the new
  `validate_identifier` function.
- Added missing `validate_positive_amount`, `validate_positive_u128`, and
  `validate_future_timestamp` functions to `stellar-contract/src/validation.rs`.
- Fixed `validate_waste_submission` and `validate_participant_registration` in
  `stellar-contract/src/validation/mod.rs` to pass `env` to `validate_weight`
  and `validate_coordinates` (required by the `panic_with_error!` API).
- Updated all inline tests in `validation/mod.rs` to pass `env` to the
  `panic_with_error!`-based validators.

#### #1730 — Standardize event emission schema
- Standardized `emit_tokens_rewarded` signature: `waste_id` changed from `u64`
  to `u128` for consistency with all other waste-related event functions.
  All call sites in `lib.rs` updated with `waste_id as u128` casts.
- Updated event schema table in `event_builder.rs` docstring:
  - `rewarded` payload corrected to `(amount, waste_id)`.
  - `donated` payload corrected to `(amount, charity)`.
  - `bulk_xfr` topic and payload corrected to match `emit_bulk_transfer`.
  - `adm_xfr` clarified for both admin-transfer and admin-override-transfer uses.

### Migration Guide
- **#1731**: `validate_waste_submission` and `validate_participant_registration`
  in `validation/mod.rs` now require an `&Env` first argument. Update any
  direct call sites outside the crate accordingly.
- **#1730**: `emit_tokens_rewarded` now takes `waste_id: u128`.
  Any external caller passing a `u64` must add an `as u128` cast.


- **Export Endpoints Cleanup**: Removed legacy export formats that had no active client usage.
  - Removed `GET /api/export/excel` - Legacy Excel format
  - Removed `GET /api/export/xml` - Legacy XML format
  - Removed `GET /api/export/pdf` - Legacy PDF format
  - Removed `GET /api/export/legacy` - Legacy endpoint

### Changed - Issue #1077
- **Export Endpoints**: Active export endpoints now support only CSV and JSON formats.
  - `GET /api/export/waste` - CSV and JSON
  - `GET /api/export/users` - CSV and JSON (admin only)
  - `GET /api/export/analytics` - CSV and JSON (admin only)

### Migration Guide
Clients should migrate to the active endpoints:
- Use `format=csv` for CSV data
- Use `format=json` for JSON data

### Date
2024-01-15: Legacy endpoints removed
