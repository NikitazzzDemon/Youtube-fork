#!/usr/bin/env bash

# GlassTube VPS Proxy - Interactive Uninstaller
set -e

# Color Palette
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "\n${BOLD}${RED}========================================================================${NC}"
echo -e "${BOLD}${RED}           GlassTube VPS Proxy - Complete Uninstaller                   ${NC}"
echo -e "${BOLD}${RED}========================================================================${NC}\n"

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Please run this uninstaller as root or using sudo.${NC}"
  exit 1
fi

# Rebind stdin if piped
if [ ! -t 0 ] && [ -c /dev/tty ]; then
  exec < /dev/tty
fi

read -p "Are you sure you want to remove GlassTube and clean up services? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Uninstallation cancelled.${NC}"
  exit 0
fi

INSTALL_DIR="/opt/glasstube"

echo -e "\n${CYAN}[1/4] Stopping and removing GlassTube Docker containers...${NC}"
if [ -d "$INSTALL_DIR" ]; then
  cd "$INSTALL_DIR" 2>/dev/null || true
  if command -v docker &>/dev/null; then
    docker compose down -v --remove-orphans 2>/dev/null || true
    docker rm -f glasstube_vps 2>/dev/null || true
  fi
fi

echo -e "${CYAN}[2/4] Removing installation directory $INSTALL_DIR...${NC}"
rm -rf "$INSTALL_DIR"

echo -e "${CYAN}[3/4] Stopping Caddy web proxy & clearing Caddyfile...${NC}"
if systemctl is-active --quiet caddy 2>/dev/null; then
  systemctl stop caddy 2>/dev/null || true
  systemctl disable caddy 2>/dev/null || true
fi
if [ -f /etc/caddy/Caddyfile ]; then
  rm -f /etc/caddy/Caddyfile
fi

echo -e "${CYAN}[4/4] Cleaning up UFW Firewall rules...${NC}"
if command -v ufw &>/dev/null; then
  ufw delete allow 'GlassTube HTTP' 2>/dev/null || true
  ufw delete allow 'GlassTube HTTPS' 2>/dev/null || true
  ufw delete allow 'GlassTube App Internal' 2>/dev/null || true
fi

echo -e "\n${GREEN}${BOLD}========================================================================${NC}"
echo -e "${GREEN}    GlassTube has been completely removed from your VPS server.          ${NC}"
echo -e "${GREEN}========================================================================${NC}\n"
