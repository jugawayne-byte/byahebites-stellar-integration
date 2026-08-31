#!/usr/bin/env sh
set -eu

frontend_source="artifacts/byahebites-stellar-integration/dist/public"
frontend_target="artifacts/byahebites-stellar-integration/.deployment/public"
api_source="artifacts/api-server/dist"
api_target="artifacts/api-server/.deployment"

test -f "$frontend_source/index.html"
test -f "$api_source/index.mjs"

rm -rf "$frontend_target" "$api_target"
mkdir -p "$frontend_target" "$api_target"

cp -R "$frontend_source"/. "$frontend_target"/
cp -R "$api_source"/. "$api_target"/

pnpm store prune
echo "Deployment outputs prepared."