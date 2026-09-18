---
name: GitHub push via Git Data API
description: How to push a Replit workspace to a new GitHub repo when only the OAuth connector is available (no raw token, no gh CLI auth).
---

## The rule
Use GitHub's Contents API to initialize the repo, then Git Data API for the bulk push.

**Why:** The Replit connectors SDK (`@replit/connectors-sdk`) proxies GitHub API calls but never exposes the raw OAuth token. You cannot use it to authenticate `git push`, `gh auth login`, or `git credential-helper` scripts. The `gh` CLI is installed at `/repl/ctls/bin/gh` but also needs a raw token.

**How to apply:**
1. `POST /repos/{owner}/{repo}` via connectors to create the repo.
2. `PUT /repos/{owner}/{repo}/contents/README.md` to initialize it (the Git Data API returns 409 "Git Repository is empty" on a completely empty repo for blobs/trees).
3. Use the `sha` and `commit.tree.sha` from the init response as `parents` and `base_tree` for subsequent calls.
4. Push remaining files in batches of ~80 via `POST /repos/{owner}/{repo}/git/trees` with inline `content` (no blob pre-creation needed for text files).
5. Binary files (`.png`, `.pdf`, etc.) must be created as blobs with `encoding: "base64"` AFTER the init commit. Or skip them if they are build outputs.
6. Finish with `POST /repos/{owner}/{repo}/git/commits` (no parents if first real commit, or `[initCommitSha]`) and `PATCH /repos/{owner}/{repo}/git/refs/heads/main` with `force: true`.

Reference script: was written to `scripts/src/push-to-github.mjs` (deleted after use; pattern is documented here).
