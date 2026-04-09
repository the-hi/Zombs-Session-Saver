#!/bin/sh

clear -x

# installing additional dependencies
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "installing mpg123..."
    sudo apt update && sudo apt install mpg123
fi
if command -v pnpm &> /dev/null; then
    echo "pnpm is detected."
else
    echo "installing pnpm..."
    curl -fsSL https://get.pnpm.io/install.sh | sh - &> /dev/null
fi

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
    # doesnt support linux installation of git right now
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

echo "your session saver is now ready to be configured & used!\nconfigure your webhook in config.js and run the following to run the session saver:\n
cd ./Zombs-Session-Saver\npnpm run start
"
