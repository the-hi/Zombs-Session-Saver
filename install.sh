#!/bin/sh

clear -x
sudo -v

# installing additional dependencies
# node
if command -v node &> /dev/null; then
    echo "node is detected."
else
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
    \. "$HOME/.nvm/nvm.sh"
    nvm install --lts
fi
# mpg123 (linux only)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "installing mpg123..."
    apt update && apt install mpg123
fi
# pnpm
if command -v pnpm &> /dev/null; then
    echo "pnpm is detected."
else
    echo "installing pnpm..."
    curl -fsSL https://get.pnpm.io/install.sh | sh - &> /dev/null
fi
# git
if command -v git &> /dev/null; then
    echo "git is detected."
else
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install git &> /dev/null
        if [$? -ne 0]; then
            echo "failed to install git."
            exit 1
        else
            echo "git is now installed (through homebrew)."
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        apt update && apt install git
        echo "git is now installed."
    else
        echo "git is not installed, try again later."
        exit 1
    fi
fi

echo "cloning project..."
git clone https://github.com/the-hi/Zombs-Session-Saver.git &> /dev/null

cd "$PWD/Zombs-Session-Saver"
echo "install dependencies..."
pnpm install &> /dev/null

echo -e "your session saver is now ready to be configured & used!\nconfigure your webhook in config.js and run the following to run the session saver:\n
cd ./Zombs-Session-Saver\npnpm run start

enjoy!"
