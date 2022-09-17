const { HttpClient, BearerCredentialHandler } = require('@actions/http-client')
const core = require('@actions/core');

function defaultClient() { 
  return Client(null, null)
}

class Client {

  httpClient = this.newHttpClient()

  constructor(authHandlerFn, clientFn) {
    if (!authHandlerFn) {
      var authHandlerFn = () => { new BearerCredentialHandler(core.getInput('token')) }
    }
    if (!clientFn) {
      var clientFn = (authHandler) => { new HttpClient("release-notes-generator", [authHandler]) }
    }
    this.httpClient = clientFn(authHandlerFn())
  }
}
