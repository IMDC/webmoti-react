#!/bin/bash

DOWNLOAD_DIR="$HOME/Downloads"
DOWNLOAD_NAME="$DOWNLOAD_DIR/webmoti-W.I.P-main"

if [ -f "$DOWNLOAD_NAME.zip" ]; then
    rm -rf "$DOWNLOAD_NAME"

    # move .env temporarily
    if [ -f "$HOME/app/.env" ]; then
        mv "$HOME/app/.env" "$HOME/.env.backup"
    fi

    rm -rf "$HOME/app"

    unzip "$DOWNLOAD_NAME.zip" -d "$DOWNLOAD_DIR"

    # copy app dir to home
    cp -r "$DOWNLOAD_NAME/hand/app" "$HOME"

    # move .env file back
    if [ -f "$HOME/.env.backup" ]; then
        mv "$HOME/.env.backup" "$HOME/app/.env"
    fi

    # remove zip
    rm -rf "$DOWNLOAD_NAME"
    rm "$DOWNLOAD_NAME.zip"
else
    echo "Zip file not found in $DOWNLOAD_DIR"
fi
