const core = require('@actions/core');
const github = require('@actions/github');
const http = require('@actions/http-client')

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


