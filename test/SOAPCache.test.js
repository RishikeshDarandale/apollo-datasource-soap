const test = require('ava');

const SOAPCache = require('../src/SOAPCache.js');

const cache = new SOAPCache();

test('when key does not exists in cache, cache will return null', async (t) => {
  const value = await cache.get('dummykey');
  t.is(value, null);
});

test('when key exists in cache, cache will return value', async (t) => {
  await cache.put('dummykey', {message: 'Hello there!'}, 60);
  const value = await cache.get('dummykey');
  t.deepEqual(value, {message: 'Hello there!'});
});

test('when key is expired in cache, cache will return null', async (t) => {
  await cache.put('dummykey1', {message: 'Hello there!'}, 3);
  // await
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const value = await cache.get('dummykey1');
  t.is(value, null);
});

test('when ttl is set to zero, cache will return null', async (t) => {
  await cache.put('dummykey2', {message: 'Hello there!'}, 0);
  const value = await cache.get('dummykey2');
  t.is(value, null);
});
