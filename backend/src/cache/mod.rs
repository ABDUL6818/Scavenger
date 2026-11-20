//! Cache layer (#1715).
//!
//! Values are stored through the `CacheBackend` implementations: `MemoryBackend`
//! (`cache/memory.rs`) and `RedisBackend` (`cache/redis.rs`). Invalidation and TTL
//! helpers sit on top of that, so callers do not depend on a single backend.

pub mod cache;
pub mod distributed;
pub mod invalidation;
pub mod ttl;
pub mod warming;

// Explicit re-exports to avoid name conflicts between cache::CacheMetrics
// and distributed::CacheMetrics (both define the same struct independently).
pub use cache::{Cache, CacheMetrics};
pub use distributed::{CacheWarmer as DistributedCacheWarmer, DistributedCache};
pub use invalidation::{
    CacheInvalidationManager, CacheWarmingStrategy, InvalidationEvent, InvalidationStrategy, InvalidationStrategyType,
};
pub use ttl::{keys as cache_keys, CacheTtl};
pub use warming::{CacheWarmer, WarmTask};
