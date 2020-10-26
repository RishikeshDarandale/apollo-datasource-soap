# apollo-datasource-soap

[![CircleCI](https://circleci.com/gh/RishikeshDarandale/apollo-datasource-soap.svg?style=svg)](https://circleci.com/gh/RishikeshDarandale/apollo-datasource-soap)
[![Known Vulnerabilities](https://snyk.io/test/github/RishikeshDarandale/apollo-datasource-soap/badge.svg)](https://snyk.io/test/github/RishikeshDarandale/apollo-datasource-soap)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b5521af6e43f477a85b40d146177dc32)](https://www.codacy.com/app/RishikeshDarandale/apollo-datasource-soap?utm_source=github.com&utm_medium=referral&utm_content=RishikeshDarandale/apollo-datasource-soap&utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/4c6f4aac6d12468c9eb1d2fd0eace794)](https://www.codacy.com/app/RishikeshDarandale/apollo-datasource-soap?utm_source=github.com&utm_medium=referral&utm_content=RishikeshDarandale/apollo-datasource-soap&utm_campaign=Badge_Coverage)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=RishikeshDarandale/apollo-datasource-soap)](https://dependabot.com)
[![npm](https://img.shields.io/npm/v/apollo-datasource-soap.svg)](https://www.npmjs.com/package/apollo-datasource-soap)
[![npm](https://img.shields.io/npm/dt/apollo-datasource-soap.svg)](https://www.npmjs.com/package/apollo-datasource-soap)
[![NpmLicense](https://img.shields.io/npm/l/apollo-datasource-soap.svg)](https://github.com/RishikeshDarandale/apollo-datasource-soap/blob/master/LICENSE)

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
    // override the soap endpoint for all requests
    options.endpoint = 'http://www.thomas-bayer.com/axis2/services/BLZService';
    // these will be used for all soap calls
    options.wsdl_headers = {
      Authorization: token,
    }
  }

  async getBank() {
    return await this.invoke('getBank', {blz: 37050198});
  }
}
```

# SOAP Cache utility

SOAP is sent as HTTP POST and its a non-idempotent. Thus it can not be cached at HTTP level.

[This][4] is draft verison of document for response caching for SOAP, but did not found any implementaion of it.

Thus it make sense to client decide to cache it or not and for how much duration.

Specify the ttl to cache the SOAP response.

```
class TestSoapDataSource extends SOAPDataSource {
  constructor() {
    super('http://www.thomas-bayer.com/axis2/services/BLZService?wsdl');
  }

  async willSendRequest(options) {
    // override the soap endpoint for all requests
    options.endpoint = 'http://www.thomas-bayer.com/axis2/services/BLZService';
    // these will be used for all soap calls
    options.wsdl_headers = {
      Authorization: token,
    }
  }

  async getBank() {
    // cache the response for 1 hour
    return await this.invoke('getBank', {blz: 37050198}, {ttl: 3600});
  }
}
```

## Decide when to cache

There might be a situation where client needs to decide the response should be cached based on response code. This can be achieved overriding the method `shouldCache` method. `shouldCache` method returns a `boolean` flag to indicate if response can be cached or not. Please take a look at below example:

```
class TestSoapDataSource extends SOAPDataSource {
  constructor() {
    super('http://www.thomas-bayer.com/axis2/services/BLZService?wsdl');
  }

  async willSendRequest(options) {
    // override the soap endpoint for all requests
    options.endpoint = 'http://www.thomas-bayer.com/axis2/services/BLZService';
    // these will be used for all soap calls
    options.wsdl_headers = {
      Authorization: token,
    }
  }

  async getBank() {
    // cache the response for 1 hour
    return await this.invoke('getBank', {blz: 37050198}, {ttl: 3600});
  }

  shouldCache(response) {
    return response.code === 0 ? true : false;
  }
}
```

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
[4]: https://lists.w3.org/Archives/Public/www-ws/2001Aug/att-0000/ResponseCache.html
