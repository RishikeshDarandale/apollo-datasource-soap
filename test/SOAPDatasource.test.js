const proxyquire = require('proxyquire');
const sinon = require('sinon');
const test = require('ava');

const {ApolloError} = require('apollo-server-errors');

let datasource;
let createClientAsyncStub; // fake soap client object

/**
 * Execute before any test execution
 */
test.beforeEach((t) => {
  // This runs before all tests
  createClientAsyncStub = sinon.stub();

  // import the module to SOAPDataSource, using a fake dependency
  const SOAPDataSource = proxyquire('../src/SOAPDataSource.js', {
    soap: {
      createClientAsync: createClientAsyncStub,
    },
  });
  createClientAsyncStub.returns({
    fakeMethodAsync: async function(params) {
      return [
        {
          message: 'Hello ' + params.name + ' from fake Service',
        },
      ];
    },
    fakeCacheMethodAsync: async function(params) {
      return [
        {
          message:
            'Hello ' +
            params.name +
            ' from fake Service ' +
            new Date().getTime(),
        },
      ];
    },
    fakeMethod2Async: async function(params) {
      return [];
    },
  });
  datasource = new SOAPDataSource('https://fake.com/fake-service?wsdl');
  datasource.initialize({});
});

/**
 * Happy path test case
 */
test('When correct method with params is passed, then should get valid response', async (t) => {
  const response = await datasource.invoke('fakeMethod', {
    name: 'James Bond',
  });
  t.deepEqual(response, {message: 'Hello James Bond from fake Service'});
});

test('When correct method with params is passed with ttl to cache, then should get valid response', async (t) => {
  const response = await datasource.invoke(
      'fakeMethod',
      {
        name: 'James Bond',
      },
      {ttl: 60}
  );
  t.deepEqual(response, {message: 'Hello James Bond from fake Service'});
});

test('When correct cached method is invoked, then should get cached response', async (t) => {
  const firstResponse = await datasource.invoke(
      'fakeCacheMethod',
      {
        name: 'James Bond',
      },
      {ttl: 5}
  );
  // await
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const secondResponse = await datasource.invoke(
      'fakeCacheMethod',
      {
        name: 'James Bond',
      },
      {ttl: 5}
  );
  t.deepEqual(firstResponse, secondResponse);
  // await
  await new Promise((resolve) => setTimeout(resolve, 6000));
  const thirdResponse = await datasource.invoke(
      'fakeCacheMethod',
      {
        name: 'James Bond',
      },
      {ttl: 5}
  );
  t.notDeepEqual(firstResponse, thirdResponse);
});

/**
 * Negative test case
 */
test(
    'When correct method with params is passed and service failed, ' +
    'then should throw apollo error',
    async (t) => {
      await t.throwsAsync(
          datasource.invoke('fakeMethod2', {name: 'James Bond'}),
          {
            instanceOf: ApolloError,
            message: 'Did not received the response from the endpoint',
          }
      );
    }
);

test(
    'When correct method with params is passed and service failed, ' +
    'then should throw apollo error and should not cache the result',
    async (t) => {
      await t.throwsAsync(
          datasource.invoke('fakeMethod2', {name: 'James Bond'}, {ttl: 5}),
          {
            instanceOf: ApolloError,
            message: 'Did not received the response from the endpoint',
          }
      );
    }
);

/**
 * Negative test case
 */
test('When incorrect method name is passed, then should throw apollo error', async (t) => {
  await t.throwsAsync(
      datasource.invoke('fakeMethod1', {name: 'James Bond'}),
      {instanceOf: ApolloError, message: 'Error happened when calling a method'}
  );
});

/**
 * Negative test case
 */
test('When wsdl url is not provided, then should throw apollo error', async (t) => {
  const SOAPDataSource = require('../src/SOAPDataSource.js');
  await t.throws(
      () => {
        new SOAPDataSource();
      },
      {
        instanceOf: ApolloError,
        message: 'Cannot make request to SOAP endpoint, missing soap wsdl url.',
      }
  );
});
