'use strict';

const {InMemoryLRUCache} = require('apollo-server-caching');

/**
 * SOAP Cache utility
 *
 * SOAP is sent as HTTP POST and its a non-idempotent. Thus it can not be cached
 * at HTTP level.
 *
 * This[1] is draft verison of document for response caching for SOAP, but did
 * not found any implementaion of it.
 *
 * Thus it make sense to client decide to cache it or not and for much duration.
 *
 * [1]: https://lists.w3.org/Archives/Public/www-ws/2001Aug/att-0000/ResponseCache.html
 */
class SOAPCache {
  /**
   * A constructor
   *
   * @param {Object} keyValueCache a cache object from apollo server en
   */
  constructor(keyValueCache) {
    this.keyValueCache = keyValueCache;
    if (!this.keyValueCache) {
      this.keyValueCache = new InMemoryLRUCache();
    }
  }

  /**
   * Get the cached value from cache by key
   *
   * @param {String} key a cache key
   * @return {Object} a value of the cached object
   *
   */
  async get(key) {
    const entry = await this.keyValueCache.get('soapcache:' + key);
    if (entry) {
      return entry;
    }
    return null;
  }

  /**
   * Put value to be cached with the key
   *
   * @param {String} key a cache key
   * @param {Object} value the value to be cached
   * @param {Integer} ttl the ttl value in seconds
   *
   */
  async put(key, value, ttl) {
    if (ttl > 0) {
      await this.keyValueCache.set('soapcache:' + key, value, {
        ttl,
      });
    }
  }
}

module.exports = SOAPCache;
