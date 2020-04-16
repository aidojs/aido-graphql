const fetch = require('node-fetch')

const baseHeaders = {
  'Content-Type': 'application/json',
}

const defaultErrorManager = () => {}

/**
 * Plugin factory
 * @param {Object}   koa
 */
function pluginFactory(koa) {
  const { apiURL, defaultHeaders = {}, errorManager = defaultErrorManager } = koa.app.context.options.graphQL

  async function query(query, variables, additionalHeaders = {}) {
    const headers = {
      ...baseHeaders,
      ...defaultHeaders,
      ...additionalHeaders,
    }

    const body = JSON.stringify({ query, variables })

    return fetch(apiURL, { headers, body, method: 'post' })
      .then(res => {
        if (!res.error) {
          return res
        }
        errorManager(res)
      })
      .then(res => res.json())
      .catch(err => {
        console.log(`[${err.name}] Fetch error : ${err.message}`)
      })
  }

  function slashFactory(oldSlash) {
    class Slash extends oldSlash {
      get graphQL() {
        return {
          async query(...args) {
            return query(...args)
          },
          async mutate(...args) {
            return query(...args)
          }
        }
      }
    }

    return Slash
  }

  /**
   * Get the helpers which will be accessible in the aido object
   * @param {Object}   database
   */
  async function getHelpers(database) {
    return {
      // You can access and modify the base headers from the aido object
      baseHeaders,
      // You can also access the query & mutate helpers
      async query(...args) {
        return query(...args)
      },
      async mutate(...args) {
        return query(...args)
      }
    }
  }

  return {
    name: 'graphQL',
    slashFactory,
    getHelpers,
  }
}

module.exports = pluginFactory
