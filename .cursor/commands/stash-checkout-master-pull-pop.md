# stash-checkout-master-pull-pop

Run this from the **workspace root** of this repository.

The default branch is **`master`** (`origin/HEAD` → `origin/master`).

## Behavior

1. **If the current branch is not `master`** and there are **local changes** (tracked, staged, or untracked), **stash** them (including untracked) with message `cursor: stash-checkout-master-pull-pop`.
2. **`git checkout master`** then **`git pull`**.
3. **If a stash was created in step 1**, run **`git stash pop`** on **`master`** so your work reappears on top of updated `master`.

If step 2 fails (e.g. `git pull` errors), **do not** run `git stash pop`; the stash stays available as `stash@{0}`.

If you are **already on `master`** with local edits, this command does **not** auto-stash (only non-`master` branches get the stash step). Resolve conflicts yourself if `git pull` or `git stash pop` reports them.

## Execute

```bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

current_branch="$(git branch --show-current)"
stashed=0

if [ "$current_branch" != "master" ]; then
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    git stash push -u -m "cursor: stash-checkout-master-pull-pop"
    stashed=1
  fi
fi

git checkout master
git pull

if [ "$stashed" -eq 1 ]; then
  git stash pop
fi
```

## Detached HEAD

An empty current branch name is treated as **not** `master`, so a dirty working tree is stashed before checking out `master`.
