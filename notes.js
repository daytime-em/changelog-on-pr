const core = require('@actions/core');
const github = require('@actions/github');

const octokit = new github.getOctokit(core.getInput('token'))
const owner = github.context.payload.repository.owner.login
const repo = github.context.payload.repository.name

function getPullNumber() {
  var manualNumber = core.getInput('pull_number')
  if (manualNumber) {
    return manualNumber
  } else {
    return github.event.pull_request.number
  }
}

async function labelsOnPr(pull_number) {
  let pr = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number
  })
  return pr.data.labels.map(label => { return label.name })
}

// Returns a map containing lists of change messages keyed by label/heading
async function changesByLabel(commitMessages) {
  var messagesByLabel = new Map() // label:[message1, message2, ...]
  let headingLabels = core.getInput('labels').split(',')

  commitMessages.forEach(async commitMsg => {
    var added = false

    // If there's a reference to a pull request
    if (commitMsg.match(/#\d+/)) {
      let prLabels = await labelsOnPr(commitMsg.match(/#(\d+)/)[0])
      prLabels.forEach(prLabel => {
        if (headingLabels.includes(prLabel)) {
          appendMessageByLabel(messagesByLabel, prLabel, commitMsg)
          added = true
        }
      })
    } 
    if (!added) {
      appendMessageByLabel(messagesByLabel, "improvements", commitMsg)
    }
  }) // commitMessages.forEach(...

  messagesByLabel.keys().forEach(key => {
    let values = messagesByLabel.get(key)
    values.forEach(value => {
      console.log(key + " : " + value)
    })
  })
}

function appendMessageByLabel(messagesByLabel, label, message) {
  if (!messagesByLabel.has(label)) {
    messagesByLabel.set(label, [message])
  } else {
    let messages = messagesByLabel.get(label)
    messages += message
    messagesByLabel.set(label, messages)
  }
}

async function createChangelog(commitMessages) {
  // it would be cool would be to sort into different headings by PR label (pr number from the #x at the end)
  const header = "## Improvements"

  var body = header + "\n\n"
  commitMessages.map(msg => { return msg.split('\n')[0] })
    .forEach(msg => { body += "* " + msg + "\n" })

  // new way
  await changesByLabel(commitMessages)

  return body
}

async function main() {
  let pullNumber = getPullNumber()
  console.log(">release-notes-on-pr: Working on PR number " + pullNumber)

  // Create formatted changelog string from commits
  let commits = await octokit.paginate(
    octokit.rest.pulls.listCommits, {
    owner,
    repo,
    pull_number: pullNumber
  })
  let commitMessages = commits.map(element => { return element.commit.message })
  let changelog = createChangelog(commitMessages)

  console.log("Adding Changelog:\n" + changelog)

  // Append the changelog to what's already in there
  let pr = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber
  })
  var body
  if (pr.data.body) {
    body = pr.data.body + "\n\n" + changelog
  } else {
    body = changelog
  }

  // Update the PR
  await octokit.rest.pulls.update({
    owner,
    repo,
    pull_number: pullNumber,
    body
  })
}

main()
  .catch(err => {
    console.log("Failed with error")
    console.log(err)
    core.setFailed(err.message)
  })
  .then(() => { console.log("Done! ") })
