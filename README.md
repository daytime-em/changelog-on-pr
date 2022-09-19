# Changelog on Release PRs
Adds a changelog to a Pull Request based on its commits. The release notes are generated from the first line of each commit in the PR, and can be oganized by label if desired.

Technically this could be applied to any branch, but probably makes the most sense in workflows where a pull request is merged as part of the release process.

The notes are formatted with simple markdown, and changes can be grouped by heading if desired using labels.

#### Example Output
```
## Breaking

* Remove deprecated method badMethod(). Use goodMethod() instead (#5)

## Fixes

* Fix issue where lorem ipsum filler text (#4)

## Improvements

* Improve performance during scenario lorem ipsum (#6)
* Add Events for Use Case Sit Amet (#3)
```

## Usage

If desired, this action can sort changes according to categories you define. If you supply a list of labels, they will be used as headings and changes with the same label will be grouped together underneath.

If you supply no labels, there will be one heading called "Improvements"

This action should be provided an appropriately-scoped auth token.

```yaml
on: 
  pull_request:
# ... rest of workflow def 
- name: Generate some release notes
  uses: daytime-em/release-notes-on-pr@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    labels: breaking,fixes
```
