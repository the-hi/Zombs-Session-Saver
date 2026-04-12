#!/bin/bash

# ── colors ──────────────────────────────────────────────────────────────────
RESET="\033[0m"
BOLD="\033[1m"
DIM="\033[2m"
CYAN="\033[36m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
MAGENTA="\033[35m"

# ── helpers ──────────────────────────────────────────────────────────────────
step()    { echo -e "${BOLD}${CYAN}>${RESET} $1"; }
success() { echo -e "  ${GREEN}✔${RESET}  $1"; }
info()    { echo -e "  ${DIM}→  $1${RESET}"; }
warn()    { echo -e "  ${YELLOW}⚠${RESET}  $1"; }
fail()    { echo -e "  ${RED}✘${RESET}  $1"; exit 1; }
divider() { echo -e "${DIM}────────────────────────────────────────${RESET}"; }

# spinner — usage: spinner "label" & PID=$! ; ... ; kill $PID
spinner() {
    local label="$1"
    local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
    local i=0
    while true; do
        printf "\r  ${CYAN}${frames[$i]}${RESET}  ${DIM}%s...${RESET}" "$label"
        i=$(( (i+1) % ${#frames[@]} ))
        sleep 0.08
    done
}

run_spin() {
    # run_spin "label" cmd [args...]
    local label="$1"; shift
    spinner "$label" &
    local SPIN_PID=$!
    "$@" &> /dev/null
    local rc=$?
    kill $SPIN_PID 2>/dev/null
    wait $SPIN_PID 2>/dev/null
    printf "\r\033[2K"   # clear spinner line
    return $rc
}

# ── banner ───────────────────────────────────────────────────────────────────
clear -x
echo
echo -e "${BOLD}${MAGENTA}  Zombs-Session-Saver${RESET}"
divider
echo

sudo -v

# ── node ─────────────────────────────────────────────────────────────────────
step "Checking for Node.js..."
if command -v node &> /dev/null; then
    NODE_MAJOR=$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
    if [[ "$NODE_MAJOR" -lt 22 ]]; then
        warn "node $(node --version) detected, but v22+ is required — reinstalling via nvm"
        \. "$HOME/.nvm/nvm.sh" 2>/dev/null
        run_spin "Installing Node.js v22 LTS" nvm install 22
        nvm use 22 &>/dev/null
        success "Node.js updated to $(node --version)"
    else
        success "node detected $(node --version)"
    fi
else
    info "node not found — installing via nvm"
    run_spin "Fetching nvm" curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
    \. "$HOME/.nvm/nvm.sh"
    run_spin "Installing Node.js LTS" nvm install --lts
    success "Node.js installed $(node --version)"
fi
echo

# ── mpg123 (linux only) ───────────────────────────────────────────────────────
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    step "Installing mpg123..."
    run_spin "Updating apt" apt update
    run_spin "Installing mpg123" apt install -y mpg123
    success "mpg123 installed"
    echo
fi

# ── pnpm ─────────────────────────────────────────────────────────────────────
step "Checking for pnpm..."
if command -v pnpm &> /dev/null; then
    success "pnpm detected $(pnpm --version)"
else
    info "pnpm not found — installing"
    run_spin "Installing pnpm" bash -c "curl -fsSL https://get.pnpm.io/install.sh | sh -"
    success "pnpm installed"
fi
echo

# ── git ───────────────────────────────────────────────────────────────────────
step "Checking for git..."
if command -v git &> /dev/null; then
    success "git detected $(git --version)"
else
    info "git not found — installing"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        run_spin "Installing git via Homebrew" brew install git
        if [[ $? -ne 0 ]]; then
            fail "failed to install git via Homebrew"
        fi
        success "git installed via Homebrew"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        run_spin "Updating apt" apt update
        run_spin "Installing git" apt install -y git
        success "git installed"
    else
        fail "unsupported OS — please install git manually and re-run"
    fi
fi
echo

# ── clone ─────────────────────────────────────────────────────────────────────
divider
step "Cloning Zombs-Session-Saver..."
if [[ -d "Zombs-Session-Saver/.git" ]]; then
    warn "Folder already exists — pulling latest changes instead"
    run_spin "Pulling latest" git -C Zombs-Session-Saver pull
    if [[ $? -ne 0 ]]; then
        fail "git pull failed"
    fi
    success "Repository updated"
elif [[ -d "Zombs-Session-Saver" ]]; then
    warn "Folder exists but isn't a git repo — removing and re-cloning"
    rm -rf Zombs-Session-Saver
    run_spin "Cloning repository" git clone https://github.com/the-hi/Zombs-Session-Saver.git
    if [[ $? -ne 0 ]]; then
        fail "git clone failed — check your internet connection and try again"
    fi
    success "Repository cloned"
else
    run_spin "Cloning repository" git clone https://github.com/the-hi/Zombs-Session-Saver.git
    if [[ $? -ne 0 ]]; then
        fail "git clone failed — check your internet connection and try again"
    fi
    success "Repository cloned"
fi
echo

# ── dependencies ──────────────────────────────────────────────────────────────
step "Installing project dependencies..."
cd "$PWD/Zombs-Session-Saver"
run_spin "Running pnpm install" pnpm install
if [[ $? -ne 0 ]]; then
    fail "pnpm install failed"
fi
success "Dependencies installed"
echo

# ── done ──────────────────────────────────────────────────────────────────────
divider
echo
echo -e "${BOLD}${GREEN}  ✔ All done! Your session saver is ready.${RESET}"
echo
echo -e "  Configure your webhook in ${BOLD}config.js${RESET}, then fire it up:"
echo
echo -e "    ${CYAN}cd ./Zombs-Session-Saver${RESET}"
echo -e "    ${CYAN}pnpm run start${RESET}"
echo
echo -e "  ${MAGENTA}Enjoy!${RESET}"
echo
divider
echo
