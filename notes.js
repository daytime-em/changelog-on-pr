const core = require('@actions/core');
const github = require('@actions/github');
const { Client } = require('./httpClient');
//const http = require('@actions/http-client');

// Gets the PR number to be used for this run. If the user provides
//  one via the 'pull_number' input, it should be used. otherwise,
//  try to get a pull number out of a pull request on the event.
function prNumber() {
  var manualNumber = core.getInput('pull_number')
  if (manualNumber) {
    return manualNumber
  } else {
    return github.event.pull_request.number
  }
}

// Fetches the PR from the Github API
async function fetchPr(pullNumber) {
}

// Fetches the commits for a given pull request 
async function fetchCommitsForPr(pullRequest) {

}

function newHttpClient() {
}

async function main() {
  console.log("Working on PR number " + prNumber())

  // Fetch PR Commits
  // For each commit: Add the first line (regardless of length) to list of lines
  //  Catenate the lines, that's your output so set it
  // use the GitHub API to get the release notes, append ours to the end then push back up
}

main()
  .catch(err => { core.setFailed(err.message) })
  .then(exit => { console.log("Finished with exit data: " + exit) })
