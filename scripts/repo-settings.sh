#!/usr/bin/env bash
# Applies Godstack's repository settings: a locked-down public repo that accepts pull
# requests from anyone, merges nothing without an approving code-owner review, and
# scans every pull request. Safe to re-run; every call is idempotent.
#
# Needs the GitHub CLI logged in as a repository admin:  gh auth login
# Usage: scripts/repo-settings.sh [owner/repo]
set -euo pipefail

REPO="${1:-tiltedhome/godstack}"
api() { gh api -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" "$@"; }
step() { printf '\n== %s\n' "$*"; }

step "Features and merge rules: no issues, wiki, projects or discussions; squash merges only"
api -X PATCH "repos/$REPO" --input - >/dev/null <<'JSON'
{
  "has_issues": false,
  "has_wiki": false,
  "has_projects": false,
  "has_discussions": false,
  "allow_squash_merge": true,
  "allow_merge_commit": false,
  "allow_rebase_merge": false,
  "allow_auto_merge": false,
  "allow_update_branch": true,
  "delete_branch_on_merge": true,
  "squash_merge_commit_title": "PR_TITLE",
  "squash_merge_commit_message": "PR_BODY",
  "security_and_analysis": {
    "secret_scanning": { "status": "enabled" },
    "secret_scanning_push_protection": { "status": "enabled" }
  }
}
JSON

step "Dependabot alerts and security updates, private vulnerability reporting"
api -X PUT "repos/$REPO/vulnerability-alerts" >/dev/null
api -X PUT "repos/$REPO/automated-security-fixes" >/dev/null
api -X PUT "repos/$REPO/private-vulnerability-reporting" >/dev/null

step "Actions: GitHub-owned actions plus zizmor only, read-only token, no PR approvals by Actions"
api -X PUT "repos/$REPO/actions/permissions" -F enabled=true -f allowed_actions=selected >/dev/null
api -X PUT "repos/$REPO/actions/permissions/selected-actions" --input - >/dev/null <<'JSON'
{ "github_owned_allowed": true, "verified_allowed": false, "patterns_allowed": ["zizmorcore/zizmor-action@*"] }
JSON
api -X PUT "repos/$REPO/actions/permissions/workflow" \
  -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false >/dev/null

step "Actions: a maintainer must approve workflow runs for every outside contributor's PR"
api -X PUT "repos/$REPO/actions/permissions/fork-pr-contributor-approval" \
  -f approval_policy=all_external_contributors >/dev/null

step "GitHub Pages: deployed by the ci workflow, from main only"
api -X POST "repos/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 \
  || api -X PUT "repos/$REPO/pages" -f build_type=workflow >/dev/null
api -X PUT "repos/$REPO/environments/github-pages" --input - >/dev/null <<'JSON'
{ "deployment_branch_policy": { "protected_branches": false, "custom_branch_policies": true } }
JSON
api "repos/$REPO/environments/github-pages/deployment-branch-policies" --jq '.branch_policies[].name' | grep -qx main \
  || api -X POST "repos/$REPO/environments/github-pages/deployment-branch-policies" -f name=main -f type=branch >/dev/null

step "Ruleset on main: PR only, code-owner approval, green checks, resolved threads, no force push"
RULESET=$(cat <<'JSON'
{
  "name": "main",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "bypass_actors": [
    { "actor_type": "RepositoryRole", "actor_id": 5, "bypass_mode": "pull_request" }
  ],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "require_code_owner_review": true,
        "dismiss_stale_reviews_on_push": true,
        "require_last_push_approval": true,
        "required_review_thread_resolution": true,
        "allowed_merge_methods": ["squash"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          { "context": "lint" },
          { "context": "test and build" },
          { "context": "workflow security (zizmor)" },
          { "context": "analyze (javascript-typescript)" },
          { "context": "analyze (actions)" },
          { "context": "dependency review" }
        ]
      }
    },
    {
      "type": "code_scanning",
      "parameters": {
        "code_scanning_tools": [
          { "tool": "CodeQL", "alerts_threshold": "errors", "security_alerts_threshold": "high_or_higher" }
        ]
      }
    }
  ]
}
JSON
)
ID=$(api "repos/$REPO/rulesets" --jq '.[] | select(.name == "main") | .id')
if [ -n "$ID" ]; then
  api -X PUT "repos/$REPO/rulesets/$ID" --input - >/dev/null <<<"$RULESET"
else
  api -X POST "repos/$REPO/rulesets" --input - >/dev/null <<<"$RULESET"
fi

step "Done"
api "repos/$REPO" --jq '"\(.full_name): \(.visibility), issues=\(.has_issues), squash only=\(.allow_squash_merge and (.allow_merge_commit|not))"'
echo "Pages: $(api "repos/$REPO/pages" --jq .html_url)"
