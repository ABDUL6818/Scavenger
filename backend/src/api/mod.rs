pub mod archival;
pub mod audit;
pub mod compliance_api;
pub mod contracts;
pub mod export;
pub mod pagination;
pub mod search;
pub mod signing_api;
pub mod verification;
pub mod ws;
// Removed modules (deprecated/unused endpoints, see #1700 and #906):
// - analytics: legacy endpoints were never registered (#906)
// - Any other deprecated route modules must be removed from this list and
//   from the router registration in main.rs to keep them in sync.