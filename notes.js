const core = require('@actions/core');
const github = require('@actions/github');

function prNumber() {
  var manualNumber = core.getInput('pull_number')
  if (manualNumber) {
    return manualNumber
  } else {
    return github.event.pull_request.number
  }
}

async function fetchPr() {
}

async function main() {
  console.log("Working on PR number " + prNumber)

}

main().catch(err => { core.setFailed(err.message) })

console.log("Done!")
