const core = require('@actions/core');
const github = require('@actions/github');

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
  let pullNumber = getPullNumber()
  console.log(">release-notes-on-pr: Working on PR number " + pullNumber)

  let pr = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber
  })

  let commits = await octokit.paginate( 
    octokit.rest.pulls.listCommits, {
      owner,
      repo,
      pull_number: pullNumber
    } 
  )
  let commitMessages = commits.map(element => { return element.commit.message })
  commitMessages.forEach(msg => { console.log('found message ' + msg) })

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
  .then(() => { console.log("Done! ") })
