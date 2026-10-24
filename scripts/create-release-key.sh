#!/usr/bin/env bash
# Run once on your own machine, never in CI. Creates the release keystore and the
# v3 signing lineage (old debug key -> new release key) outside the repo and
# prints how to store them in GitHub secrets. Nothing is sent anywhere.
#
# Usage: scripts/create-release-key.sh <current-debug-keystore> [output-dir]
#   <current-debug-keystore>  android/app/debug.keystore from `expo prebuild`
#                             (password "android", alias androiddebugkey)
set -euo pipefail

OLD_KEYSTORE=${1:?usage: $0 <current-debug-keystore> [output-dir]}
OUT_DIR=${2:-$HOME/pillminder-release-key}
KEY_ALIAS=pillminder
OLD_ALIAS=androiddebugkey
OLD_PASSWORD=android # public password of the React Native template key
OLD_CERT_SHA256=fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c

find_apksigner() {
  command -v apksigner && return
  local sdk=${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}
  ls -d "$sdk"/build-tools/*/apksigner 2>/dev/null | sort -V | tail -n 1
}

cert_sha256() {
  keytool -list -v -keystore "$1" -storepass:env "$2" -alias "$3" |
    sed -n 's/^[[:space:]]*SHA256: //p' | tr -d ':' | tr 'A-F' 'a-f'
}

APKSIGNER=$(find_apksigner)
[ -n "$APKSIGNER" ] || { echo "apksigner not found (install Android build-tools)" >&2; exit 1; }
[ -f "$OLD_KEYSTORE" ] || { echo "no such file: $OLD_KEYSTORE" >&2; exit 1; }

OUT_DIR=$(mkdir -p "$OUT_DIR" && cd "$OUT_DIR" && pwd)
if git -C "$OUT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "refusing to write keys inside a git work tree: $OUT_DIR" >&2
  exit 1
fi
[ ! -e "$OUT_DIR/release.jks" ] || { echo "$OUT_DIR/release.jks already exists, not overwriting" >&2; exit 1; }

export OLD_KEYSTORE_PASSWORD=$OLD_PASSWORD
[ "$(cert_sha256 "$OLD_KEYSTORE" OLD_KEYSTORE_PASSWORD "$OLD_ALIAS")" = "$OLD_CERT_SHA256" ] ||
  { echo "$OLD_KEYSTORE is not the key of the installed app (expected SHA-256 $OLD_CERT_SHA256)" >&2; exit 1; }

read -r -s -p "New release key password: " RELEASE_KEYSTORE_PASSWORD; echo
read -r -s -p "Repeat: " REPEAT; echo
[ "$RELEASE_KEYSTORE_PASSWORD" = "$REPEAT" ] || { echo "passwords differ" >&2; exit 1; }
[ ${#RELEASE_KEYSTORE_PASSWORD} -ge 8 ] || { echo "use at least 8 characters" >&2; exit 1; }
export RELEASE_KEYSTORE_PASSWORD

keytool -genkeypair -keystore "$OUT_DIR/release.jks" -storetype PKCS12 \
  -storepass:env RELEASE_KEYSTORE_PASSWORD -keypass:env RELEASE_KEYSTORE_PASSWORD \
  -alias "$KEY_ALIAS" -keyalg RSA -keysize 4096 -validity 36500 \
  -dname "CN=Pillminder, O=Pillminder"

"$APKSIGNER" rotate --out "$OUT_DIR/lineage" \
  --old-signer --set-rollback true \
  --ks "$OLD_KEYSTORE" --ks-key-alias "$OLD_ALIAS" --ks-pass env:OLD_KEYSTORE_PASSWORD \
  --new-signer --ks "$OUT_DIR/release.jks" --ks-key-alias "$KEY_ALIAS" --ks-pass env:RELEASE_KEYSTORE_PASSWORD

cp "$OLD_KEYSTORE" "$OUT_DIR/old-debug.keystore"
base64 < "$OUT_DIR/release.jks" | tr -d '\n' > "$OUT_DIR/release.jks.base64"
base64 < "$OUT_DIR/lineage" | tr -d '\n' > "$OUT_DIR/lineage.base64"
chmod 600 "$OUT_DIR"/*

echo
echo "Lineage:"
"$APKSIGNER" lineage --in "$OUT_DIR/lineage" --print-certs --verbose | grep -E 'certificate SHA-256|capability'
echo
echo "New release cert SHA-256: $(cert_sha256 "$OUT_DIR/release.jks" RELEASE_KEYSTORE_PASSWORD "$KEY_ALIAS")"
cat <<MSG

Files in $OUT_DIR (back them up, e.g. in a password manager; losing release.jks
or lineage means no more in-place updates):
  release.jks, lineage, old-debug.keystore, *.base64

GitHub secrets (run in the repo, you will be prompted for the password;
use the one you just chose, it also protects the key):
  gh secret set RELEASE_KEYSTORE_BASE64 < "$OUT_DIR/release.jks.base64"
  gh secret set RELEASE_LINEAGE_BASE64 < "$OUT_DIR/lineage.base64"
  gh secret set RELEASE_KEYSTORE_PASSWORD
  gh secret set RELEASE_KEY_ALIAS --body $KEY_ALIAS

Then put the new cert SHA-256 into CLAUDE.md, delete *.base64 and merge.
MSG
