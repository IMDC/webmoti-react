#!/bin/bash

# use this script to update the hand server (/app) on rasp pi
# 1. log into github
# 2. download webmoti-react zip
# 3. run script

DOWNLOAD_DIR="$HOME/Downloads"
# get newest webmoti-react-*.zip
DOWNLOAD_NAME_ZIP=$(ls -t "$DOWNLOAD_DIR/webmoti-react-"*.zip | head -n 1)

if [ -f "$DOWNLOAD_NAME_ZIP" ]; then
    DOWNLOAD_NAME="${DOWNLOAD_NAME_ZIP%.zip}"

    # remove old unzipped webmoti-react-* dir if any
    if [[ -d "$DOWNLOAD_NAME" && "$DOWNLOAD_NAME" == webmoti-react* ]]; then
        echo "Removing existing directory: $DOWNLOAD_NAME"
        rm -rf "$DOWNLOAD_NAME"
    fi

    # move .env temporarily
    if [ -f "$HOME/app/.env" ]; then
        echo "Backing up .env file"
        mv "$HOME/app/.env" "$HOME/.env.backup"
    fi

    if [ -d "$HOME/app" ]; then
        echo "Removing existing app directory"
        rm -rf "$HOME/app"
    fi

    echo "Unzipping new package"
    unzip -q "$DOWNLOAD_NAME_ZIP" -d "$DOWNLOAD_DIR"

    # copy app dir to home
    if [ -d "$DOWNLOAD_NAME/hand/app" ]; then
        echo "Copying new app files"
        cp -r "$DOWNLOAD_NAME/hand/app" "$HOME"
    else
        echo "Expected app directory was not found in the zip"
    fi

    # move .env file back
    if [ -f "$HOME/.env.backup" ]; then
        echo "Restoring .env file"
        mv "$HOME/.env.backup" "$HOME/app/.env"
    fi

    # remove extracted dir and zip
    if [ -d "$DOWNLOAD_NAME" ]; then
        echo "Cleaning up extracted directory"
        rm -rf "$DOWNLOAD_NAME"
    fi
    if [ -f "$DOWNLOAD_NAME_ZIP" ]; then
        echo "Removing zip file"
        rm "$DOWNLOAD_NAME_ZIP"
    fi
else
    echo "Zip file not found in $DOWNLOAD_DIR"
fi
