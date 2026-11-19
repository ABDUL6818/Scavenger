use std::sync::Arc;

use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};

use crate::repositories::analytics_repository::{
    AnalyticsRepository, AnalyticsRepositoryError, EventCount, TimeSeriesPoint,
};

/// Errors that can occur in the analytics service layer.
#[derive(Debug, thiserror::Error)]
pub enum AnalyticsServiceError {
    #[error("repository error: {0}")]
    Repository(#[from] AnalyticsRepositoryError),
    #[error("invalid time range: {0}")]
    InvalidTimeRange(String),
    #[error("invalid granularity: {0}")]
    InvalidGranularity(String),
}

/// Supported aggregation granularities for time series queries.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Granularity {
    Hour,
    Day,
    Week,
}

impl Granularity {
    /// Parse a granularity from a string, returning a service error on failure.
    pub fn parse(value: &str) -> Result<Self, AnalyticsServiceError> {
        match value.to_ascii_lowercase().as_str() {
            "hour" => Ok(Granularity::Hour),
            "day" => Ok(Granularity::Day),
            "week" => Ok(Granularity::Week),
            other => Err(AnalyticsServiceError::InvalidGranularity(other.to_string())),
        }
    }

    /// Convert the granularity into a chrono duration bucket size.
    pub fn to_duration(self) -> Duration {
        match self {
            Granularity::Hour => Duration::hours(1),
            Granularity::Day => Duration::days(1),
            Granularity::Week => Duration::weeks(1),
        }
    }
}

/// A validated time range used for analytics queries.
#[derive(Debug, Clone, Copy)]
pub struct TimeRange {
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
}

impl TimeRange {
    /// Build and validate a time range.
    pub fn new(start: DateTime<Utc>, end: DateTime<Utc>) -> Result<Self, AnalyticsServiceError> {
        if end <= start {
            return Err(AnalyticsServiceError::InvalidTimeRange(
                "end must be after start".to_string(),
            ));
        }
        Ok(Self { start, end })
    }

    /// Build a time range covering the last `days` days ending now.
    pub fn last_days(days: i64) -> Result<Self, AnalyticsServiceError> {
        if days <= 0 {
            return Err(AnalyticsServiceError::InvalidTimeRange(
                "days must be positive".to_string(),
            ));
        }
        let end = Utc::now();
        let start = end - Duration::days(days);
        Self::new(start, end)
    }

    /// Duration covered by this range.
    pub fn duration(&self) -> Duration {
        self.end - self.start
    }
}

/// Aggregated summary returned to callers.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AnalyticsSummary {
    pub total_events: i64,
    pub unique_users: i64,
    pub top_events: Vec<EventCount>,
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
}

/// Service encapsulating analytics business logic.
pub struct AnalyticsService {
    repository: Arc<dyn AnalyticsRepository>,
}

impl AnalyticsService {
    /// Create a new analytics service backed by the given repository.
    pub fn new(repository: Arc<dyn AnalyticsRepository>) -> Self {
        Self { repository }
    }

    /// Compute a summary of analytics for the given time range.
    pub async fn get_summary(
        &self,
        range: TimeRange,
        top_limit: usize,
    ) -> Result<AnalyticsSummary, AnalyticsServiceError> {
        let total_events = self
            .repository
            .count_events(range.start, range.end)
            .await?;
        let unique_users = self
            .repository
            .count_unique_users(range.start, range.end)
            .await?;
        let top_events = self
            .repository
            .top_events(range.start, range.end, top_limit)
            .await?;

        Ok(AnalyticsSummary {
            total_events,
            unique_users,
            top_events,
            start: range.start,
            end: range.end,
        })
    }

    /// Retrieve a time series of event counts for the given range and granularity.
    pub async fn get_time_series(
        &self,
        range: TimeRange,
        granularity: Granularity,
        event_name: Option<String>,
    ) -> Result<Vec<TimeSeriesPoint>, AnalyticsServiceError> {
        let bucket = granularity.to_duration();
        if bucket > range.duration() {
            return Err(AnalyticsServiceError::InvalidTimeRange(
                "granularity bucket is larger than the requested range".to_string(),
            ));
        }

        let points = self
            .repository
            .time_series(range.start, range.end, bucket, event_name.as_deref())
            .await?;

        Ok(points)
    }

    /// Retrieve the top events within the given range.
    pub async fn get_top_events(
        &self,
        range: TimeRange,
        limit: usize,
    ) -> Result<Vec<EventCount>, AnalyticsServiceError> {
        let limit = limit.clamp(1, 100);
        let events = self
            .repository
            .top_events(range.start, range.end, limit)
            .await?;
        Ok(events)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    use async_trait::async_trait;
    use chrono::TimeZone;
    use std::sync::Mutex;

    /// A mock repository that records calls and returns canned data.
    struct MockAnalyticsRepository {
        total_events: i64,
        unique_users: i64,
        top_events: Vec<EventCount>,
        time_series: Vec<TimeSeriesPoint>,
        fail: bool,
        calls: Mutex<Vec<String>>,
    }

    impl MockAnalyticsRepository {
        fn new() -> Self {
            Self {
                total_events: 0,
                unique_users: 0,
                top_events: Vec::new(),
                time_series: Vec::new(),
                fail: false,
                calls: Mutex::new(Vec::new()),
            }
        }

        fn record(&self, call: &str) {
            self.calls.lock().unwrap().push(call.to_string());
        }

        fn calls(&self) -> Vec<String> {
            self.calls.lock().unwrap().clone()
        }
    }

    #[async_trait]
    impl AnalyticsRepository for MockAnalyticsRepository {
        async fn count_events(
            &self,
            _start: DateTime<Utc>,
            _end: DateTime<Utc>,
        ) -> Result<i64, AnalyticsRepositoryError> {
            self.record("count_events");
            if self.fail {
                return Err(AnalyticsRepositoryError::Database("boom".to_string()));
            }
            Ok(self.total_events)
        }

        async fn count_unique_users(
            &self,
            _start: DateTime<Utc>,
            _end: DateTime<Utc>,
        ) -> Result<i64, AnalyticsRepositoryError> {
            self.record("count_unique_users");
            if self.fail {
                return Err(AnalyticsRepositoryError::Database("boom".to_string()));
            }
            Ok(self.unique_users)
        }

        async fn top_events(
            &self,
            _start: DateTime<Utc>,
            _end: DateTime<Utc>,
            limit: usize,
        ) -> Result<Vec<EventCount>, AnalyticsRepositoryError> {
            self.record(&format!("top_events:{limit}"));
            if self.fail {
                return Err(AnalyticsRepositoryError::Database("boom".to_string()));
            }
            Ok(self.top_events.iter().take(limit).cloned().collect())
        }

        async fn time_series(
            &self,
            _start: DateTime<Utc>,
            _end: DateTime<Utc>,
            _bucket: Duration,
            _event_name: Option<&str>,
        ) -> Result<Vec<TimeSeriesPoint>, AnalyticsRepositoryError> {
            self.record("time_series");
            if self.fail {
                return Err(AnalyticsRepositoryError::Database("boom".to_string()));
            }
            Ok(self.time_series.clone())
        }
    }

    fn sample_range() -> TimeRange {
        let start = Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap();
        let end = Utc.with_ymd_and_hms(2024, 1, 8, 0, 0, 0).unwrap();
        TimeRange::new(start, end).unwrap()
    }

    #[test]
    fn time_range_rejects_inverted_bounds() {
        let start = Utc.with_ymd_and_hms(2024, 1, 8, 0, 0, 0).unwrap();
        let end = Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap();
        assert!(matches!(
            TimeRange::new(start, end),
            Err(AnalyticsServiceError::InvalidTimeRange(_))
        ));
    }

    #[test]
    fn time_range_last_days_rejects_non_positive() {
        assert!(matches!(
            TimeRange::last_days(0),
            Err(AnalyticsServiceError::InvalidTimeRange(_))
        ));
    }

    #[test]
    fn granularity_parse_accepts_known_values() {
        assert_eq!(Granularity::parse("hour").unwrap(), Granularity::Hour);
        assert_eq!(Granularity::parse("DAY").unwrap(), Granularity::Day);
        assert_eq!(Granularity::parse("Week").unwrap(), Granularity::Week);
    }

    #[test]
    fn granularity_parse_rejects_unknown() {
        assert!(matches!(
            Granularity::parse("minute"),
            Err(AnalyticsServiceError::InvalidGranularity(_))
        ));
    }

    #[tokio::test]
    async fn get_summary_aggregates_repository_data() {
        let mut repo = MockAnalyticsRepository::new();
        repo.total_events = 42;
        repo.unique_users = 7;
        repo.top_events = vec![
            EventCount {
                event_name: "signup".to_string(),
                count: 10,
            },
            EventCount {
                event_name: "login".to_string(),
                count: 5,
            },
        ];
        let repo = Arc::new(repo);
        let service = AnalyticsService::new(repo.clone());

        let summary = service.get_summary(sample_range(), 10).await.unwrap();

        assert_eq!(summary.total_events, 42);
        assert_eq!(summary.unique_users, 7);
        assert_eq!(summary.top_events.len(), 2);
        assert_eq!(
            repo.calls(),
            vec![
                "count_events".to_string(),
                "count_unique_users".to_string(),
                "top_events:10".to_string(),
            ]
        );
    }

    #[tokio::test]
    async fn get_summary_propagates_repository_errors() {
        let mut repo = MockAnalyticsRepository::new();
        repo.fail = true;
        let service = AnalyticsService::new(Arc::new(repo));

        let result = service.get_summary(sample_range(), 10).await;
        assert!(matches!(
            result,
            Err(AnalyticsServiceError::Repository(_))
        ));
    }

    #[tokio::test]
    async fn get_time_series_rejects_oversized_bucket() {
        let repo = Arc::new(MockAnalyticsRepository::new());
        let service = AnalyticsService::new(repo);

        let start = Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap();
        let end = Utc.with_ymd_and_hms(2024, 1, 1, 2, 0, 0).unwrap();
        let range = TimeRange::new(start, end).unwrap();

        let result = service
            .get_time_series(range, Granularity::Week, None)
            .await;
        assert!(matches!(
            result,
            Err(AnalyticsServiceError::InvalidTimeRange(_))
        ));
    }

    #[tokio::test]
    async fn get_time_series_returns_repository_points() {
        let mut repo = MockAnalyticsRepository::new();
        repo.time_series = vec![TimeSeriesPoint {
            timestamp: Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap(),
            count: 3,
        }];
        let repo = Arc::new(repo);
        let service = AnalyticsService::new(repo.clone());

        let points = service
            .get_time_series(sample_range(), Granularity::Day, Some("signup".to_string()))
            .await
            .unwrap();

        assert_eq!(points.len(), 1);
        assert_eq!(points[0].count, 3);
        assert_eq!(repo.calls(), vec!["time_series".to_string()]);
    }

    #[tokio::test]
    async fn get_top_events_clamps_limit() {
        let mut repo = MockAnalyticsRepository::new();
        repo.top_events = (0..150)
            .map(|i| EventCount {
                event_name: format!("event_{i}"),
                count: i as i64,
            })
            .collect();
        let repo = Arc::new(repo);
        let service = AnalyticsService::new(repo.clone());

        let events = service.get_top_events(sample_range(), 1000).await.unwrap();

        assert_eq!(events.len(), 100);
        assert_eq!(repo.calls(), vec!["top_events:100".to_string()]);
    }

    #[tokio::test]
    async fn get_top_events_enforces_minimum_limit() {
        let repo = Arc::new(MockAnalyticsRepository::new());
        let service = AnalyticsService::new(repo.clone());

        let _ = service.get_top_events(sample_range(), 0).await.unwrap();

        assert_eq!(repo.calls(), vec!["top_events:1".to_string()]);
    }
}