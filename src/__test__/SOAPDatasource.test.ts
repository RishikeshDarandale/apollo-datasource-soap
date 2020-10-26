import { InMemoryLRUCache } from 'apollo-server-caching';
import { ApolloError } from 'apollo-server-errors';
import { SOAPDataSource } from '../SOAPDataSource';

jest.mock('soap', () => {
  return {
    __esModule: true,
    createClientAsync: jest.fn().mockImplementation(() =>
      Promise.resolve({
        fakeMethodAsync: jest.fn().mockResolvedValue([
          {
            message: 'Hello James Bond from fake Service',
          },
        ]),
        fakeCacheMethodAsync: jest.fn().mockImplementation(() =>
          Promise.resolve([
            {
              message:
                'Hello James Bond from fake Service ' + new Date().getTime(),
            },
          ])
        ),
        fakeMethod2Async: jest.fn().mockResolvedValue([]),
      })
    ),
  };
});

const datasource: SOAPDataSource = new SOAPDataSource(
  'https://fake.com/fake-service?wsdl'
);
datasource.initialize({ context: {}, cache: new InMemoryLRUCache<string>() });

it('When correct method with params is passed, then should get valid response', async () => {
  const response = await datasource.invoke('fakeMethod', {
    name: 'James Bond',
  });
  expect(response).toEqual({ message: 'Hello James Bond from fake Service' });
});

it('When correct method with params is passed with ttl to cache, then should get valid response', async () => {
  const response = await datasource.invoke(
    'fakeMethod',
    {
      name: 'James Bond',
    },
    { ttl: 60 }
  );
  expect(response).toEqual({ message: 'Hello James Bond from fake Service' });
});

it('When correct cached method is invoked, then should get cached response', async () => {
  const firstResponse = await datasource.invoke(
    'fakeCacheMethod',
    {
      name: 'James Bond',
    },
    { ttl: 2 }
  );
  // await
  await new Promise((resolve) => setTimeout(resolve, 800));
  const secondResponse = await datasource.invoke(
    'fakeCacheMethod',
    {
      name: 'James Bond',
    },
    { ttl: 2 }
  );
  expect(firstResponse).toEqual(secondResponse);
  // await
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const thirdResponse = await datasource.invoke(
    'fakeCacheMethod',
    {
      name: 'James Bond',
    },
    { ttl: 2 }
  );
  expect(firstResponse).not.toEqual(thirdResponse);
});

it(
  'When correct method with params is passed and service returns an empty response, ' +
    'then should not fail',
  async () => {
    const response = await datasource.invoke('fakeMethod2', {
      name: 'James Bond',
    });
    expect(response).toBeUndefined;
  }
);

it(
  'When correct method with params is passed and service returns an empty response, ' +
    'then should not fail and should not cache the result',
  async () => {
    const response = await datasource.invoke(
      'fakeMethod2',
      { name: 'James Bond' },
      { ttl: 5 }
    );
    expect(response).toBeUndefined;
  }
);

it('When incorrect method name is passed, then should throw apollo error', async () => {
  await expect(
    datasource.invoke('fakeMethod1', { name: 'James Bond' })
  ).rejects.toThrow(ApolloError);
});
