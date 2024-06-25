#!/bin/bash

DOWNLOADS_DIR="$HOME/Downloads"
ZIP_FILE="webmoti-W.I.P-main.zip"
EXTRACTED_DIR="$DOWNLOADS_DIR/webmoti-W.I.P-main"
TARGET_DIR="$HOME/app"

if [ -f "$DOWNLOADS_DIR/$ZIP_FILE" ]; then
    rm -rf "$EXTRACTED_DIR"
    rm -rf "$TARGET_DIR"

    unzip "$DOWNLOADS_DIR/$ZIP_FILE" -d "$DOWNLOADS_DIR"

    # copy app dir to home
    cp -r "$EXTRACTED_DIR/hand/app" "$TARGET_DIR"

    # remove zip
    rm -rf "$EXTRACTED_DIR"
    rm "$DOWNLOADS_DIR/$ZIP_FILE"
else
    echo "Zip file not found in $DOWNLOADS_DIR"
fi
