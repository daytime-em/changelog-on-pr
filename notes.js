const core = require('@actions/core');
const github = require('@actions/github');
// TODO: Hey wait do I need this? I think so, getting commits requires diving in from URL
const { Client, defaultClient } = require('./httpClient');

const octokit = new github.getOctokit(core.getInput('token'))
const owner = github.context.payload.repository.owner.login
const repo = github.context.payload.repository.name

// Gets the PR number to be used for this run. If the user provides
//  one via the 'pull_number' input, it should be used. otherwise,
//  try to get a pull number out of a pull request on the event.
function getPullNumber() {
  var manualNumber = core.getInput('pull_number')
  if (manualNumber) {
    return manualNumber
  } else {
    return github.event.pull_request.number
  }
}

async function main() {
  console.log("just making sure, gh token is " + core.getInput('token'))
  let pullNumber = getPullNumber()
  console.log(">release-notes-on-pr: Working on PR number " + pullNumber)

  console.log("owner is " + owner)
  console.log("repo is " + repo)

  let pr = await octokit.rest.pulls.get({
    owner, 
    repo, 
    pull_number : pullNumber 
  })
  console.log('I got a PR ' + JSON.stringify(pr))

  let commits = await octokit.rest.pulls.listCommits({
    owner,
    repo,
    pull_number : pullNumber 
  })
  console.log('Hey I downloaded a commit! ' + JSON.stringify(commits))

  // Fetch PR Commits
  // For each commit: Add the first line (regardless of length) to list of lines
  //  Catenate the lines, that's your output so set it
  // use the GitHub API to get the release notes, append ours to the end then push back up
}

main()
  .catch(err => { 
    console.log("Failed with error")
    console.log(err)
    core.setFailed(err.message) 
  })
  .then(exit => { console.log("Finished with exit data: " + exit) })
