'use strict';

const {DataSource} = require('apollo-datasource');
const {ApolloError} = require('apollo-server-errors');
const soap = require('soap');

/**
 * A Soap datasource class
 *
 */
class SOAPDataSource extends DataSource {
  /**
   * constructor
   *
   * @param {String} wsdl a wsdl url of a soap service
   *
   */
  constructor(wsdl) {
    super();
    if (!wsdl) {
      throw new ApolloError(
          'Cannot make request to SOAP endpoint, missing soap wsdl url.'
      );
    }
    this.wsdl = wsdl;
    this.options = {
      wsdl_headers: {},
      wsdl_options: {},
    };
  }

  /**
   * Intercept the request and append client options
   *
   * @param {Object} options an object options of [soap](https://www.npmjs.com/package/soap#options) npm module
   */
  async willSendRequest(options) {}

  /**
   * Implement the initialize method to get access to context
   * This will be called by apollo server
   *
   * @param {DataSourceConfig} config a datasource config object
   *
   */
  initialize(config) {
    this.context = config.context;
    this.cache = config.cache;
  }

  /**
   * Get a soap client for given wsdl url
   */
  async createClient() {
    try {
      if (!this.client) {
        await this.willSendRequest(this.options);
        this.client = await soap.createClientAsync(this.wsdl, this.options);
        // lets use wsdl_headers for each soap method invocation.
        if (this.options.wsdl_headers) {
          Object.keys(this.options.wsdl_headers).forEach((key) =>
            this.client.addHttpHeader(key, this.options.wsdl_headers[key])
          );
        }
      }
    } catch (error) {
      throw new ApolloError('Couldnot create the soap client.', this.wsdl);
    }
    return this.client;
  }

  /**
   * Invoke the soap method
   *
   * @param {String} methodName the methodname to Invoke
   * @param {Object} params the params for soap method
   *
   */
  async invoke(methodName, params) {
    let response;
    try {
      // create the client
      await this.createClient();
      response = await this.client[methodName + 'Async'](params);
      console.log('The response: ' + JSON.stringify(response[0]));
    } catch (error) {
      console.log('Error: ', error);
      throw new ApolloError('Error happened when calling a method', error);
    }
    if (!response[0]) {
      throw new ApolloError(
          'Did not received the response from the endpoint',
          response
      );
    }
    return response[0];
  }
}

module.exports = SOAPDataSource;
