use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpResponse,
};
use futures::future::LocalBoxFuture;
use serde_json::Value;

use crate::errors::AppError;

const MAX_BODY_BYTES: usize = 1_048_576; // 1 MB

/// A single field-level validation failure, mirroring a zod issue.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ValidationIssue {
    pub path: String,
    pub message: String,
}

impl ValidationIssue {
    pub fn new(path: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            path: path.into(),
            message: message.into(),
        }
    }
}

/// Minimal zod-style schema abstraction used to validate request payloads.
pub trait Schema: Send + Sync {
    /// Validate a JSON value, returning all issues found (empty when valid).
    fn validate(&self, value: &Value) -> Vec<ValidationIssue>;
}

/// Validates that a value is a JSON object.
pub struct ObjectSchema;

impl Schema for ObjectSchema {
    fn validate(&self, value: &Value) -> Vec<ValidationIssue> {
        if value.is_object() {
            Vec::new()
        } else {
            vec![ValidationIssue::new("", "expected an object")]
        }
    }
}

/// Validates that a value is a string.
pub struct StringSchema;

impl Schema for StringSchema {
    fn validate(&self, value: &Value) -> Vec<ValidationIssue> {
        if value.is_string() {
            Vec::new()
        } else {
            vec![ValidationIssue::new("", "expected a string")]
        }
    }
}

/// Validates that a value is a number.
pub struct NumberSchema;

impl Schema for NumberSchema {
    fn validate(&self, value: &Value) -> Vec<ValidationIssue> {
        if value.is_number() {
            Vec::new()
        } else {
            vec![ValidationIssue::new("", "expected a number")]
        }
    }
}

/// Validates that a value is a boolean.
pub struct BooleanSchema;

impl Schema for BooleanSchema {
    fn validate(&self, value: &Value) -> Vec<ValidationIssue> {
        if value.is_boolean() {
            Vec::new()
        } else {
            vec![ValidationIssue::new("", "expected a boolean")]
        }
    }
}

/// Validates an object against a set of required/optional field schemas.
pub struct FieldedObjectSchema {
    fields: Vec<(String, Box<dyn Schema>, bool)>,
}

impl FieldedObjectSchema {
    pub fn new() -> Self {
        Self { fields: Vec::new() }
    }

    pub fn required(mut self, name: impl Into<String>, schema: Box<dyn Schema>) -> Self {
        self.fields.push((name.into(), schema, true));
        self
    }

    pub fn optional(mut self, name: impl Into<String>, schema: Box<dyn Schema>) -> Self {
        self.fields.push((name.into(), schema, false));
        self
    }
}

impl Default for FieldedObjectSchema {
    fn default() -> Self {
        Self::new()
    }
}

impl Schema for FieldedObjectSchema {
    fn validate(&self, value: &Value) -> Vec<ValidationIssue> {
        let Some(obj) = value.as_object() else {
            return vec![ValidationIssue::new("", "expected an object")];
        };

        let mut issues = Vec::new();
        for (name, schema, required) in &self.fields {
            match obj.get(name) {
                Some(field_value) => {
                    for mut issue in schema.validate(field_value) {
                        issue.path = if issue.path.is_empty() {
                            name.clone()
                        } else {
                            format!("{}.{}", name, issue.path)
                        };
                        issues.push(issue);
                    }
                }
                None if *required => {
                    issues.push(ValidationIssue::new(name.clone(), "is required"));
                }
                None => {}
            }
        }
        issues
    }
}

/// Which part of the request a schema applies to.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ValidationTarget {
    Body,
    Query,
    Params,
}

/// Convert validation issues into a typed `AppError::Validation`.
pub fn issues_to_error(issues: Vec<ValidationIssue>) -> AppError {
    let details: Vec<Value> = issues
        .into_iter()
        .map(|issue| serde_json::json!({ "path": issue.path, "message": issue.message }))
        .collect();
    AppError::Validation(details)
}

/// Validate a JSON value against a schema, returning a typed error on failure.
pub fn validate_value(schema: &dyn Schema, value: &Value) -> Result<(), AppError> {
    let issues = schema.validate(value);
    if issues.is_empty() {
        Ok(())
    } else {
        Err(issues_to_error(issues))
    }
}

/// Parse a raw query string into a JSON object for schema validation.
pub fn parse_query(query: &str) -> Value {
    let mut map = serde_json::Map::new();
    for pair in query.split('&').filter(|p| !p.is_empty()) {
        let mut parts = pair.splitn(2, '=');
        let key = parts.next().unwrap_or("");
        let raw = parts.next().unwrap_or("");
        let decoded = percent_decode(raw);
        map.insert(key.to_string(), Value::String(decoded));
    }
    Value::Object(map)
}

fn percent_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'%' if i + 2 < bytes.len() => {
                let hex = &input[i + 1..i + 3];
                if let Ok(byte) = u8::from_str_radix(hex, 16) {
                    out.push(byte);
                    i += 3;
                    continue;
                }
                out.push(bytes[i]);
                i += 1;
            }
            b'+' => {
                out.push(b' ');
                i += 1;
            }
            b => {
                out.push(b);
                i += 1;
            }
        }
    }
    String::from_utf8_lossy(&out).into_owned()
}

/// Validate a request payload against a schema for the given target.
pub fn validate_request(
    target: ValidationTarget,
    schema: &dyn Schema,
    body: Option<&Value>,
    query: Option<&str>,
    params: Option<&Value>,
) -> Result<(), AppError> {
    let value = match target {
        ValidationTarget::Body => body.cloned().unwrap_or(Value::Null),
        ValidationTarget::Query => parse_query(query.unwrap_or("")),
        ValidationTarget::Params => params.cloned().unwrap_or(Value::Null),
    };
    validate_value(schema, &value)
}

pub struct ValidationMiddleware;

impl<S, B> Transform<S, ServiceRequest> for ValidationMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = ValidationMiddlewareService<S>;
    type Future = std::future::Ready<Result<Self::Transform, Self::InitError>>;

    fn new_service(&self, service: S) -> Self::Future {
        std::future::ready(Ok(ValidationMiddlewareService { service }))
    }
}

pub struct ValidationMiddlewareService<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for ValidationMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let method = req.method().clone();
        let needs_content_type = matches!(method.as_str(), "POST" | "PUT" | "PATCH");

        if needs_content_type {
            let content_type = req
                .headers()
                .get("content-type")
                .and_then(|v| v.to_str().ok())
                .unwrap_or("");

            if !content_type.starts_with("application/json") {
                let (req, _) = req.into_parts();
                let response = HttpResponse::UnsupportedMediaType()
                    .json(serde_json::json!({ "error": "Content-Type must be application/json" }));
                return Box::pin(async move { Ok(ServiceResponse::new(req, response).map_into_right_body()) });
            }

            if let Some(length) = req
                .headers()
                .get("content-length")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.parse::<usize>().ok())
            {
                if length > MAX_BODY_BYTES {
                    let (req, _) = req.into_parts();
                    let response = HttpResponse::PayloadTooLarge()
                        .json(serde_json::json!({ "error": "Request body must not exceed 1MB" }));
                    return Box::pin(async move { Ok(ServiceResponse::new(req, response).map_into_right_body()) });
                }
            }
        }

        let fut = self.service.call(req);
        Box::pin(async move { fut.await })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn user_schema() -> FieldedObjectSchema {
        FieldedObjectSchema::new()
            .required("name", Box::new(StringSchema))
            .required("age", Box::new(NumberSchema))
            .optional("active", Box::new(BooleanSchema))
    }

    #[test]
    fn valid_body_passes() {
        let body = serde_json::json!({ "name": "Ada", "age": 36 });
        assert!(validate_value(&user_schema(), &body).is_ok());
    }

    #[test]
    fn missing_required_field_fails() {
        let body = serde_json::json!({ "name": "Ada" });
        let err = validate_value(&user_schema(), &body).unwrap_err();
        match err {
            AppError::Validation(details) => {
                assert_eq!(details.len(), 1);
                assert_eq!(details[0]["path"], "age");
            }
            other => panic!("expected validation error, got {:?}", other),
        }
    }

    #[test]
    fn wrong_type_fails_with_path() {
        let body = serde_json::json!({ "name": "Ada", "age": "old" });
        let err = validate_value(&user_schema(), &body).unwrap_err();
        match err {
            AppError::Validation(details) => {
                assert_eq!(details[0]["path"], "age");
                assert_eq!(details[0]["message"], "expected a number");
            }
            other => panic!("expected validation error, got {:?}", other),
        }
    }

    #[test]
    fn non_object_body_fails() {
        let body = serde_json::json!("not-an-object");
        assert!(validate_value(&user_schema(), &body).is_err());
    }

    #[test]
    fn query_parsing_and_validation() {
        let schema = FieldedObjectSchema::new().required("limit", Box::new(StringSchema));
        let query = "limit=10&offset=5";
        assert!(validate_request(ValidationTarget::Query, &schema, None, Some(query), None).is_ok());

        let missing = "offset=5";
        assert!(validate_request(ValidationTarget::Query, &schema, None, Some(missing), None).is_err());
    }

    #[test]
    fn query_percent_decoding() {
        let parsed = parse_query("q=hello%20world&x=a+b");
        assert_eq!(parsed["q"], "hello world");
        assert_eq!(parsed["x"], "a b");
    }

    #[test]
    fn params_validation() {
        let schema = FieldedObjectSchema::new().required("id", Box::new(StringSchema));
        let params = serde_json::json!({ "id": "42" });
        assert!(validate_request(ValidationTarget::Params, &schema, None, None, Some(&params)).is_ok());
    }
}
