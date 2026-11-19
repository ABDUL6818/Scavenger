pub mod analytics;
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

// Controller layer modules (#1697): route handlers are registered through
// controllers, which delegate to service/repository layers. Public route paths
// are unchanged; these modules are internal additions and do not affect the
// external API surface.
pub mod analytics_controller;
pub mod archival_controller;
pub mod audit_controller;
pub mod compliance_controller;
pub mod export_controller;
pub mod search_controller;
pub mod signing_controller;
pub mod verification_controller;
pub mod ws_controller;

// Note: the legacy `analytics` module was previously removed because its
// endpoints were never registered (#906). The `analytics` module is now
// re-introduced as part of the controller/service/repository split (#1697);
// its routes remain unregistered at the top level and are only exposed via
// `analytics_controller`, preserving backward-compatible behavior.