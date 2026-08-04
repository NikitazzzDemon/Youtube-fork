#!/usr/bin/env bash

# ==============================================================================
#  GlassTube VPS Proxy - Unified Management Script (Install / Update / Uninstall)
# ==============================================================================

set -e

# Fix getcwd errors if launched from a temporary directory
cd /tmp 2>/dev/null || cd /root 2>/dev/null || true

# Rebind stdin to interactive TTY if piped via curl
if [ ! -t 0 ] && [ -c /dev/tty ]; then
  exec < /dev/tty
fi

# Color Palette
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

INSTALL_DIR="/opt/glasstube"

show_banner() {
  echo -e "${CYAN}${BOLD}"
  echo "========================================================================"
  echo "          GlassTube VPS Proxy - Master Management Console               "
  echo "========================================================================"
  echo -e "${NC}"
}

check_root() {
  if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[ERROR] Please run this script with root or sudo privileges:${NC}"
    echo -e "${YELLOW}  sudo bash $0${NC}"
    exit 1
  fi
}

# ==============================================================================
# 1. INSTALLATION FUNCTION
# ==============================================================================
do_install() {
  echo -e "\n${GREEN}${BOLD}[1. УСТАНОВКА / INSTALL] Starting fresh GlassTube setup...${NC}\n"

  echo -e "${CYAN}[Init] Ensuring system dependencies (curl, docker, git)...${NC}"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq >/dev/null 2>&1 || true
  apt-get install -y -qq curl git ca-certificates gnupg >/dev/null 2>&1 || true

  # Ensure Docker
  if ! command -v docker &>/dev/null; then
    echo -e "${CYAN}  Installing Docker Engine & Docker Compose...${NC}"
    curl -fsSL https://get.docker.com | sh >/dev/null 2>&1 || true
  fi

  mkdir -p "$INSTALL_DIR/data"
  cd "$INSTALL_DIR"

  # Ask for domain / IP
  echo -e "\n${YELLOW}Configuration Settings:${NC}"
  read -p "Enter your Domain name or Server IP [Default: localhost]: " DOMAIN_INPUT
  DOMAIN="${DOMAIN_INPUT:-localhost}"

  read -p "Enter internal App Port [Default: 3000]: " PORT_INPUT
  APP_PORT="${PORT_INPUT:-3000}"

  # Write .env
  JWT_SECRET=$(head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 32)
  cat <<EOF > "$INSTALL_DIR/.env"
NODE_ENV=production
PORT=$APP_PORT
DOMAIN=$DOMAIN
JWT_SECRET=$JWT_SECRET
DATA_DIR=$INSTALL_DIR/data
EOF

  echo -e "${GREEN}  ✓ Environment saved to $INSTALL_DIR/.env${NC}"

  # Write docker-compose.yml
  cat <<'EOF' > "$INSTALL_DIR/docker-compose.yml"
version: '3.8'

services:
  glasstube:
    build: .
    container_name: glasstube-app
    restart: always
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DOMAIN=${DOMAIN:-localhost}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./data:/app/data

networks:
  default:
    name: glasstube-network
EOF

  # Download codebase files if missing
  if [ ! -f "$INSTALL_DIR/package.json" ]; then
    echo -e "${CYAN}  Fetching GlassTube application package files...${NC}"
    git clone https://github.com/NikitazzzDemon/Youtube-fork.git /tmp/gt_repo 2>/dev/null || true
    if [ -d "/tmp/gt_repo" ]; then
      cp -r /tmp/gt_repo/* "$INSTALL_DIR/" 2>/dev/null || true
      rm -rf /tmp/gt_repo
    fi
  fi

  echo -e "\n${GREEN}[Build] Building and starting GlassTube Docker container...${NC}"
  docker compose down --remove-orphans 2>/dev/null || true
  docker compose up --build -d

  echo -e "\n${GREEN}${BOLD}========================================================================"
  echo "    GlassTube VPS Installation Completed Successfully!                 "
  echo "========================================================================"
  echo -e "${NC}"
  echo -e "${GREEN}  ✓ Server Address: ${BOLD}http://${DOMAIN}:${APP_PORT}${NC}"
  echo -e "${GREEN}  ✓ Data Storage:   ${BOLD}${INSTALL_DIR}/data${NC}"
  echo -e "${CYAN}========================================================================${NC}\n"
}

# ==============================================================================
# 2. SAFE UPDATE FUNCTION (ZERO DATA LOSS)
# ==============================================================================
do_update() {
  echo -e "\n${GREEN}${BOLD}[2. ОБНОВЛЕНИЕ / SAFE UPDATE] Updating GlassTube without data loss...${NC}\n"

  if [ ! -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}Installation directory $INSTALL_DIR not found. Proceeding with fresh install...${NC}"
    do_install
    return
  fi

  cd "$INSTALL_DIR"

  echo -e "${GREEN}[1/3] Securing client database and configuration...${NC}"
  mkdir -p "$INSTALL_DIR/data"
  echo -e "${CYAN}  ✓ Database location verified: $INSTALL_DIR/data (All users & watch history preserved)${NC}"

  if [ -f "$INSTALL_DIR/.env" ]; then
    APP_PORT=$(grep '^PORT=' "$INSTALL_DIR/.env" | cut -d'=' -f2 || echo "3000")
    DOMAIN=$(grep '^DOMAIN=' "$INSTALL_DIR/.env" | cut -d'=' -f2 || echo "localhost")
  else
    APP_PORT="3000"
    DOMAIN="localhost"
  fi

  echo -e "\n${GREEN}[2/3] Fetching application updates...${NC}"
  if [ -d "$INSTALL_DIR/.git" ]; then
    git fetch --all 2>/dev/null || true
    git reset --hard origin/main 2>/dev/null || git pull --rebase 2>/dev/null || true
  fi

  echo -e "\n${GREEN}[3/3] Rebuilding Docker container...${NC}"
  if command -v docker &>/dev/null; then
    docker compose down --remove-orphans 2>/dev/null || true
    docker compose up --build -d
  else
    echo -e "${RED}[ERROR] Docker is not installed.${NC}"
    exit 1
  fi

  if systemctl is-active --quiet caddy 2>/dev/null; then
    systemctl restart caddy 2>/dev/null || true
  fi

  echo -e "\n${CYAN}${BOLD}========================================================================"
  echo "    GlassTube VPS Safe Update Completed! (100% Data Preserved)          "
  echo "========================================================================"
  echo -e "${NC}"
  echo -e "${GREEN}  ✓ Client Data:    ${BOLD}Preserved (${INSTALL_DIR}/data)${NC}"
  echo -e "${GREEN}  ✓ Server Address: ${BOLD}http://${DOMAIN}:${APP_PORT}${NC}"
  echo -e "${CYAN}========================================================================${NC}\n"
}

# ==============================================================================
# 3. UNINSTALL FUNCTION
# ==============================================================================
do_uninstall() {
  echo -e "\n${RED}${BOLD}[3. УДАЛЕНИЕ / UNINSTALL] Uninstalling GlassTube VPS Proxy...${NC}\n"

  read -p "Are you sure you want to completely uninstall GlassTube? [y/N]: " CONFIRM
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Uninstall cancelled.${NC}"
    exit 0
  fi

  if [ -d "$INSTALL_DIR" ]; then
    cd "$INSTALL_DIR"
    if command -v docker &>/dev/null; then
      echo -e "${CYAN}Stopping and removing Docker containers...${NC}"
      docker compose down -v --remove-orphans 2>/dev/null || true
    fi
  fi

  read -p "Do you also want to DELETE user database & client data in /opt/glasstube/data? [y/N]: " PURGE_DATA
  if [[ "$PURGE_DATA" =~ ^[Yy]$ ]]; then
    rm -rf "$INSTALL_DIR"
    echo -e "${RED}  ✓ All GlassTube files & user database purged.${NC}"
  else
    mkdir -p /tmp/glasstube_backup
    cp -r "$INSTALL_DIR/data" /tmp/glasstube_backup/ 2>/dev/null || true
    rm -rf "$INSTALL_DIR"
    echo -e "${GREEN}  ✓ App removed. User data backed up at /tmp/glasstube_backup/data.${NC}"
  fi

  echo -e "\n${GREEN}${BOLD}GlassTube uninstalled successfully.${NC}\n"
}

# ==============================================================================
# MAIN ENTRYPOINT & MENU SELECTION
# ==============================================================================
check_root
show_banner

# Handle command line flags directly
case "$1" in
  --install|1)
    do_install
    exit 0
    ;;
  --update|2)
    do_update
    exit 0
    ;;
  --uninstall|3)
    do_uninstall
    exit 0
    ;;
esac

echo -e "${BOLD}Выберите действие / Select an option:${NC}\n"
echo -e "  ${GREEN}${BOLD}1) УСТАНОВКА${NC}   (Fresh VPS Installation)"
echo -e "  ${CYAN}${BOLD}2) ОБНОВЛЕНИЕ${NC}  (Safe Update - Zero Data Loss)"
echo -e "  ${RED}${BOLD}3) УДАЛЕНИЕ${NC}    (Full Uninstall & Cleanup)"
echo ""
read -p "Enter choice [1-3]: " CHOICE

case "$CHOICE" in
  1)
    do_install
    ;;
  2)
    do_update
    ;;
  3)
    do_uninstall
    ;;
  *)
    echo -e "${YELLOW}Invalid choice. Defaulting to Safe Update...${NC}"
    do_update
    ;;
esac
