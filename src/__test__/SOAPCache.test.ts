import { InMemoryLRUCache } from 'apollo-server-caching';

import { SOAPCache } from '../SOAPCache';

const cache: SOAPCache = new SOAPCache(new InMemoryLRUCache<string>());

it('when key does not exists in cache, cache will return null', async () => {
  const value = await cache.get('dummykey');
  expect(value).toBeNull();
});

it('when key exists in cache, cache will return value', async () => {
  await cache.put('dummykey', { message: 'Hello there!' }, 60);
  const value = await cache.get('dummykey');
  expect(value).toEqual({ message: 'Hello there!' });
});

it('when key is expired in cache, cache will return null', async () => {
  await cache.put('dummykey1', { message: 'Hello there!' }, 3);
  // await
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const value = await cache.get('dummykey1');
  expect(value).toBeNull();
});

it('when ttl is set to zero, cache will return null', async () => {
  await cache.put('dummykey2', { message: 'Hello there!' }, 0);
  const value = await cache.get('dummykey2');
  expect(value).toBeNull();
});
