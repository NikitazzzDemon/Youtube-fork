#!/usr/bin/env bash
# Forwarder script for GlassTube Safe Update
if [ -f "/opt/glasstube/install.sh" ]; then
  exec bash /opt/glasstube/install.sh --update "$@"
elif [ -f "/tmp/install.sh" ]; then
  exec bash /tmp/install.sh --update "$@"
else
  curl -fsSL -o /tmp/install.sh https://raw.githubusercontent.com/NikitazzzDemon/Youtube-fork/main/install.sh 2>/dev/null || curl -fsSL -o /tmp/install.sh http://localhost:3000/install.sh 2>/dev/null || true
  exec bash /tmp/install.sh --update "$@"
fi
