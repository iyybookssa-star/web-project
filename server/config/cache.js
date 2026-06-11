const NodeCache = require("node-cache");

// Single shared cache instance
// stdTTL  = default time-to-live in seconds (5 minutes)
// checkperiod = interval (in seconds) to auto-delete expired entries
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Express middleware that caches JSON responses.
 * @param {string} prefix - Cache key prefix (e.g. 'products', 'admin-stats')
 * @param {number} [ttl]  - Optional custom TTL in seconds (overrides default)
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (prefix, ttl) => {
  return (req, res, next) => {
    const key = `${prefix}:${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached) {
      res.set("X-Cache", "HIT");
      return res.json(cached);
    }

    // Monkey-patch res.json to intercept the response and store it
    res.set("X-Cache", "MISS");
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body, ttl); // ttl=undefined uses stdTTL
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * Invalidate all cache entries whose key starts with the given prefix.
 * @param {string} prefix - The prefix to match (e.g. 'products', 'admin-stats')
 */
const invalidateCache = (prefix) => {
  const keys = cache.keys().filter((k) => k.startsWith(`${prefix}:`));
  if (keys.length > 0) {
    cache.del(keys);
  }
};

module.exports = { cache, cacheMiddleware, invalidateCache };
