const { HttpClient, BearerCredentialHandler } = require('@actions/http-client')
const core = require('@actions/core');

class Client {

  httpClient = this.newHttpClient()

  constructor() {
    var newAuthHandler = () => { new BearerCredentialHandler(core.getInput('token')) }
    var newHttpClient = (authHandlerFunc) => {
      new HttpClient(
        "release-notes-generator", [authHandlerFunc]
      )
    }
    this(newAuthHandler, newHttpClient)
  }

  constructor(authHandlerFunc, httpClientFunc) {
    this.httpClient = httpClientFunc(authHandlerFunc)
  }
}
