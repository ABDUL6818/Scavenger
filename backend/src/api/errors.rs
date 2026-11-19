//! Error envelope for API responses. Every error response uses `ApiError` from this module, so the
//! JSON shape and status mapping are defined in one place.
//!
//! `ApiError` is now a thin wrapper around the canonical [`crate::errors::AppError`] (issue #1698).
//! The wire format and HTTP status mapping are unchanged for backward compatibility.

use crate::errors::AppError;
use actix_web::{HttpResponse, ResponseError};
use serde::{Deserialize, Serialize};
use std::fmt;

/// Wire-format error envelope returned for every non-2xx API response.
#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorBody {
    pub error: ErrorDetail,
}

/// Detailed error information inside the envelope.
#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorDetail {
    /// Machine-readable error code (e.g. `"VALIDATION_ERROR"`).
    pub code: String,
    /// Human-readable description safe to present in a UI.
    pub message: String,
    /// Unique identifier that can be correlated with server logs.
    pub request_id: String,
}

/// Shared API error type (issue #1073, standardized on [`AppError`] in #1698).
///
/// Every handler in `backend/src/api/**` returns `Result<_, ApiError>`.
/// `ApiError` maps to a consistent JSON response body so clients always
/// receive the same shape regardless of which module raised the error:
///
/// ```json
/// {
///   "error": {
///     "code": "VALIDATION_ERROR",
///     "message": "quantity_kg must be positive",
///     "request_id": "a1b2c3d4-..."
///   }
/// }
/// ```
///
/// ## HTTP status mapping
///
/// | Variant          | HTTP status |
/// |-----------------|-------------|
/// | `Validation`    | 400         |
/// | `Unauthorized`  | 401         |
/// | `Forbidden`     | 403         |
/// | `NotFound`      | 404         |
/// | `Conflict`      | 409         |
/// | `Internal`      | 500         |
#[derive(Debug)]
pub struct ApiError(pub AppError);

impl ApiError {
    /// Shorthand constructors so handlers avoid repeating `ApiError::Validation(...)`.
    pub fn validation(msg: impl Into<String>) -> Self {
        ApiError(AppError::Validation(msg.into()))
    }
    pub fn unauthorized(msg: impl Into<String>) -> Self {
        ApiError(AppError::Unauthorized(msg.into()))
    }
    pub fn forbidden(msg: impl Into<String>) -> Self {
        ApiError(AppError::Forbidden(msg.into()))
    }
    pub fn not_found(msg: impl Into<String>) -> Self {
        ApiError(AppError::NotFound(msg.into()))
    }
    pub fn conflict(msg: impl Into<String>) -> Self {
        ApiError(AppError::Conflict(msg.into()))
    }
    pub fn internal(msg: impl Into<String>) -> Self {
        ApiError(AppError::Internal(msg.into()))
    }

    /// Returns the machine-readable error code for this variant.
    pub fn code(&self) -> &'static str {
        self.0.code()
    }

    fn message(&self) -> &str {
        self.0.message()
    }

    fn build_body(&self) -> ErrorBody {
        ErrorBody {
            error: ErrorDetail {
                code: self.code().to_string(),
                message: self.message().to_string(),
                request_id: uuid::Uuid::new_v4().to_string(),
            },
        }
    }
}

impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.code(), self.message())
    }
}

impl ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        let body = self.build_body();
        match &self.0 {
            AppError::Validation(_) => HttpResponse::BadRequest().json(body),
            AppError::Unauthorized(_) => HttpResponse::Unauthorized().json(body),
            AppError::Forbidden(_) => HttpResponse::Forbidden().json(body),
            AppError::NotFound(_) => HttpResponse::NotFound().json(body),
            AppError::Conflict(_) => HttpResponse::Conflict().json(body),
            AppError::Internal(_) => HttpResponse::InternalServerError().json(body),
        }
    }
}

/// Allow handlers to convert the canonical `AppError` directly.
impl From<AppError> for ApiError {
    fn from(e: AppError) -> Self {
        ApiError(e)
    }
}

/// Allow services to propagate `anyhow::Error` into `ApiError::Internal`.
impl From<anyhow::Error> for ApiError {
    fn from(e: anyhow::Error) -> Self {
        ApiError(AppError::from(e))
    }
}

// ── Tests ──────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::body::MessageBody;

    #[test]
    fn test_validation_error_code() {
        let err = ApiError::validation("test message");
        assert_eq!(err.code(), "VALIDATION_ERROR");
    }

    #[test]
    fn test_not_found_error_code() {
        let err = ApiError::not_found("resource missing");
        assert_eq!(err.code(), "NOT_FOUND");
    }

    #[test]
    fn test_internal_error_code() {
        let err = ApiError::internal("db connection failed");
        assert_eq!(err.code(), "INTERNAL_SERVER_ERROR");
    }

    #[test]
    fn test_display_format() {
        let err = ApiError::validation("bad input");
        let s = format!("{}", err);
        assert!(s.contains("VALIDATION_ERROR"));
        assert!(s.contains("bad input"));
    }

    #[actix_web::test]
    async fn test_validation_returns_400() {
        let err = ApiError::validation("invalid request");
        let resp = err.error_response();
        assert_eq!(resp.status(), 400);
    }

    #[actix_web::test]
    async fn test_not_found_returns_404() {
        let err = ApiError::not_found("not found");
        let resp = err.error_response();
        assert_eq!(resp.status(), 404);
    }

    #[actix_web::test]
    async fn test_unauthorized_returns_401() {
        let err = ApiError::unauthorized("missing token");
        let resp = err.error_response();
        assert_eq!(resp.status(), 401);
    }

    #[actix_web::test]
    async fn test_forbidden_returns_403() {
        let err = ApiError::forbidden("access denied");
        let resp = err.error_response();
        assert_eq!(resp.status(), 403);
    }

    #[actix_web::test]
    async fn test_conflict_returns_409() {
        let err = ApiError::conflict("already exists");
        let resp = err.error_response();
        assert_eq!(resp.status(), 409);
    }

    #[actix_web::test]
    async fn test_internal_returns_500() {
        let err = ApiError::internal("something broke");
        let resp = err.error_response();
        assert_eq!(resp.status(), 500);
    }

    #[actix_web::test]
    async fn test_error_body_contains_code_and_message() {
        let err = ApiError::validation("missing field");
        let body = err.build_body();
        assert_eq!(body.error.code, "VALIDATION_ERROR");
        assert_eq!(body.error.message, "missing field");
        assert!(!body.error.request_id.is_empty());
    }

    #[test]
    fn test_from_anyhow() {
        let anyhow_err = anyhow::anyhow!("something went wrong");
        let api_err: ApiError = anyhow_err.into();
        assert_eq!(api_err.code(), "INTERNAL_SERVER_ERROR");
    }

    #[test]
    fn test_from_app_error() {
        let app_err = AppError::NotFound("gone".to_string());
        let api_err: ApiError = app_err.into();
        assert_eq!(api_err.code(), "NOT_FOUND");
        assert_eq!(api_err.message(), "gone");
    }

    #[test]
    fn test_wraps_app_error_variants() {
        assert_eq!(ApiError::from(AppError::Validation("v".into())).code(), "VALIDATION_ERROR");
        assert_eq!(ApiError::from(AppError::Unauthorized("u".into())).code(), "UNAUTHORIZED");
        assert_eq!(ApiError::from(AppError::Forbidden("f".into())).code(), "FORBIDDEN");
        assert_eq!(ApiError::from(AppError::Conflict("c".into())).code(), "CONFLICT");
        assert_eq!(ApiError::from(AppError::Internal("i".into())).code(), "INTERNAL_SERVER_ERROR");
    }
}
