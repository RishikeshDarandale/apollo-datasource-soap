import { SOAPDataSource } from '../src/SOAPDataSource';

/**
 * Test dataSource
 */
class TestSoapDataSource extends SOAPDataSource {
  /**
   * constructor
   */
  constructor() {
    super('http://www.thomas-bayer.com/axis2/services/BLZService?wsdl');
  }

  /**
   * override the params while executing each soap request
   *
   * @param {object} options options object that will be used by soap client
   */
  async willSendRequest(options) {
    // lets override the endpoint
    options.endpoint = 'http://www.thomas-bayer.com/axis2/services/BLZService';
    // add extra headers
    options.wsdl_headers = {
      'User-Agent': 'TestingAgent',
    };
  }
  /**
   * get bank method
   *
   * This operation is present in above service
   */
  async getBank() {
    return await this.invoke('getBank', { blz: 37050198 });
  }
}
