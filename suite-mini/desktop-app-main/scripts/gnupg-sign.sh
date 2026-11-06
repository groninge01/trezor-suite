#!/usr/bin/env bash

if [ -z "$GPG_CSC_USERID" ] || [ -z "$GPG_CSC_LINK" ] || [ -z "$GPG_CSC_KEY_PASSWORD" ]; then
  echo "GPG sign skipped"
  exit 0
fi

gpg --batch --import "$GPG_CSC_LINK"

shopt -s extglob

build_dir="${1:-suite-mini/desktop-app/build-electron}"

for f in "$build_dir"/*.@(AppImage|zip|dmg|exe) ; do
  gpg --batch --local-user "$GPG_CSC_USERID" --armor --detach-sig --passphrase "$GPG_CSC_KEY_PASSWORD" --pinentry-mode loopback "$f"
done
