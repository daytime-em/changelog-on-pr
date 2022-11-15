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

function getHeadingLabels() {
  return core.getInput('labels').split(',')
}

async function labelsOnPr(pull_number) {
  try {
    let pr = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number
    })
    return pr.data.labels.map(label => { return label.name.toLowerCase() })
  } catch (error) {
    console.log("Couldn't fetch PR " + pull_number)
    console.log(error)
    return []
  }
}

// Returns a map containing lists of change messages keyed by label/heading
async function changesByLabel(commitMessages) {
  var messagesByLabel = new Map() // label:[message1, message2, ...]
  let headingLabels = getHeadingLabels()

  for (const commitMsg of commitMessages) {
    var added = false

    // If there's a reference to a pull request
    if (commitMsg.match(/#\d+/)) {
      let prLabels = await labelsOnPr(commitMsg.match(/#(\d+)/)[1])
      prLabels.forEach(prLabel => {
        if (headingLabels.includes(prLabel)) {
          appendMessageByLabel(messagesByLabel, prLabel, commitMsg)
          added = true
        }
      })
    }

    // unlabeled changes should be called 'improvements'
    if (!added) {
      appendMessageByLabel(messagesByLabel, "improvements", commitMsg)
    }
  } // for (... of commitMessages)

  return messagesByLabel
}

function appendMessageByLabel(messagesByLabel, label, message) {
  if (!messagesByLabel.has(label)) {
    messagesByLabel.set(label, "* " + message)
  } else {
    let messages = messagesByLabel.get(label)
    messagesByLabel.set(label, messages + "\n* " + message)
  }
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function createChangelog(commitMessages) {
  let coAuthors = new Map()
  for (const msg of commitMessages) {
    msg.split("\n")
      .filter(line => { return line.match(/Co-authored-by:/) })
      .forEach(line => {
        // Name Name Name <example@users.noreply.github.com>
        let emails = line.match(/Co-authored-by:.*<(.*)>/)
        if (emails[1]) {
          coAuthors.set(emails[1], emails[0])
        } else {
          coAuthors.set(line)
        }
      })
  }

  let firstLines = commitMessages.map(msg => { return msg.split("\n")[0] })
  let changes = await changesByLabel(firstLines)
  var body = ""

  // Add each category based on the inputs
  for (const key of getHeadingLabels()) {
    let value = changes.get(key)
    body += formattedCategory(key, value)
  }
  // If Improvements wasn't an input (affects heading order) then add it at the end for unlabeled changes
  if (!getHeadingLabels().includes("improvements")) {
    body += formattedCategory("improvements", changes.get("improvements"))
  }

  // Don't forget the co-authors!
  for (const [email, msg] of coAuthors) {
    body += msg
    body += "\n"
  }

  return body
}

function formattedCategory(key, value) {
  if (!value || value.length <= 0) {
    return ""
  }

  let body = ""
  body += "## "
  body += capitalize(key)
  body += "\n\n"
  body += value
  body += "\n\n"
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
  let changelog = await createChangelog(commitMessages)

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
