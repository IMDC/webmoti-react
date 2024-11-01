#!/bin/bash

# this will run autojoin.js using hdmi display if connected
# otherwise it will use xvfb to run it.

# this allows puppeteer to run in non headless mode by having a
# virtual display so audio can work properly. (when hdmi not connected)

if xrandr | grep -q "HDMI-1 connected"; then
    echo "HDMI is connected. Running autojoin.js without Xvfb."
    node ~/autojoin.js
else
    echo "HDMI is not connected. Running autojoin.js with Xvfb."
    xvfb-run --auto-servernum node ~/autojoin.js
fi
