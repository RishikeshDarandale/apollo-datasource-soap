'use strict';

import { InMemoryLRUCache, KeyValueCache } from '@apollo/utils.keyvaluecache';

/**
 * SOAP Cache utility
 *
 * SOAP is sent as HTTP POST and its a non-idempotent. Thus it can not be cached
 * at HTTP level.
 *
 * This[1] is draft version of document for response caching for SOAP, but did
 * not found any implementation of it.
 *
 * Thus it make sense to client decide to cache it or not and for much duration.
 *
 * [1]: https://lists.w3.org/Archives/Public/www-ws/2001Aug/att-0000/ResponseCache.html
 */
export class SOAPCache {
  private keyValueCache: KeyValueCache;
  /**
   * A constructor
   *
   * @param {Object} keyValueCache a cache object from apollo server en
   */
  constructor(
    keyValueCache: KeyValueCache = new InMemoryLRUCache<string, any>(),
  ) {
    this.keyValueCache = keyValueCache;
  }

  /**
   * Get the cached value from cache by key
   *
   * @param {String} key a cache key
   * @return {Object} a value of the cached object
   *
   */
  async get(key: string): Promise<any> {
    const entry = await this.keyValueCache.get('soapcache:' + key);
    if (entry) {
      return JSON.parse(entry);
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
  async put(key: string, value: any, ttl: number): Promise<void> {
    if (ttl > 0) {
      await this.keyValueCache.set('soapcache:' + key, JSON.stringify(value), {
        ttl,
      });
    }
  }
}
