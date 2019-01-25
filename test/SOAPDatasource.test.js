const proxyquire = require('proxyquire');
const sinon = require('sinon');
const test = require('ava');

const {ApolloError} = require('apollo-server-errors');

let datasource;
let createClientAsyncStub; // fake soap client object

/**
 * Execute before any test execution
 */
test.before((t) => {
  // This runs before all tests
  createClientAsyncStub = sinon.stub();

  // import the module to SOAPDataSource, using a fake dependency
  let SOAPDataSource = proxyquire('../src/SOAPDataSource.js', {
    soap: {
      createClientAsync: createClientAsyncStub,
    },
  });
  datasource = new SOAPDataSource('https://fake.com/fake-service?wsdl');
  createClientAsyncStub.returns({
    fakeMethodAsync: async function(params) {
      return [
        {
          message: 'Hello ' + params.name + ' from fake Service',
        },
      ];
    },
    fakeMethod2Async: async function(params) {
      return [];
    },
  });
});

/**
 * Happy path test case
 */
test('When correct method with params is passed, then should get valid response', async (t) => {
  let response = await datasource.invoke('fakeMethod', {name: 'James Bond'});
  t.deepEqual(response, {message: 'Hello James Bond from fake Service'});
});

/**
 * Negative test case
 */
test('When correct method with params is passed and service failed, then should throw apollo error', async (t) => {
  await t.throwsAsync(
    datasource.invoke('fakeMethod2', {name: 'James Bond'}),
    {
      instanceOf: ApolloError,
      message: 'Did not received the response from the endpoint',
    }
  );
});

/**
 * Negative test case
 */
test('When incorrect method name is passed, then should throw apollo error', async (t) => {
  await t.throwsAsync(
    datasource.invoke('fakeMethod1', {name: 'James Bond'}),
    {instanceOf: ApolloError, message: 'Error happened when calling a method'}
  );
});
