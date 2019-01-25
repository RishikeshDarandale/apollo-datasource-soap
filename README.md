# apollo-datasource-soap
A simple implementaion of apollo datasource for soap requests

# example

```
class TestSoapDataSource extends SOAPDataSource {
  constructor() {
    super('http://www.thomas-bayer.com/axis2/services/BLZService?wsdl');
  }

  async willSendRequest(options) {
    options.wsdl_headers = {
      Authorization: token,
    }
  }

  async getBank() {
    return await this.invoke('getBank', {blz: 37050198});
  }
}
```
