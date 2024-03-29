# Pretty-Printed Changelogs on PRs
Sorted, formatted PR changelogs that preserve attribution and link back to performed work

Adds a changelog to a Pull Request based on its commits. The release notes are generated from the first line of each commit in the PR, and can be oganized by label if desired. For Pull request that weren't labeled (or if no labels are provided for headings), changes will be grouped together as `Improvements`

This is a good companion to release workflows that involve squash-merging a pull-request to a branch

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

Co-authored-by A Teammate <a_teammate@organization.com>
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
