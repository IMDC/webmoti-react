#!/bin/bash

DOWNLOAD_DIR="$HOME/Downloads"
DOWNLOAD_NAME="$DOWNLOAD_DIR/webmoti-W.I.P-main"

if [ -f "$DOWNLOAD_NAME.zip" ]; then
    rm -rf "$DOWNLOAD_NAME"
    rm -rf "$HOME/app"

    unzip "$DOWNLOAD_NAME.zip" -d "$DOWNLOAD_DIR"

    # copy app dir to home
    cp -r "$DOWNLOAD_NAME/hand/app" "$HOME"

    # remove zip
    rm -rf "$DOWNLOAD_NAME"
    rm "$DOWNLOAD_NAME.zip"
else
    echo "Zip file not found in $DOWNLOAD_DIR"
fi
