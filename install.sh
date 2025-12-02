#!/bin/bash
set -e

# --- Colors ---
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
RESET="\033[0m"

echo -e "${BLUE}╔════════════════════════════════════════╗${RESET}"
echo -e "${BLUE}║  ft_transcendence Installation Script ║${RESET}"
echo -e "${BLUE}╚════════════════════════════════════════╝${RESET}"

# --- Install nvm if missing ---
echo -e "\n${YELLOW}🔍 Checking Node.js installation...${RESET}"

if ! command -v nvm &> /dev/null; then
  echo -e "${YELLOW}📦 nvm not found, installing...${RESET}"
  export NVM_DIR="$HOME/.nvm"
  mkdir -p "$NVM_DIR"
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  # Load nvm into current shell
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
else
  echo -e "${GREEN}✅ nvm is already installed${RESET}"
fi

# --- Load nvm (important if just installed) ---
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# --- Ensure Node.js is installed ---
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}⚙️ Installing latest LTS version of Node.js...${RESET}"
  nvm install --lts
else
  echo -e "${GREEN}✅ Node.js already installed: $(node -v)${RESET}"
fi

# ═══════════════════════════════════════════════════════════════
# FRONTEND SETUP (Next.js)
# ═══════════════════════════════════════════════════════════════

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BLUE}       FRONTEND SETUP (Next.js)${RESET}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

FRONT_DIR="$(pwd)/front"

if [ -d "$FRONT_DIR" ]; then
  cd "$FRONT_DIR"
  
  if [ -f "package.json" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${RESET}"
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed!${RESET}"
  else
    echo -e "${YELLOW}⚠️  No package.json found in front/. Skipping frontend.${RESET}"
  fi
else
  echo -e "${YELLOW}⚠️  front/ directory not found. Skipping frontend.${RESET}"
fi

# ═══════════════════════════════════════════════════════════════
# BACKEND SETUP (Fastify + SQLite)
# ═══════════════════════════════════════════════════════════════

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BLUE}     BACKEND SETUP (Fastify + SQLite)${RESET}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

BACK_DIR="$(pwd)/../back"

if [ -d "$BACK_DIR" ]; then
  cd "$BACK_DIR"
  
  if [ -f "package.json" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${RESET}"
    npm install
    echo -e "${YELLOW}📦 Installing cookie and CORS plugins for auth...${RESET}"
    npm install @fastify/cookie @fastify/cors
    echo -e "${YELLOW}📦 Installing OAuth2 plugin for Google authentication...${RESET}"
    npm install @fastify/oauth2
    echo -e "${GREEN}✅ Backend dependencies installed!${RESET}"
  else
    echo -e "${YELLOW}⚠️  No package.json found in back/. Skipping backend.${RESET}"
  fi
else
  echo -e "${YELLOW}⚠️  back/ directory not found. Skipping backend.${RESET}"
fi

# ═══════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════

echo -e "\n${BLUE}╔════════════════════════════════════════╗${RESET}"
echo -e "${BLUE}║         Installation Complete! 🎉      ║${RESET}"
echo -e "${BLUE}╚════════════════════════════════════════╝${RESET}"

echo -e "\n${GREEN}✅ Frontend (Next.js):${RESET}"
echo -e "   📂 Location: front/"
echo -e "   🚀 Start: ${YELLOW}cd front && npm run dev${RESET}"
echo -e "   🌐 URL: http://localhost:3000"

echo -e "\n${GREEN}✅ Backend (Fastify + SQLite):${RESET}"
echo -e "   📂 Location: back/"
echo -e "   🚀 Start: ${YELLOW}cd back && npm run dev${RESET}"
echo -e "   🌐 URL: http://localhost:4000"

echo -e "\n${YELLOW}📝 Next steps:${RESET}"
echo -e "   1. Run backend: ${YELLOW}cd back && npm run dev${RESET}"
echo -e "   2. Run frontend: ${YELLOW}cd front && npm run dev${RESET}"
echo -e "   3. Visit http://localhost:3000 to see your app!"

echo -e "\n${GREEN}Happy coding! 🚀${RESET}\n"

