#!/usr/bin/env bash
cat >/dev/null
if CI=true yarn test >&2; then
  echo '{"permission":"allow"}'
  exit 0
else
  echo '{"permission":"deny","user_message":"Unit tests failed; commit blocked.","agent_message":"yarn test failed"}'
  exit 2
fi
