use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Top-level application error hierarchy.
///
/// Every fallible operation in the backend ultimately returns one of these variants,
/// enabling a single `ResponseError` impl and uniform JSON error bodies.
#[derive(Debug, Error)]
pub enum AppError {
    // ── Domain errors ─────────────────────────────────────────────────────────
    #[error("Authentication error: {0}")]
    Auth(#[from] AuthError),

    #[error("Validation error: {0}")]
    Validation(#[from] ValidationError),

    #[error("Export error: {0}")]
    Export(#[from] ExportError),

    #[error("Email error: {0}")]
    Email(#[from] EmailError),

    #[error("Storage error: {0}")]
    Storage(#[from] StorageError),

    #[error("Contract error: {0}")]
    Contract(#[from] ContractError),

    #[error("Webhook error: {0}")]
    Webhook(#[from] WebhookError),

    #[error("Notification error: {0}")]
    Notification(#[from] NotificationError),

    #[error("Serialization error: {0}")]
    Serialization(#[from] SerializationError),

    #[error("Analytics error: {0}")]
    Analytics(#[from] AnalyticsError),

    // ── Infrastructure errors ─────────────────────────────────────────────────
    #[error("Not found: {resource} with id '{id}'")]
    NotFound { resource: &'static str, id: String },

    #[error("Internal server error: {0}")]
    Internal(String),

    #[error("Rate limit exceeded")]
    RateLimitExceeded,

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Conflict: {0}")]
    Conflict(String),
}

// ── From conversions ──────────────────────────────────────────────────────────
//
// Domain errors already convert via `#[from]` on the `AppError` variants above.
// The impls below cover the remaining infrastructure-level conversions so that
// `?` works uniformly across the backend.

impl From<anyhow::Error> for AppError {
    fn from(err: anyhow::Error) -> Self {
        // Preserve a typed `AppError` if one is wrapped inside the `anyhow::Error`.
        match err.downcast::<AppError>() {
            Ok(app_err) => app_err,
            Err(other) => AppError::Internal(other.to_string()),
        }
    }
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::Internal(format!("io error: {err}"))
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::Serialization(SerializationError::Json(err.to_string()))
    }
}

// ── Domain error enums ────────────────────────────────────────────────────────

#[derive(Debug, Error, Serialize, Deserialize, Clone)]
pub enum AuthError {
    #[error("Unauthorized: {0}")]
    Unauthorized(String),
    #[error("Forbidden: {0}")]
    Forbidden(String),
    #[error("Token expired")]
    TokenExpired,
    #[error("Invalid token")]
    InvalidToken,
    #[error("CSRF token mismatch")]
    CsrfMismatch,
}

#[derive(Debug, Error, Serialize, Deserialize, Clone)]
pub enum ValidationError {
    #[error("Field '{field}': {message}")]
    Field { field: String, message: String },
    #[error("Multiple validation errors")]
    Multiple(Vec<FieldError>),
    #[error("Invalid format for '{field}': expected {expected}")]
    Format { field: String, expected: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldError {
    pub field: String,
    pub message: String,
}

#[derive(Debug, Error, Serialize, Deserialize, Clone)]
pub enum ExportError {
    #[error("CSV export error: {0}")]
    Csv(String),
    #[error("JSON export error: {0}")]
    Json(String),
    #[error("PDF export error: {0}")]
    Pdf(String),
    #[error("Serialization error: {0}")]
    Serialization(String),
    #[error("Invalid format: {0}")]
    InvalidFormat(String),
}

#[derive(Debug, Error, Serialize, Deserialize, Clone)]
pub enum EmailError {
    #[error("Email service error: {0}")]
    Service(String),
    #[error("Template error: {0}")]
    Template(String),
    #[error("Invalid email address: {0}")]
    InvalidAddress(String),
    #[error("Delivery failed: {0}")]
    Delivery(String),
}

#[derive(Debug, Error, Serialize, Deserialize, Clone)]
pub enum StorageError {
    #[error("Storage service error: {0}")]
    Service(String),
    #[error("Invalid file: {0}")]
    InvalidFile(String),
    #[error("File not found: {0}")]
    NotFound(String),
    #[error("Upload failed: {0}")]
    UploadFailed(String),
    #[error("Quota exceeded")]
    QuotaExceeded,
}

#[derive(Debug, Error, Serialize, Deserialize, Clone)]
pub enum ContractError {
    #[error("Contract call failed: {0}")]
    CallFailed(String),
    #[error("Contract not found: {0}")]
    NotFound(String),
    #[error("Invalid contract state: {0}")]
    InvalidState(String),
    #[error("Insufficient balance: required {required}, available {available}")]
    InsufficientBalance { required: u128, available: u128 },
    #[error("Unauthorized contract operation: {0}")]
    Unauthorized(String),
}

#[derive(Debug, Error, Serialize, Deserialize, Clone)]
pub enum WebhookError {
    #[error("Delivery failed: {0}")]
    DeliveryFailed(String),
    #[error("Invalid webhook URL: {0}")]
    InvalidUrl(String),
    #[error("Webhook not found: {0}")]
    NotFound(String),
    #[error("Signature mismatch")]
    SignatureMismatch,
}

#[derive(Debug, Error, Serialize, Deserialize, Clone)]
pub enum NotificationError {
    #[error("Push notification failed: {0}")]
    PushFailed(String),
    #[error("Invalid device token: {0}")]
    InvalidToken(String),
    #[error("Service unavailable: {0}")]
    ServiceUnavailable(String),
}

#[derive(Debug, Error, Serialize, Deserialize, Clone)]
pub enum SerializationError {
    #[error("JSON serialization error: {0}")]
    Json(String),
    #[error("CSV serialization error: {0}")]
    Csv(String),
    #[error("Decode error: {0}")]
    Decode(String),
}

#[derive(Debug, Error, Serialize, Deserialize, Clone)]
pub enum AnalyticsError {
    #[error("Metric computation failed: {0}")]
    ComputationFailed(String),
    #[error("Invalid time range: {0}")]
    InvalidTimeRange(String),
    #[error("Data source unavailable: {0}")]
    DataSourceUnavailable(String),
}

// ── Error category classification ─────────────────────────────────────────────

/// Stable machine-readable categories for structured logging and monitoring.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ErrorCategory {
    Auth,
    Validation,
    Export,
    Email,
    Storage,
    Contract,
    Webhook,
    Notification,
    Serialization,
    Analytics,
    NotFound,
    Internal,
    RateLimit,
    BadRequest,
    Conflict,
}

impl AppError {
    pub fn category(&self) -> ErrorCategory {
        match self {
            AppError::Auth(_) => ErrorCategory::Auth,
            AppError::Validation(_) => ErrorCategory::Validation,
            AppError::Export(_) => ErrorCategory::Export,
            AppError::Email(_) => ErrorCategory::Email,
            AppError::Storage(_) => ErrorCategory::Storage,
            AppError::Contract(_) => ErrorCategory::Contract,
            AppError::Webhook(_) => ErrorCategory::Webhook,
            AppError::Notification(_) => ErrorCategory::Notification,
            AppError::Serialization(_) => ErrorCategory::Serialization,
            AppError::Analytics(_) => ErrorCategory::Analytics,
            AppError::NotFound { .. } => ErrorCategory::NotFound,
            AppError::Internal(_) => ErrorCategory::Internal,
            AppError::RateLimitExceeded => ErrorCategory::RateLimit,
            AppError::BadRequest(_) => ErrorCategory::BadRequest,
            AppError::Conflict(_) => ErrorCategory::Conflict,
        }
    }

    /// HTTP status code for this error — used by `ResponseError`.
    pub fn status_code(&self) -> u16 {
        match self {
            AppError::Auth(AuthError::Unauthorized(_)) => 401,
            AppError::Auth(AuthError::TokenExpired) => 401,
            AppError::Auth(AuthError::InvalidToken) => 401,
            AppError::Auth(AuthError::Forbidden(_)) => 403,
            AppError::Auth(AuthError::CsrfMismatch) => 403,
            AppError::Validation(_) => 422,
            AppError::NotFound { .. } => 404,
            AppError::RateLimitExceeded => 429,
            AppError::BadRequest(_) => 400,
            AppError::Conflict(_) => 409,
            AppError::Contract(ContractError::Unauthorized(_)) => 403,
            AppError::Contract(ContractError::NotFound(_)) => 404,
            AppError::Contract(ContractError::InsufficientBalance { .. }) => 402,
            _ => 500,
        }
    }

    /// Stable dot-separated error code, e.g. `auth.unauthorized`.
    pub fn code(&self) -> String {
        match self {
            AppError::Auth(e) => format!("auth.{}", auth_code(e)),
            AppError::Validation(e) => format!("validation.{}", validation_code(e)),
            AppError::Export(e) => format!("export.{}", export_code(e)),
            AppError::Email(e) => format!("email.{}", email_code(e)),
            AppError::Storage(e) => format!("storage.{}", storage_code(e)),
            AppError::Contract(e) => format!("contract.{}", contract_code(e)),
            AppError::Webhook(e) => format!("webhook.{}", webhook_code(e)),
            AppError::Notification(e) => format!("notification.{}", notification_code(e)),
            AppError::Serialization(e) => format!("serialization.{}", serialization_code(e)),
            AppError::Analytics(e) => format!("analytics.{}", analytics_code(e)),
            AppError::NotFound { resource, .. } => format!("not_found.{resource}"),
            AppError::Internal(_) => "internal".to_string(),
            AppError::RateLimitExceeded => "rate_limit.exceeded".to_string(),
            AppError::BadRequest(_) => "bad_request".to_string(),
            AppError::Conflict(_) => "conflict".to_string(),
        }
    }

    /// True when the error is caused by the caller (4xx) vs the system (5xx).
    pub fn is_client_error(&self) -> bool {
        self.status_code() < 500
    }
}

fn auth_code(e: &AuthError) -> &'static str {
    match e {
        AuthError::Unauthorized(_) => "unauthorized",
        AuthError::Forbidden(_) => "forbidden",
        AuthError::TokenExpired => "token_expired",
        AuthError::InvalidToken => "invalid_token",
        AuthError::CsrfMismatch => "csrf_mismatch",
    }
}

fn validation_code(e: &ValidationError) -> &'static str {
    match e {
        ValidationError::Field { .. } => "field_error",
        ValidationError::Multiple(_) => "multiple_errors",
        ValidationError::Format { .. } => "format_error",
    }
}

fn export_code(e: &ExportError) -> &'static str {
    match e {
        ExportError::Csv(_) => "csv_error",
        ExportError::Json(_) => "json_error",
        ExportError::Pdf(_) => "pdf_error",
        ExportError::Serialization(_) => "serialization_error",
        ExportError::InvalidFormat(_) => "invalid_format",
    }
}

fn email_code(e: &EmailError) -> &'static str {
    match e {
        EmailError::Service(_) => "service_error",
        EmailError::Template(_) => "template_error",
        EmailError::InvalidAddress(_) => "invalid_address",
        EmailError::Delivery(_) => "delivery_failed",
    }
}

fn storage_code(e: &StorageError) -> &'static str {
    match e {
        StorageError::Service(_) => "service_error",
        StorageError::InvalidFile(_) => "invalid_file",
        StorageError::NotFound(_) => "not_found",
        StorageError::UploadFailed(_) => "upload_failed",
        StorageError::QuotaExceeded => "quota_exceeded",
    }
}

fn contract_code(e: &ContractError) -> &'static str {
    match e {
        ContractError::CallFailed(_) => "call_failed",
        ContractError::NotFound(_) => "not_found",
        ContractError::InvalidState(_) => "invalid_state",
        ContractError::InsufficientBalance { .. } => "insufficient_balance",
        ContractError::Unauthorized(_) => "unauthorized",
    }
}

fn webhook_code(e: &WebhookError) -> &'static str {
    match e {
        WebhookError::DeliveryFailed(_) => "delivery_failed",
        WebhookError::InvalidUrl(_) => "invalid_url",
        WebhookError::NotFound(_) => "not_found",
        WebhookError::SignatureMismatch => "signature_mismatch",
    }
}

fn notification_code(e: &NotificationError) -> &'static str {
    match e {
        NotificationError::PushFailed(_) => "push_failed",
        NotificationError::InvalidToken(_) => "invalid_token",
        NotificationError::ServiceUnavailable(_) => "service_unavailable",
    }
}

fn serialization_code(e: &SerializationError) -> &'static str {
    match e {
        SerializationError::Json(_) => "json_error",
        SerializationError::Csv(_) => "csv_error",
        SerializationError::Decode(_) => "decode_error",
    }
}

fn analytics_code(e: &AnalyticsError) -> &'static str {
    match e {
        AnalyticsError::ComputationFailed(_) => "computation_failed",
        AnalyticsError::InvalidTimeRange(_) => "invalid_time_range",
        AnalyticsError::DataSourceUnavailable(_) => "data_source_unavailable",
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn from_auth_error_sets_category_and_status() {
        let err: AppError = AuthError::Unauthorized("nope".into()).into();
        assert_eq!(err.category(), ErrorCategory::Auth);
        assert_eq!(err.status_code(), 401);
        assert_eq!(err.code(), "auth.unauthorized");
        assert!(err.is_client_error());
    }

    #[test]
    fn from_validation_error_maps_to_422() {
        let err: AppError = ValidationError::Field {
            field: "email".into(),
            message: "invalid".into(),
        }
        .into();
        assert_eq!(err.category(), ErrorCategory::Validation);
        assert_eq!(err.status_code(), 422);
        assert_eq!(err.code(), "validation.field_error");
        assert!(err.is_client_error());
    }

    #[test]
    fn from_export_error_maps_to_500() {
        let err: AppError = ExportError::Csv("boom".into()).into();
        assert_eq!(err.category(), ErrorCategory::Export);
        assert_eq!(err.status_code(), 500);
        assert_eq!(err.code(), "export.csv_error");
        assert!(!err.is_client_error());
    }

    #[test]
    fn from_email_error_maps_to_500() {
        let err: AppError = EmailError::Delivery("boom".into()).into();
        assert_eq!(err.category(), ErrorCategory::Email);
        assert_eq!(err.status_code(), 500);
        assert_eq!(err.code(), "email.delivery_failed");
    }

    #[test]
    fn from_storage_error_maps_to_500() {
        let err: AppError = StorageError::QuotaExceeded.into();
        assert_eq!(err.category(), ErrorCategory::Storage);
        assert_eq!(err.status_code(), 500);
        assert_eq!(err.code(), "storage.quota_exceeded");
    }

    #[test]
    fn from_contract_error_maps_statuses() {
        let unauthorized: AppError = ContractError::Unauthorized("x".into()).into();
        assert_eq!(unauthorized.status_code(), 403);
        assert_eq!(unauthorized.code(), "contract.unauthorized");

        let not_found: AppError = ContractError::NotFound("x".into()).into();
        assert_eq!(not_found.status_code(), 404);
        assert_eq!(not_found.code(), "contract.not_found");

        let balance: AppError = ContractError::InsufficientBalance {
            required: 10,
            available: 5,
        }
        .into();
        assert_eq!(balance.status_code(), 402);
        assert_eq!(balance.code(), "contract.insufficient_balance");
    }

    #[test]
    fn from_webhook_error_maps_to_500() {
        let err: AppError = WebhookError::SignatureMismatch.into();
        assert_eq!(err.category(), ErrorCategory::Webhook);
        assert_eq!(err.status_code(), 500);
        assert_eq!(err.code(), "webhook.signature_mismatch");
    }

    #[test]
    fn from_notification_error_maps_to_500() {
        let err: AppError = NotificationError::PushFailed("x".into()).into();
        assert_eq!(err.category(), ErrorCategory::Notification);
        assert_eq!(err.status_code(), 500);
        assert_eq!(err.code(), "notification.push_failed");
    }

    #[test]
    fn from_serialization_error_maps_to_500() {
        let err: AppError = SerializationError::Decode("x".into()).into();
        assert_eq!(err.category(), ErrorCategory::Serialization);
        assert_eq!(err.status_code(), 500);
        assert_eq!(err.code(), "serialization.decode_error");
    }

    #[test]
    fn from_analytics_error_maps_to_500() {
        let err: AppError = AnalyticsError::InvalidTimeRange("x".into()).into();
        assert_eq!(err.category(), ErrorCategory::Analytics);
        assert_eq!(err.status_code(), 500);
        assert_eq!(err.code(), "analytics.invalid_time_range");
    }

    #[test]
    fn not_found_status_and_code() {
        let err = AppError::NotFound {
            resource: "user",
            id: "42".into(),
        };
        assert_eq!(err.category(), ErrorCategory::NotFound);
        assert_eq!(err.status_code(), 404);
        assert_eq!(err.code(), "not_found.user");
        assert!(err.is_client_error());
    }

    #[test]
    fn internal_status_and_code() {
        let err = AppError::Internal("boom".into());
        assert_eq!(err.category(), ErrorCategory::Internal);
        assert_eq!(err.status_code(), 500);
        assert_eq!(err.code(), "internal");
        assert!(!err.is_client_error());
    }

    #[test]
    fn rate_limit_status_and_code() {
        let err = AppError::RateLimitExceeded;
        assert_eq!(err.category(), ErrorCategory::RateLimit);
        assert_eq!(err.status_code(), 429);
        assert_eq!(err.code(), "rate_limit.exceeded");
        assert!(err.is_client_error());
    }

    #[test]
    fn bad_request_status_and_code() {
        let err = AppError::BadRequest("bad".into());
        assert_eq!(err.category(), ErrorCategory::BadRequest);
        assert_eq!(err.status_code(), 400);
        assert_eq!(err.code(), "bad_request");
        assert!(err.is_client_error());
    }

    #[test]
    fn conflict_status_and_code() {
        let err = AppError::Conflict("duplicate".into());
        assert_eq!(err.category(), ErrorCategory::Conflict);
        assert_eq!(err.status_code(), 409);
        assert_eq!(err.code(), "conflict");
        assert!(err.is_client_error());
    }

    #[test]
    fn from_anyhow_wraps_as_internal() {
        let err: AppError = anyhow::anyhow!("kaboom").into();
        assert_eq!(err.category(), ErrorCategory::Internal);
        assert_eq!(err.status_code(), 500);
        assert_eq!(err.code(), "internal");
        assert!(err.to_string().contains("kaboom"));
    }

    #[test]
    fn from_anyhow_preserves_typed_app_error() {
        let original = AppError::BadRequest("bad".into());
        let wrapped: anyhow::Error = original.into();
        let err: AppError = wrapped.into();
        assert_eq!(err.category(), ErrorCategory::BadRequest);
        assert_eq!(err.status_code(), 400);
        assert_eq!(err.code(), "bad_request");
    }

    #[test]
    fn from_serde_json_error_maps_to_serialization() {
        let json_err = serde_json::from_str::<serde_json::Value>("{").unwrap_err();
        let err: AppError = json_err.into();
        assert_eq!(err.category(), ErrorCategory::Serialization);
        assert_eq!(err.status_code(), 500);
        assert_eq!(err.code(), "serialization.json_error");
    }

    #[test]
    fn display_includes_variant_context() {
        let err = AppError::NotFound {
            resource: "user",
            id: "7".into(),
        };
        assert!(err.to_string().contains("user"));
        assert!(err.to_string().contains('7'));
    }
}
