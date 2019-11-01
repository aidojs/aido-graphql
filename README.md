# aido-graphql

A simple GraphQL client for your Aido applications.

## Installation

The aido-graphql package can be installed with your package manager of choice :

```sh
npm install --save aido-graphql
# or
yarn add aido-graphql
```

To use it in your Aido application, you'll need to import it as a plugin :

```javascript
const aidoGraphQL = require('aido-graphql')

aido.init({
  plugins: [aidoGraphQL],
})
```

## Setup

You can pass a configuration to aido-graphql when you initialize your Aido application :

```javascript
aido.init({
  // ...
  graphQL: {
    apiURL: 'https://your-api/graphql',
    defaultHeaders: {
      'X-special-auth': 'XXXXXXXXX',
    },
    errorManager: (res) => {
      console.log(`[${res.status}] GraphQL error : ${res.statusText}`)
    },
  },
  // ...
})
```

* **apiURL** (*String*) : The URL of your GraphQL endpoint
* **defaultHeaders** (*Object*) : HTTP headers that should be added to every request
* **errorManager** (*Function*) : A callback to handle GraphQL errors. This callback will be called every time a request returns a status code not in the 2XX range. *Please note that these statuses will not throw an exception, in conformity with [node-fetch's behaviour](https://www.npmjs.com/package/node-fetch#handling-exceptions). Exceptions will only be thrown by system or network errors.*

## Usage

### In a Slash class

```javascript
const { Slash } = require('/aido')

const query = `
query fetchUser($userId: Int!) {
  user(id: $userId) {
    id
    name
  }
}
`

class MySlash extends Slash {
  someAction() {
    const user = this.graphQL.query(query, { userId: 1 })
    this.state.userName = user.name
  }
}
```

### On application startup

```javascript
const startupTime = new Date()

const mutation = `
mutation logStartTime($date: Date!) {
  logStartTime(date: $date)
}
`

aido.start().then(() => {
  aido.helpers.graphQL.mutate(mutation, { date })
})
```

### Inside a plugin

```javascript
const startupTime = new Date()

const mutation = `
mutation logPluginStartTime($date: Date!, $plugin: String!) {
  logStartTime(date: $date, plugin: $plugin)
}
`
function pluginFactory(koa, utils) {
  async function initPlugin() {
    utils.helpers.graphQL.mutate(mutation, { date, plugin: 'my-plugin' })
  }
}
```

### Changing base headers

By default, the following HTTP header will be added to every request : `'Content-Type': 'application/json'`. You can change it on application startup, or when initializing a plugin, using the helper `baseHeaders` :

```javascript
aido.start().then(() => {
  aido.helpers.graphQL.baseHeaders['X-extra-special-header'] = 'YYYYYYYYYY'
})
```

## API

### query(query, variables, additionalHeaders)

* **query** (*String*) : A GraphQL query
* **variables** (*Object*) : Substitution variables for your query
* **additionalHeaders** (*Object*) : Additional HTTP headers to add to the request

### mutate(query, variables, additionalHeaders)

* **query** (*String*) : A GraphQL mutation
* **variables** (*Object*) : Substitution variables for your mutation
* **additionalHeaders** (*Object*) : Additional HTTP headers to add to the request
