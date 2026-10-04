---
name: Release
description: Cut a structurizr-site release end to end — suggest a version (with override), update package.json, regenerate CHANGELOG.md, run gates, commit, tag, push, watch the Release workflow, and update the Homebrew tap. Use when the user asks to "create a release", "cut a release", "release a new version", "publish a release", "bump the version and tag", or similar.
---

# Release

Automates the release procedure documented in `README.md` → Release and `lode/architecture/distribution.md`.
The human owns the version decision; this skill proposes one and waits for explicit approval before any file changes.

## Non-negotiable rules

- **Get explicit approval of the version before editing anything.** Never infer approval from "go ahead".
- **Never force-push or move an existing tag.** If the tag already exists on `origin`, stop and report.
- **Only `main`.** Refuse if the current branch is not `main`.
- **Clean tree.** Refuse if `git status --short` is non-empty, unless the user confirms a dirty tree is intentional.
- **Do not rewrite history.** No `--amend` after pushing, no rebasing published commits.
- **Regression gate failure stops the release.** Do not tag a red tree. Report the failure and stop.

## Invariants this repo relies on

- `CHANGELOG.md` is generated from commit history by git-cliff (`cliff.toml`). The release commit that folds `[Unreleased]` into the version must land **before** the tag, or `git cliff --latest` in the workflow sees an empty range and the GitHub notes come out empty.
- The tag is `v<package.json version>`. `release.yml` verifies this and fails otherwise.
- Pre-release versions (containing `-`, like `0.2.0-pre-alpha.1`) are published as GitHub pre-releases, never "Latest".
- The Homebrew formula is rendered from the **published release assets**, so the tap update happens only after the workflow finishes successfully.

## Version scheme (project-specific)

The project is pre-alpha. The scheme is **stay on the `0.y.z` version, increment the `-pre-alpha.N` counter**:

```
0.2.0-pre-alpha.1  →  0.2.0-pre-alpha.2
```

Promotions to a new `0.y.z` (e.g. `0.2.0-pre-alpha.N` → `0.3.0-pre-alpha.1`) or dropping the suffix to ship `0.2.0` are **human decisions** — suggest one only when the unreleased commits clearly warrant it (see step 1), and state your reasoning.

Do **not** use `git cliff --bumped-version` as the source of truth. It computes SemVer from commit types and ignores the `-pre-alpha.N` counter; it only returns the right answer by coincidence when the base version is unchanged. Use the script in `scripts/suggest-version.mjs`.

## Procedure

### 1. Suggest a version

Run the helper from the repo root:

```sh
node .opencode/skills/release/scripts/suggest-version.mjs
```

It prints a suggestion plus the commit types since the last tag. The suggestion logic:

- Count commits since the latest `v*` tag, classifying Conventional Commit types.
- If any `feat`, `fix`, or breaking change (`!` or `BREAKING CHANGE`) appeared, increment `-pre-alpha.N`.
- If only `chore`/`docs`/`ci`/`style`/`test`/`refactor` appeared, the pre-alpha counter still increments per the project's per-release rule — call this out, and offer the option to not release at all.
- If the unreleased set includes a breaking change and the project seems ready to leave pre-alpha, _suggest_ a promotion, but flag it as a judgement call and let the user decide.

Present the suggestion and the evidence. **Ask the user to confirm the version or supply their own.** Use the question tool with the suggestion as the first option and a free-form override. Do not proceed until answered.

### 2. Pre-flight

```sh
git branch --show-current          # must be main
git status --short                 # must be empty
git fetch --tags origin
git tag --list "v<version>"        # must be empty
git tag --list "v<version>" | grep -q . && echo "TAG EXISTS — STOP"
```

Also confirm the working tree is up to date with `origin/main`:

```sh
git rev-list --left-right --count origin/main...HEAD   # expect "0\t0"
```

If anything is off, stop and report.

### 3. Update version and changelog

Set `version` in `package.json` to the approved version (no `v` prefix).

```sh
npm version <version> --no-git-tag-version
npm run changelog:release
npx oxfmt CHANGELOG.md
```

`npm version` edits `package.json` (and `package-lock.json`) without tagging. `npm run changelog:release` uses the new `package.json` version as the git-cliff tag, folding `[Unreleased]` into `## [<version>] - <date>`. git-cliff emits emphasis as `*text*` and other Markdown that fails `oxfmt --check`; run `oxfmt` on the generated file so `format:check` stays green (CI enforces it).

Verify the changelog now has a dated section and no lingering `[Unreleased]` for these commits:

```sh
sed -n '1,40p' CHANGELOG.md
```

### 4. Run the release gates locally

Run exactly what CI runs, in this order, and stop on the first failure:

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
```

If any step fails, report the failure. Do not commit, tag, or push. Leave the version/changelog edits in the working tree so the user can decide whether to fix and retry or revert.

### 5. Commit

```sh
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): <version>"
```

Conventional Commit message. `cliff.toml` skips `chore(release)` commits, so this does not pollute the next changelog. If `package-lock.json` is unchanged, drop it from `git add`.

### 6. Tag and push

Only after the commit exists:

```sh
git tag "v<version>"
git push origin main
git push origin "v<version>"
```

Pushing the tag triggers `.github/workflows/release.yml`.

### 7. Watch the release workflow

Identify the run for the pushed tag and follow it:

```sh
gh run list --workflow=release.yml --limit 5
gh run watch <run-id> --exit-status
```

If the run fails, report the failing step and its log (`gh run view <run-id> --log-failed`). The tag is already on `origin`; do not delete or move it. Tell the user the release did not publish and what failed.

### 8. Update the Homebrew tap

Only after the workflow succeeds and the GitHub release exists (step 8 reads the release assets):

```sh
gh release view "v<version>" --json url,assets --jq '.url'
node packaging/homebrew/update-formula.mjs
```

`update-formula.mjs` downloads the four release assets and fills `packaging/homebrew/structurizr-site.rb` (git-ignored) with per-platform `url`/`sha256`. Then copy it into the tap (tap path from `lode/architecture/distribution.md`: `dirkgroot/homebrew-structurizr-site`, formula at `Formula/structurizr-site.rb`).

Locate the tap checkout and commit the formula. The tap is a separate git repo; do not guess its local path. Ask the user for it if `brew --repository dirkgroot/structurizr-site` does not resolve, or clone it:

```sh
brew --repository dirkgroot/structurizr-site
```

Then:

```sh
cp packaging/homebrew/structurizr-site.rb <tap-repo>/Formula/structurizr-site.rb
cd <tap-repo>
git add Formula/structurizr-site.rb
git commit -m "structurizr-site <version>"
git push
```

### 9. Verify and report

```sh
brew update
brew install dirkgroot/structurizr-site/structurizr-site
structurizr-site --version    # expect <version>
```

Report: version, tag, release URL, workflow run URL, and tap commit hash.

### 10. Update lode

The Lode records durable knowledge (decisions, practices, architecture), **not** the current version — that lives in `package.json` and the git tag. Do not add version numbers or changelog-style history to lode files. Only update the Lode if the release changed lasting behavior or a documented decision.

## Failure handling summary

| Failure point                          | Action                                                      |
| -------------------------------------- | ----------------------------------------------------------- |
| Version not approved                   | Wait. Do nothing.                                           |
| Dirty tree / wrong branch / tag exists | Stop, report.                                               |
| Regression gate fails (step 4)         | Stop. Leave edits. Report failing command.                  |
| Push fails                             | Report; retry only the failed ref.                          |
| Workflow fails (step 7)                | Do not move the tag. Report failing step.                   |
| Release/tap step fails                 | Report which asset or file is missing. Leave the tag alone. |

## When NOT to use this skill

- Dry runs / previews only: run `npm run changelog` (not `:release`) and `git cliff --unreleased --strip header` to preview without changing anything.
- Hotfix on a non-release branch: this skill assumes `main` and a linear release; refuse and ask.
