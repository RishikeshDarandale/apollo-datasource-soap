# apollo-datasource-soap
A simple implementaion of apollo datasource for soap requests

Connect the SOAP based services to your Apollo server 2.0 using [Data Sources][1]

# Soap Data Source

## Install

```
npm install --save apollo-dataSource-soap
```

or

```
yarn add apollo-dataSource-soap
```

## Usage

Define a data source by extending the `SOAPDataSource` class. You can invoke the soap method with param by invoking `invoke` method.

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

# TODO

Implement the caching mechanism using existing apollo caching mechanism.

# Issue or need a new feature?

If you are experiencing a issue or wanted to add a new feature, please create a github issue [here][2].

# Contributing

:star: Star me on GitHub — it helps!

:heart: contribution: Here is [contributing guide][3] in deatil.

For impatient here are quick steps:

- **Fork** the repository
- Create **Branch** in you local repository
- while(youFinish) { **Commit** }
- **Squash** related commits.
- **Write** unit test cases for your work.
- Check the **Build** on your local.
- Raise a **Pull Request** (aka PR)


[1]: https://www.apollographql.com/docs/apollo-server/features/data-sources.html
[2]: https://github.com/RishikeshDarandale/apollo-datasource-soap/issues/new
[3]: ./CONTRIBUTING.md
