'use strict';

import * as crypto from 'crypto';

import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { ApolloError } from 'apollo-server-errors';
import { Client, createClientAsync, IOptions } from 'soap';

import { SOAPCache } from './SOAPCache';

export interface CacheOptions {
  ttl: number;
}

export interface SoapClientOptions extends IOptions {
  soapHeader?: any;
}

/**
 * A Soap datasource class
 *
 */
export class SOAPDataSource<TContext = any> extends DataSource {
  private wsdl: string;
  private options: SoapClientOptions;
  private cache!: SOAPCache;
  protected context!: TContext;
  private client!: Client;
  /**
   * constructor
   *
   * @param {String} wsdl a wsdl url of a soap service
   *
   */
  constructor(wsdl: string) {
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
   * @param {IOptions} options an object options of
   * [soap](https://www.npmjs.com/package/soap#options) npm module
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async willSendRequest(options: SoapClientOptions): Promise<void> {}

  /**
   * A callback method to decide the soap response can be cached or not
   *
   * @param {Object} response
   * @return {Boolean} true if cachable or otherwise false.
   */
  protected shouldCache(response: any): boolean {
    // by default we will assume response is cachable
    return response ? true : false;
  }

  /**
   * Implement the initialize method to get access to context
   * This will be called by apollo server
   *
   * @param {DataSourceConfig} config a datasource config object
   *
   */
  initialize(config: DataSourceConfig<TContext>): void {
    this.context = config.context;
    this.cache = new SOAPCache(config.cache);
  }

  /**
   * Get a soap client for given wsdl url
   */
  private async createClient(): Promise<Client> {
    try {
      if (!this.client) {
        await this.willSendRequest(this.options);
        this.client = await createClientAsync(this.wsdl, this.options);
        // lets use wsdl_headers for each soap method invocation.
        if (this.options.wsdl_headers) {
          Object.keys(this.options.wsdl_headers).forEach((key) =>
            this.client.addHttpHeader(key, this.options.wsdl_headers![key])
          );
        }
        // soap header should be a object with strict xml-string
        if (this.options.soapHeader) {
          this.client.addSoapHeader(this.options.soapHeader);
        }
      }
    } catch (error) {
      throw new ApolloError((error as Error).message);
    }
    return this.client;
  }

  /**
   * Invoke the soap method
   *
   * @param {String} methodName the method name to Invoke
   * @param {Object} params the params for soap method
   * @param {CacheOptions} cacheOptions options for caching
   *
   */
  public async invoke(
    methodName: string,
    params?: any,
    cacheOptions?: CacheOptions
  ): Promise<any> {
    let response;
    try {
      // create the client
      await this.createClient();
      if (cacheOptions && cacheOptions.ttl > 0) {
        // caching enabled
        response = await this.cache.get(getKey(this.wsdl, methodName, params));
        if (!response) {
          const result = await this.client[methodName + 'Async'](params);
          response = result[0];
          if (this.shouldCache(response)) {
            // store it in cache as well
            this.cache.put(
              getKey(this.wsdl, methodName, params),
              response,
              cacheOptions.ttl
            );
          }
        }
      } else {
        const result = await this.client[methodName + 'Async'](params);
        response = result[0];
      }
    } catch (error) {
      throw new ApolloError((error as Error).message);
    }
    return response;
  }
}

/**
 * get the key for
 *
 *  @param {String} url wsdl url
 *  @param {String} methodName soap method name
 *  @param {Object} params
 *  @return {String} the hash as key
 */
function getKey(url: string, methodName: string, params: any): string {
  const secret = 'SoapSecret';
  if (!params) {
    params = {};
  }
  const hash = crypto
    .createHmac('sha256', secret)
    .update(url + methodName + JSON.stringify(params))
    .digest('hex');
  return hash;
}
