const SOAPDataSource = require('../src/SOAPDataSource.js');

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
   * get bank method
   *
   * This operation is present in above service
   */
  async getBank() {
    return await this.invoke('getBank', {blz: 37050198});
  }
}

/**
 * test method to instantiate and execute the test method
 */
async function test() {
  const testSoapDataSource = new TestSoapDataSource();
  console.log(await testSoapDataSource.test());
}

/**
 * execute this with Node
 */
test();
