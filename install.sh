#!/usr/bin/env bash

# ==============================================================================
#  GlassTube VPS Interactive 1-Step Installer
#  Feature Highlights:
#  - Interactive Port Entry & Active Port Conflict Checks (ss/lsof/fuser)
#  - Domain Validation & DNS Resolution Check
#  - Automatic Firewall (UFW) & Conflicting Process Cleanup
#  - Docker CE + Caddy Web Server + Auto SSL (Let's Encrypt)
#  - Unattended Deployment after configuration
# ==============================================================================

set -e

# Fix getcwd errors if user launched script from a deleted directory
cd /tmp 2>/dev/null || cd /root 2>/dev/null || true

# Rebind stdin to interactive TTY if piped via curl
if [ ! -t 0 ]; then
  if [ -c /dev/tty ]; then
    exec < /dev/tty
  else
    echo -e "\033[0;31m[ERROR] Interactive input required. Please run via file download:\033[0m"
    echo -e "\033[1;33m  curl -fsSL -o /tmp/install.sh https://raw.githubusercontent.com/NikitazzzDemon/Youtube-fork/main/install.sh && sudo bash /tmp/install.sh\033[0m"
    exit 1
  fi
fi

# Color Palette
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "========================================================================"
echo "       GlassTube Private YouTube VPS Proxy - Interactive Installer      "
echo "========================================================================"
echo -e "${NC}"

# 1. Root Privileges Check
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Please run this installer with root or sudo:${NC}"
  echo -e "${YELLOW}  sudo bash $0${NC}"
  exit 1
fi

# Always force working directory to /opt/glasstube right away
INSTALL_DIR="/opt/glasstube"
mkdir -p "$INSTALL_DIR/data"
cd "$INSTALL_DIR" 2>/dev/null || true

# Ensure basic resolution & network diagnostic tools are present
echo -e "${CYAN}[Init] Updating package index & ensuring core utilities (curl, ss, dnsutils, git)...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y -q >/dev/null 2>&1 || true
apt-get install -y -q curl net-tools iproute2 dnsutils ufw ca-certificates git >/dev/null 2>&1 || true

# Function to validate integer port range
validate_port() {
  local port=$1
  if [[ ! "$port" =~ ^[0-9]+$ ]] || [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
    return 1
  fi
  return 0
}

# Function to check if a port is currently bound
is_port_in_use() {
  local port=$1
  if command -v ss &>/dev/null; then
    ss -tuln | grep -q ":${port} "
  elif command -v netstat &>/dev/null; then
    netstat -tuln | grep -q ":${port} "
  else
    (echo > /dev/tcp/127.0.0.1/"$port") &>/dev/null
  fi
}

echo -e "\n${BOLD}${MAGENTA}--- STEP 1: PORT CONFIGURATION & VERIFICATION ---${NC}"
echo -e "${CYAN}Tip: To access your site directly (e.g. https://yourdomain.com) WITHOUT typing a port number in your browser, use standard ports:${NC}"
echo -e "  ${BOLD}HTTP Port: 80 | HTTPS Port: 443${NC}\n"
echo -e "${CYAN}Note for Cloudflare Users (Orange Cloud 🧡):${NC}"
echo -e "Cloudflare HTTPS supported ports: ${BOLD}443, 8443, 2053, 2083, 2087, 2096${NC}"
echo -e "Cloudflare HTTP supported ports:  ${BOLD}80, 8080, 8880, 2052, 2082, 2086, 2092${NC}\n"

# Prompt & Validate HTTP Port
while true; do
  read -p "Enter HTTP Port [Default: 80, CF: 8080]: " INPUT_HTTP
  HTTP_PORT="${INPUT_HTTP:-80}"
  if validate_port "$HTTP_PORT"; then
    echo -e "${GREEN}  ✓ Port $HTTP_PORT is valid.${NC}"
    break
  else
    echo -e "${RED}  ✗ Invalid port number. Enter a number between 1 and 65535.${NC}"
  fi
done

# Prompt & Validate HTTPS Port
while true; do
  read -p "Enter HTTPS Port [Default: 443, CF: 8443]: " INPUT_HTTPS
  HTTPS_PORT="${INPUT_HTTPS:-443}"
  if ! validate_port "$HTTPS_PORT"; then
    echo -e "${RED}  ✗ Invalid port number. Enter a number between 1 and 65535.${NC}"
  elif [ "$HTTPS_PORT" -eq "$HTTP_PORT" ]; then
    echo -e "${RED}  ✗ HTTPS port cannot be identical to HTTP port ($HTTP_PORT).${NC}"
  else
    echo -e "${GREEN}  ✓ Port $HTTPS_PORT is valid.${NC}"
    break
  fi
done

# Prompt & Validate Internal App Port
while true; do
  read -p "Enter Internal App Port [Default: 3000]: " INPUT_APP
  APP_PORT="${INPUT_APP:-3000}"
  if ! validate_port "$APP_PORT"; then
    echo -e "${RED}  ✗ Invalid port number. Enter a number between 1 and 65535.${NC}"
  elif [ "$APP_PORT" -eq "$HTTP_PORT" ] || [ "$APP_PORT" -eq "$HTTPS_PORT" ]; then
    echo -e "${RED}  ✗ App port cannot collide with HTTP ($HTTP_PORT) or HTTPS ($HTTPS_PORT).${NC}"
  else
    echo -e "${GREEN}  ✓ Port $APP_PORT is valid.${NC}"
    break
  fi
done

# Check for Port Collisions on Server
echo -e "\n${CYAN}Checking port availability on this server...${NC}"

for CHECK_PORT in "$HTTP_PORT" "$HTTPS_PORT" "$APP_PORT"; do
  if is_port_in_use "$CHECK_PORT"; then
    echo -e "${YELLOW}[WARNING] Port $CHECK_PORT is currently in use by another process!${NC}"
    
    # Check if Apache or legacy Nginx is running
    if systemctl is-active --quiet apache2 2>/dev/null; then
      echo -e "${YELLOW}  Found active Apache2 server. Stopping Apache2 to free port $CHECK_PORT...${NC}"
      systemctl stop apache2 2>/dev/null || true
      systemctl disable apache2 2>/dev/null || true
    fi

    if systemctl is-active --quiet nginx 2>/dev/null; then
      echo -e "${YELLOW}  Found active legacy Nginx server. Stopping Nginx to replace with Caddy...${NC}"
      systemctl stop nginx 2>/dev/null || true
      systemctl disable nginx 2>/dev/null || true
    fi

    # Re-verify port status
    if is_port_in_use "$CHECK_PORT"; then
      echo -e "${YELLOW}  Port $CHECK_PORT is still occupied. The installer will clean up conflicting processes during deployment.${NC}"
    else
      echo -e "${GREEN}  ✓ Port $CHECK_PORT freed successfully!${NC}"
    fi
  else
    echo -e "${GREEN}  ✓ Port $CHECK_PORT is free and ready.${NC}"
  fi
done


echo -e "\n${BOLD}${MAGENTA}--- STEP 2: DOMAIN CONFIGURATION & DNS VERIFICATION ---${NC}\n"

while true; do
  read -p "Enter your Domain Name (e.g. tube.yourdomain.com): " DOMAIN
  if [ -z "$DOMAIN" ]; then
    echo -e "${RED}  ✗ Domain name cannot be empty. Please enter your domain.${NC}"
  else
    # Simple regex format check
    if [[ "$DOMAIN" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
      echo -e "${GREEN}  ✓ Domain format validated: $DOMAIN${NC}"
      
      # Attempt DNS lookup check
      echo -e "${CYAN}  Verifying DNS record for $DOMAIN...${NC}"
      RESOLVED_IP=$(getent hosts "$DOMAIN" | awk '{ print $1 }' | head -n 1)
      SERVER_IP=$(curl -sSL https://api.ipify.org || echo "unknown")

      if [ -n "$RESOLVED_IP" ]; then
        echo -e "${GREEN}  ✓ DNS Resolution Success: $DOMAIN -> $RESOLVED_IP${NC}"
        if [ "$RESOLVED_IP" = "$SERVER_IP" ]; then
          echo -e "${GREEN}  ✓ Direct IP match! Domain points straight to this VPS ($SERVER_IP).${NC}"
        else
          echo -e "${YELLOW}  ! Note: VPS IP is $SERVER_IP, domain resolves to $RESOLVED_IP (likely Cloudflare Proxy 🧡 or external DNS).${NC}"
        fi
      else
        echo -e "${YELLOW}  ! Warning: $DOMAIN does not resolve to an IP yet. Ensure your A record is configured.${NC}"
      fi

      echo -e "\n${CYAN}--- SSL & Proxy Configuration Mode ---${NC}"
      DEFAULT_CF="n"
      if [ -n "$RESOLVED_IP" ] && [ "$RESOLVED_IP" != "$SERVER_IP" ]; then
        DEFAULT_CF="y"
        echo -e "${YELLOW}  ! Domain resolves to Cloudflare Proxy IP ($RESOLVED_IP). Cloudflare Proxy Mode is recommended.${NC}"
      fi

      read -p "Use Cloudflare Proxy Mode? (y/N) [Default: $DEFAULT_CF]: " IS_CF_INPUT
      IS_CF_ANSWER="${IS_CF_INPUT:-$DEFAULT_CF}"
      IS_CF=$(echo "$IS_CF_ANSWER" | tr '[:upper:]' '[:lower:]')

      USE_TLS_INTERNAL="no"
      if [[ "$IS_CF" =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}  ✓ Cloudflare Proxy Mode Selected.${NC}"
        
        if [ "$HTTPS_PORT" -ne 443 ] && [ "$HTTPS_PORT" -ne 8443 ] && [ "$HTTPS_PORT" -ne 2053 ] && [ "$HTTPS_PORT" -ne 2083 ] && [ "$HTTPS_PORT" -ne 2087 ] && [ "$HTTPS_PORT" -ne 2096 ]; then
          echo -e "${RED}[WARNING] Port $HTTPS_PORT is NOT supported by Cloudflare Proxy!${NC}"
          echo -e "${YELLOW}Cloudflare HTTPS proxy only supports ports: 443, 8443, 2053, 2083, 2087, 2096.${NC}"
          read -p "Would you like to reset HTTPS Port to 2053 for Cloudflare compatibility? (Y/n): " RESET_PORT_INPUT
          RESET_PORT=$(echo "${RESET_PORT_INPUT:-y}" | tr '[:upper:]' '[:lower:]')
          if [[ "$RESET_PORT" =~ ^[Yy]$ ]]; then
            HTTPS_PORT=2053
            HTTP_PORT=2052
            echo -e "${GREEN}  ✓ Reset HTTPS port to 2053 and HTTP port to 2052 (Cloudflare Compatible).${NC}"
          fi
        fi

        USE_TLS_INTERNAL="yes"
        echo -e "${GREEN}  ✓ Configured Caddy with 'tls internal' for Cloudflare FULL SSL Mode.${NC}"
      else
        echo -e "${GREEN}  ✓ Direct VPS Mode Selected (DNS Only / No Cloudflare Proxy).${NC}"
        echo -e "\nSelect SSL Certificate Issue Mode:"
        echo -e "  ${BOLD}1) Let's Encrypt Official Auto-SSL (Recommended)${NC} - Valid green lock in all browsers."
        echo -e "     (Requires Port 80 to be open for domain validation)."
        echo -e "  ${BOLD}2) Internal Self-Signed SSL (tls internal)${NC} - For VPS with blocked Port 80."
        read -p "Select SSL Mode [1/2, Default: 1]: " SSL_MODE_INPUT
        SSL_MODE="${SSL_MODE_INPUT:-1}"
        
        if [ "$SSL_MODE" = "2" ]; then
          USE_TLS_INTERNAL="yes"
          echo -e "${YELLOW}  ! Using 'tls internal' self-signed SSL certificate.${NC}"
        else
          USE_TLS_INTERNAL="no"
          echo -e "${GREEN}  ✓ Using Let's Encrypt Official Auto-SSL.${NC}"
        fi
      fi

      break
    else
      echo -e "${RED}  ✗ Invalid domain format. Example format: tube.yourdomain.com${NC}"
    fi
  fi
done


echo -e "\n${BOLD}${MAGENTA}--- STEP 3: AUTOMATIC UNATTENDED INSTALLATION ---${NC}"
echo -e "${CYAN}All parameters verified. Starting automated deployment now...${NC}\n"

# 1. Configure UFW Firewall for user-selected ports
echo -e "${GREEN}[1/5] Configuring UFW Firewall for Ports (SSH 22, HTTP 80/ACME, HTTP $HTTP_PORT, HTTPS $HTTPS_PORT, App $APP_PORT)...${NC}"
ufw allow 22/tcp comment 'SSH' >/dev/null 2>&1 || true
ufw allow 80/tcp comment 'Let Encrypt ACME' >/dev/null 2>&1 || true
ufw allow "$HTTP_PORT/tcp" comment 'GlassTube HTTP' >/dev/null 2>&1 || true
ufw allow "$HTTPS_PORT/tcp" comment 'GlassTube HTTPS' >/dev/null 2>&1 || true
ufw allow "$APP_PORT/tcp" comment 'GlassTube App Internal' >/dev/null 2>&1 || true
ufw --force enable >/dev/null 2>&1 || true

# 2. Install Docker CE if missing
echo -e "${GREEN}[2/5] Ensuring Docker & Docker Compose plugin...${NC}"
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
else
  systemctl enable --now docker
fi

# 3. Install Caddy Web Server if missing
echo -e "${GREEN}[3/5] Installing Caddy Web Server for Automatic SSL/TLS...${NC}"
if ! command -v caddy &> /dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg --yes >/dev/null 2>&1
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null 2>&1
  apt-get update -y -q >/dev/null 2>&1
  apt-get install -y -q caddy >/dev/null 2>&1
fi

# 4. Deploy GlassTube Files & Docker Setup
INSTALL_DIR="/opt/glasstube"
echo -e "${GREEN}[4/5] Deploying GlassTube container files to ${INSTALL_DIR}...${NC}"

mkdir -p "$INSTALL_DIR/data"

# Check if running script inside existing cloned repo directory
if [ -f "./package.json" ] && [ -f "./Dockerfile" ]; then
  echo -e "${CYAN}  Copying source code files into ${INSTALL_DIR}...${NC}"
  cp -r ./* "$INSTALL_DIR/" 2>/dev/null || true
elif [ ! -f "$INSTALL_DIR/package.json" ]; then
  echo -e "${CYAN}  Cloning GlassTube source repository from GitHub...${NC}"
  git clone https://github.com/NikitazzzDemon/Youtube-fork.git "$INSTALL_DIR" 2>/dev/null || {
    curl -fsSL https://github.com/NikitazzzDemon/Youtube-fork/archive/refs/heads/main.tar.gz | tar -xz -C "$INSTALL_DIR" --strip-components=1
  }
else
  echo -e "${CYAN}  Updating GlassTube source code from GitHub...${NC}"
  (cd "$INSTALL_DIR" && git pull origin main 2>/dev/null || true)
fi

cd "$INSTALL_DIR"

JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "gt_vps_secret_$(date +%s)")

cat <<EOF > "$INSTALL_DIR/.env"
NODE_ENV=production
PORT=$APP_PORT
JWT_SECRET=$JWT_SECRET
DOMAIN=$DOMAIN
EOF

cat <<EOF > "$INSTALL_DIR/docker-compose.yml"
services:
  glasstube:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: glasstube_vps
    restart: always
    ports:
      - "127.0.0.1:${APP_PORT}:${APP_PORT}"
    environment:
      - NODE_ENV=production
      - PORT=${APP_PORT}
      - JWT_SECRET=${JWT_SECRET}
      - DOMAIN=${DOMAIN}
    volumes:
      - ./data:/app/data
EOF

# 5. Configure Caddy & Launch
echo -e "${GREEN}[5/5] Writing Caddyfile reverse proxy & launching Docker container...${NC}"

# Ensure conflicting Apache or Nginx servers or orphan processes on port 80 are stopped so Caddy can bind
if systemctl is-active --quiet apache2 2>/dev/null; then
  systemctl stop apache2 2>/dev/null || true
  systemctl disable apache2 2>/dev/null || true
fi
if systemctl is-active --quiet nginx 2>/dev/null; then
  systemctl stop nginx 2>/dev/null || true
  systemctl disable nginx 2>/dev/null || true
fi
fuser -k 80/tcp 2>/dev/null || true

if [ "$USE_TLS_INTERNAL" = "yes" ]; then
  cat <<EOF > /etc/caddy/Caddyfile
# GlassTube Caddy Proxy Configuration (Internal SSL / Cloudflare Proxy)
{
    auto_https disable_redirects
}

# Plain HTTP endpoint
http://${DOMAIN}:${HTTP_PORT} {
    reverse_proxy 127.0.0.1:${APP_PORT} {
        header_up Host {http.request.host}
        header_up X-Real-IP {http.request.remote.host}
        header_up X-Forwarded-For {http.request.remote.host}
        header_up X-Forwarded-Proto {http.request.scheme}
        flush_interval -1
    }
}

# HTTPS endpoint with self-signed SSL
https://${DOMAIN}:${HTTPS_PORT} {
    tls internal
    reverse_proxy 127.0.0.1:${APP_PORT} {
        header_up Host {http.request.host}
        header_up X-Real-IP {http.request.remote.host}
        header_up X-Forwarded-For {http.request.remote.host}
        header_up X-Forwarded-Proto {http.request.scheme}
        flush_interval -1
    }
}
EOF
else
  cat <<EOF > /etc/caddy/Caddyfile
# GlassTube Caddy Proxy Configuration (HTTP Port 80 / Custom Ports)
{
    auto_https off
}

http://${DOMAIN}:${HTTP_PORT} {
    reverse_proxy 127.0.0.1:${APP_PORT} {
        header_up Host {http.request.host}
        header_up X-Real-IP {http.request.remote.host}
        header_up X-Forwarded-For {http.request.remote.host}
        header_up X-Forwarded-Proto {http.request.scheme}
        flush_interval -1
    }
}
EOF
fi

systemctl restart caddy

echo -e "${CYAN}  Building Docker image and starting GlassTube container (this may take ~1-2 min on first run)...${NC}"
docker compose down --remove-orphans 2>/dev/null || true
docker compose up --build -d

echo -e "${CYAN}  Waiting for GlassTube server to respond on port ${APP_PORT}...${NC}"
WAIT_COUNT=0
until curl -sSL -f "http://127.0.0.1:${APP_PORT}/" >/dev/null 2>&1 || curl -sSL -f "http://127.0.0.1:${APP_PORT}/api/vps/stats" >/dev/null 2>&1 || [ $WAIT_COUNT -ge 60 ]; do
  sleep 2
  WAIT_COUNT=$((WAIT_COUNT + 2))
  echo -n "."
done
echo ""

if [ $WAIT_COUNT -lt 60 ]; then
  echo -e "${GREEN}  ✓ Backend container is alive and responding on port ${APP_PORT}!${NC}"
else
  echo -e "${YELLOW}  ! Backend container is taking longer than expected to build/start. Check logs with: docker compose logs -f${NC}"
fi

echo -e "\n${CYAN}${BOLD}========================================================================"
echo "      GlassTube VPS Proxy - Installation Completed Successfully!        "
echo "========================================================================"
echo -e "${NC}"
if [ "$HTTPS_PORT" -eq 443 ]; then
  echo -e "${GREEN}  ✓ Secure Application URL:${BOLD} https://$DOMAIN${NC}"
else
  echo -e "${GREEN}  ✓ Secure Application URL:${BOLD} https://$DOMAIN:$HTTPS_PORT${NC}"
fi
echo -e "${GREEN}  ✓ HTTP Direct Access:    ${BOLD} http://$DOMAIN:$HTTP_PORT${NC}"
echo -e "${GREEN}  ✓ Internal App Port:     ${BOLD} $APP_PORT${NC}"

if [ "$USE_TLS_INTERNAL" = "yes" ]; then
  echo ""
  echo -e "${YELLOW}${BOLD}⚠️  CLOUDFLARE SETTING REQUIRED TO FIX 502 BAD GATEWAY:${NC}"
  echo -e "  Go to Cloudflare Dashboard -> ${BOLD}SSL/TLS${NC} -> ${BOLD}Overview${NC}"
  echo -e "  Set SSL/TLS Encryption Mode to: ${GREEN}${BOLD}Full${NC} (or ${GREEN}${BOLD}Full (strict)${NC} if using origin cert)"
  echo -e "  ${RED}Do NOT use 'Flexible'${NC} (causes 502 Bad Gateway because Cloudflare connects over HTTP to HTTPS port)."
fi

echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  - View Live Caddy SSL Logs: ${BOLD}journalctl -u caddy -f${NC}"
echo -e "  - View App Logs:           ${BOLD}cd /opt/glasstube && docker compose logs -f${NC}"
echo -e "  - Restart Proxy Container: ${BOLD}cd /opt/glasstube && docker compose restart${NC}"
echo -e "${CYAN}========================================================================${NC}\n"
