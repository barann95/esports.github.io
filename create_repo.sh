#!/usr/bin/env bash
set -euo pipefail

DEFAULT_REPO="barann95/esports.github.io"
GH_REPO="${1:-$DEFAULT_REPO}"
MAIN_BRANCH="main"

command -v git >/dev/null 2>&1 || { echo "git bulunamadı. Lütfen git yükleyin."; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "gh bulunamadı. Eğer kullanmayacaksan script'i kullanma, manuel komutları uygulayın."; exit 1; }

if ! gh auth status >/dev/null 2>&1; then
  echo "Lütfen gh auth login ile giriş yapın."
  exit 1
fi

git init
git add .
git commit -m "Initial commit — coming soon page"
git branch -M "$MAIN_BRANCH"
if gh repo view "$GH_REPO" >/dev/null 2>&1; then
  git remote add origin "https://github.com/$GH_REPO.git" || true
  git push -u origin "$MAIN_BRANCH" --force
else
  gh repo create "$GH_REPO" --public --source=. --remote=origin --push
fi

echo "Tamamlandı: https://$(echo "$GH_REPO" | cut -d'/' -f1).github.io/"