#!/bin/bash
set -e

# --- Colors ---
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RESET="\033[0m"

echo -e "${YELLOW}🔍 Checking Node.js installation...${RESET}"

# --- Install nvm if missing ---
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

# --- Go to frontend directory ---
FRONT_DIR="$(pwd)/front"
if [ ! -d "$FRONT_DIR" ]; then
  echo -e "${YELLOW}📁 Creating front directory...${RESET}"
  mkdir "$FRONT_DIR"
fi

cd "$FRONT_DIR"

# --- Check if Next.js project already exists ---
if [ ! -f "package.json" ]; then
  echo -e "${YELLOW}🚀 Setting up new Next.js project...${RESET}"
  npx create-next-app@latest . --typescript --eslint --use-npm
else
  echo -e "${GREEN}✅ Next.js project already exists, skipping creation${RESET}"
fi

# --- Install dependencies ---
echo -e "${YELLOW}📦 Installing dependencies...${RESET}"
npm install

echo -e "${GREEN}✅ Setup complete!${RESET}"
echo -e "${GREEN}👉 To start your app: cd front && npm run dev${RESET}"

