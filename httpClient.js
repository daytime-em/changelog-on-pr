const { HttpClient, BearerCredentialHandler } = require('@actions/http-client')
const core = require('@actions/core');

class Client {

  httpClient = this.newHttpClient()

  constructor() {
    this(
      () => { new BearerCredentialHandler(core.getInput('token')) },
      (authHandler) => {
        new HttpClient(
          "release-notes-generator", [authHandler]
        )
      }
    )
  }

  constructor(authHandlerFunc, httpClientFunc) {
    this.httpClient = httpClientFunc(authHandlerFunc())
  }
}
