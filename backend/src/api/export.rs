//! Export API endpoints for data export functionality
//! 
//! This module provides endpoints for exporting various data types
//! in different formats (CSV, JSON).
//! 
//! Note: Legacy formats have been removed as part of #1077.
//! Active formats: CSV, JSON.

use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};
use chrono::Utc;

use crate::{
    cache::Cache,
    services::api::ApiBuilder,
    services::export::ExportService,
    validation::{error_response, validate_date_range, validate_export_format, validate_pagination, ValidationError},
};

// ============================================
# Types
// ============================================

/// Export format options
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ExportFormat {
    Csv,
    Json,
    // Removed: Excel, XML, PDF (legacy formats, no active usage)
}

/// Export request parameters
#[derive(Debug, Clone, Deserialize)]
pub struct ExportQuery {
    pub format: ExportFormat,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub limit: Option<u32>,
}

/// Export request body
#[derive(Debug, Clone, Deserialize)]
pub struct ExportRequest {
    pub format: String,
    pub data_type: String,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
}

/// Export response
#[derive(Debug, Serialize)]
pub struct ExportResponse {
    pub id: String,
    pub format: String,
    pub data_type: String,
    pub status: String,
    pub file_size: Option<u64>,
    pub created_at: String,
    pub expires_at: String,
}

/// Export list query
#[derive(Debug, Clone, Deserialize)]
pub struct ExportListQuery {
    pub page: Option<u32>,
    pub limit: Option<u32>,
}

// ============================================
# Endpoint Handlers
// ============================================

/// Export data
/// 
/// POST /api/export
/// Body: { format, data_type, start_date, end_date }
pub async fn export_data(
    cache: web::Data<Cache>,
    body: web::Json<ExportRequest>,
) -> HttpResponse {
    let mut errors = Vec::new();

    if let Some(ref err) = validate_export_format(&body.format) {
        errors.push(err.clone());
    }
    if body.data_type.trim().is_empty() {
        errors.push(ValidationError {
            field: "data_type".to_string(),
            message: "data_type is required".to_string(),
        });
    }
    if let (Some(ref start), Some(ref end)) = (&body.start_date, &body.end_date) {
        errors.extend(validate_date_range(start, end));
    }

    if !errors.is_empty() {
        return error_response(&errors);
    }

    let export_id = uuid::Uuid::new_v4().to_string();
    let format = body.format.to_lowercase();

    let sample_data = vec![
        crate::services::export::ExportData {
            id: "waste-001".to_string(),
            waste_type: "plastic".to_string(),
            weight: 100,
            status: "pending".to_string(),
            created_at: Utc::now().to_rfc3339(),
        },
        crate::services::export::ExportData {
            id: "waste-002".to_string(),
            waste_type: "metal".to_string(),
            weight: 250,
            status: "approved".to_string(),
            created_at: Utc::now().to_rfc3339(),
        },
    ];

    let content_bytes = match format.as_str() {
        "csv" => ExportService::export_to_csv(sample_data).map(|s| s.into_bytes()),
        "json" => ExportService::export_to_json(sample_data).map(|s| s.into_bytes()),
        // PDF removed (legacy format)
        _ => unreachable!(),
    };

    match content_bytes {
        Ok(bytes) => {
            let cache_key = format!("export:{}", export_id);
            cache.set(cache_key, bytes);

            let response = ExportResponse {
                id: export_id,
                format: format.clone(),
                data_type: body.data_type.clone(),
                status: "completed".to_string(),
                file_size: None,
                created_at: Utc::now().to_rfc3339(),
                expires_at: (Utc::now() + chrono::Duration::hours(24)).to_rfc3339(),
            };

            HttpResponse::Ok().json(ApiBuilder::success_response(response))
        }
        Err(e) => HttpResponse::InternalServerError()
            .json(ApiBuilder::error_response::<String>(format!("Export failed: {}", e))),
    }
}

/// Download export
/// 
/// GET /api/export/{export_id}
pub async fn download_export(
    cache: web::Data<Cache>,
    path: web::Path<String>,
) -> HttpResponse {
    let export_id = path.into_inner();
    let cache_key = format!("export:{}", export_id);

    match cache.get(&cache_key) {
        Some(data) => HttpResponse::Ok()
            .insert_header(("Content-Type", "application/octet-stream"))
            .insert_header((
                "Content-Disposition",
                format!("attachment; filename=\"{}.csv\"", export_id),
            ))
            .body(data),
        None => HttpResponse::NotFound().json(ApiBuilder::error_response::<String>("Export not found or expired")),
    }
}

/// List exports
/// 
/// GET /api/exports
/// Query: page, limit
pub async fn list_exports(query: web::Query<ExportListQuery>) -> HttpResponse {
    let page = query.page.unwrap_or(1);
    let limit = query.limit.unwrap_or(20);

    let errors = validate_pagination(page, limit);
    if !errors.is_empty() {
        return error_response(&errors);
    }

    // Export history persistence is not yet implemented; return an empty page.
    let items: Vec<ExportResponse> = Vec::new();
    let total = items.len() as u64;
    let response = serde_json::json!({
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
    });
    HttpResponse::Ok().json(ApiBuilder::success_response(response))
}

// ============================================
# Route Registration
// ============================================

/// Configure export routes
pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/export", web::post().to(export_data))
            .route("/export/{export_id}", web::get().to(download_export))
            .route("/exports", web::get().to(list_exports))
    );
}

// ============================================
# Changelog
// ============================================

///
/// # Changelog - Export Endpoints
/// 
/// ## Removed (Issue #1077)
/// - `GET /api/export/excel` - Legacy Excel format (no active usage)
/// - `GET /api/export/xml` - Legacy XML format (no active usage)
/// - `GET /api/export/pdf` - Legacy PDF format (no active usage)
/// - `GET /api/export/legacy` - Legacy endpoint (no active usage)
/// 
/// ## Removed (Issue #1700)
/// - `POST /api/export/send-email` - Unused email export handler (referenced
///   undefined `EmailService`/`TransactionalEmail` types; never functional)
/// - `POST /api/export/schedule` - Unused scheduled export stub (no persistence)
/// - `DELETE /api/export/schedule/{id}` - Unused scheduled export deletion stub
/// 
/// ## Kept (Active)
/// - `POST /api/export` - CSV and JSON formats
/// - `GET /api/export/{id}` - Download export
/// - `GET /api/exports` - List exports
/// 
/// ## Migration
/// Clients should migrate to the active endpoints:
/// - Use `format=csv` for CSV data
/// - Use `format=json` for JSON data
/// 
/// ## Date
/// 2024-01-15: Legacy endpoints removed
/// 2024-02-01: Unused/deprecated handlers removed (#1700)
///

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_export_format_serialization() {
        let format = ExportFormat::Csv;
        let json = serde_json::to_string(&format).unwrap();
        assert_eq!(json, "\"csv\"");
    }

    #[test]
    fn test_export_response_serialization() {
        let response = ExportResponse {
            id: "test-123".to_string(),
            format: "csv".to_string(),
            data_type: "waste".to_string(),
            status: "completed".to_string(),
            file_size: Some(1024),
            created_at: Utc::now().to_rfc3339(),
            expires_at: (Utc::now() + chrono::Duration::hours(24)).to_rfc3339(),
        };
        let json = serde_json::to_value(&response).unwrap();
        assert!(json.get("id").is_some());
        assert!(json.get("format").is_some());
        assert!(json.get("data_type").is_some());
    }

    #[test]
    fn test_export_format_deserialization() {
        let json = "\"csv\"";
        let format: ExportFormat = serde_json::from_str(json).unwrap();
        match format {
            ExportFormat::Csv => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn test_invalid_format_deserialization() {
        let json = "\"xml\"";
        let result: Result<ExportFormat, _> = serde_json::from_str(json);
        assert!(result.is_err());
    }

    #[test]
    fn test_export_list_query_defaults() {
        let query: ExportListQuery = serde_json::from_str("{}").unwrap();
        assert!(query.page.is_none());
        assert!(query.limit.is_none());
    }

    #[test]
    fn test_export_list_query_values() {
        let query: ExportListQuery = serde_json::from_str(r#"{"page":2,"limit":50}"#).unwrap();
        assert_eq!(query.page, Some(2));
        assert_eq!(query.limit, Some(50));
    }

    #[test]
    fn test_export_request_deserialization() {
        let request: ExportRequest = serde_json::from_str(
            r#"{"format":"csv","data_type":"waste"}"#,
        )
        .unwrap();
        assert_eq!(request.format, "csv");
        assert_eq!(request.data_type, "waste");
        assert!(request.start_date.is_none());
        assert!(request.end_date.is_none());
    }
}