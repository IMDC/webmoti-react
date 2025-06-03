<!-- omit from toc -->
# WebMoti Setup Guide

- [React App (For virtual students)](#react-app-for-virtual-students)
  - [Setup React App](#setup-react-app)
  - [Running the App locally for developement](#running-the-app-locally-for-developement)
    - [Local setup](#local-setup)
  - [Weird errors that happen sometimes](#weird-errors-that-happen-sometimes)
    - [Vite error](#vite-error)
    - [Camera not readable error](#camera-not-readable-error)
  - [Deploying](#deploying)
  - [Testing](#testing)
    - [Unit Tests](#unit-tests)
    - [E2E Tests](#e2e-tests)
- [Hand server](#hand-server)
  - [Server setup](#server-setup)
  - [Remote.It](#remoteit)
  - [Running the hand server](#running-the-hand-server)
  - [Making the hand server run on boot](#making-the-hand-server-run-on-boot)
  - [Hand server tests](#hand-server-tests)
- [Queue](#queue)
  - [Auto open queue (on Windows tablet)](#auto-open-queue-on-windows-tablet)
- [Tactile notifications](#tactile-notifications)
- [Standalone Join](#standalone-join)
  - [Setting up standalone join](#setting-up-standalone-join)
    - [Setup Node version](#setup-node-version)
    - [Chromium Browser](#chromium-browser)
    - [Install dependencies](#install-dependencies)
    - [Create .env in home directory](#create-env-in-home-directory)
    - [Making the autojoin script run on boot](#making-the-autojoin-script-run-on-boot)
- [Connecting raspberry pi to secure networks (like TMU)](#connecting-raspberry-pi-to-secure-networks-like-tmu)
  - [Option 1: Using Network Manager GUI](#option-1-using-network-manager-gui)
  - [Option 2: Using dhcpcd config](#option-2-using-dhcpcd-config)
- [Auto wifi setup](#auto-wifi-setup)
  - [Raspberry Pi setup](#raspberry-pi-setup)
  - [USB setup](#usb-setup)

## React App (For virtual students)

Original app template: <https://github.com/twilio/twilio-video-app-react#readme>

### Setup React App

1. Install dependencies: `npm install`

2. (Optional and probably not needed) Install noise cancellation: `npm run noisecancellation:krisp`

3. Install the CLI: `npm install -g twilio-cli` or use
 [scoop](https://www.twilio.com/docs/twilio-cli/getting-started/install#scoop)
 on Windows

4. Login: `twilio login`

5. Install the plugin for deploying the app ([more info here](plugin-rtc/README.md)):
 `twilio plugins:install plugin-rtc`.

### Running the App locally for developement

After following the steps below, run the app locally at `http://localhost:3000` with

```bash
npm start
```

It's set up to use the twilio video `go` room type (2 participant max) when
 running locally. Go rooms don't cost money so they can be used for development.
 When the app is deployed, it uses group rooms.
 <https://www.twilio.com/docs/video/legacy-room-types>

#### Local setup

- Open the [Twilio Console](https://www.twilio.com/console).
- Click on 'Settings' and take note of your Account SID.
- Create a new API Key in the [API Keys Section](https://www.twilio.com/console/video/project/api-keys)
 under Programmable Video Tools in the Twilio Console.
 Take note of the SID and Secret of the new API key.
- (This step is optional because plugin-rtc will
  create a new conversation service called
  `${APP_NAME}-conversations-service`. Make sure that both the react app .env
  and the autojoin .env use the same conversation SID, otherwise they will be
  in isolated chats) Create a new Conversations service in the [Services section](https://www.twilio.com/console/conversations/services)
 under the Conversations tab in the Twilio Console. Take note of the SID generated.
- Store your Account SID, API Key SID, API Key Secret, and Conversations Service
 SID in a new file called `.env` in the root level of the application (example below).

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_CONVERSATIONS_SERVICE_SID=ISxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Using no auth is useful for testing multiple users (or testing in general)
# VITE_SET_AUTH=none
# You can also enable passcode authentication for use with the Twilio CLI rtc-plugin.
# See: https://github.com/twilio-labs/plugin-rtc
# VITE_SET_AUTH=passcode

# Use firebase auth for deploying and only use passcode/none for testing
VITE_SET_AUTH=firebase

# The following values are used to configure the Firebase library.
# See https://firebase.google.com/docs/web/setup#config-object
# These variables must be set if FIREBASE_AUTH is enabled
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=

# set this to the remote.it persistent link (ending in /api)
VITE_API_DOMAIN=

# set this to the livekit websocket url (if using livekit)
VITE_LIVEKIT_URL=
```

### Weird errors that happen sometimes

#### Vite error

This might happen after deleting js files and then running vite dev or vite build?
This error will show in your dev terminal running vite and also in the browser
 console as a "disallowed MIME type" error.

```plaintext
The file does not exist at "node_modules/.vite/deps/chunk-XXXXXXXX.js?v=XXXXXXXX"
which is in the optimize deps directory.
The dependency might be incompatible with the dep optimizer.
Try adding it to `optimizeDeps.exclude`.
```

Solution:

1. Delete `node_modules`
2. Clear browser cache
3. Reinstall packages (`npm run i`)

(more info at <https://github.com/vitejs/vite/discussions/17738>)

#### Camera not readable error

This error will show in the browser console and in an app popup.
It happens when allowing media permissions in the prejoin screens.
It might only happen on Chromium browsers and Windows.

```plaintext
Error Acquiring Media: NotReadableError Could not start video source
```

Scenario 1: When on Windows and the camera is already in use by some other app

Solution 1: Only allow permissions to the microphone and not the camera,
 or close the other app using the camera

Scenario 2: When minimum video constraints are too high for the computer
 visiting the website (like if the webcam is too low resolution)

Solution 2: Lower the minimum width and height in [DEFAULT_VIDEO_CONSTRAINTS](webmoti-react/src/constants.ts)

### Deploying

Deploy the app: `npm run deploy`. The deployed app will use the `group`
 room type instead of `go`.

See deployed app info (like url and expiration): `npm run view`

Undeploy the app: `npm run delete`

### Testing

#### Unit Tests

```bash
# run all jest tests
npm test

# run specific test (replace TEST_PATH with actual path of the test file)
# you can get the path by right clicking the file then "Copy Relative Path"
npm run test-specific TEST_PATH

# update test snapshot for a specific file
npm run update-snapshots:file TEST_PATH
```

#### E2E Tests

Cypress needs these variables set in
 `Projects > PROJECT_NAME > Settings > Environment Variables`

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_CONVERSATIONS_SERVICE_SID=ISxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

```bash
# start cypress UI with vite dev server running
npm run cypress:dev
```

Run cypress tests:

1. E2E Testing
2. Choose any browser
3. Click `twilio-video.cy.js`

## Hand server

This runs on the raspberry pi (student-view only).

### Server setup

Setup virtual Python environment:

```bash
# create it in home dir
python -m venv ~/.hand-server-venv

# activate it
# (add this to ~/.bashrc for a shortcut)
# alias activatehs='source "$HOME/.hand-server-venv/bin/activate"'
source ~/.hand-server-venv/bin/activate

# install requirements (in venv)
pip install -r ~/webmoti-react/hand/app/requirements.txt
```

> **Note:** You need to activate the venv when running the hand server or
> changing packages
>
> You can also activate it by typing activatehs (this is setup in .bashrc)

Create `.env` file in project root:

```bash
# for tactile notifications
VAPID_PRIVATE_KEY=
VAPID_EMAIL=

# for text to speech
ELEVENLABS_API_KEY=

# for AI schedule
OPENAI_API_KEY=

# for push to talk (if using)
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# for vite client push to talk
REACT_APP_LIVEKIT_URL=
# for vite client tactile notifications
REACT_APP_SAVE_SUB_URL=
REACT_APP_NOTIF_APP_KEY=

# set APP_ENV to dev for testing, set it to prod on raspberry pi
APP_ENV=dev
```

Vapid key pairs (for tactile push notifications) can be generated using
 `npx web-push generate-vapid-keys`.

### Remote.It

The hand server is exposed to the internet using remote.it.
This needs to be setup on the raspberry pi running the hand server.

Setup:
<https://www.remote.it/getting-started/raspberry-pi>

1. Sign into the Remote.It portal <https://app.remote.it>
2. (Optional - If you already have a persistent link and service setup, then you
 can restore it and skip step 3 <https://support.remote.it/hc/en-us/articles/15635680105229-Restore-A-Device>)
3. Click "+" (Add Device) and select "Raspberry Pi", copy the generated code and
 paste it into the SSH console of your Raspberry Pi

Then to setup the HTTP service:

1. Create new HTTP service
2. Set service URL to `http://localhost:8080`
3. Enable the `Persistent public url` switch
4. Make sure the routing for the link on the board is `[WEBPAGE IP].com/raisehand`

### Running the hand server

```bash
# activate venv
source ~/.hand-server-venv/bin/activate
# (or activatehs)

python ~webmoti-react/hand/app/main.py
```

Flags:
`--build-only`: Enable to run npm build and exit. (ex: `main.py --build-only`)

This flag is there because you need to build the app after making changes.
 Alternatively, you can navigate to the directory and `npm run build`

### Making the hand server run on boot

First setup pm2

```bash
# install pm2 globally
npm install -g pm2

pm2 startup systemd
# then copy paste the outputted command into terminal
```

Then make pm2 run the hand server

```bash
source ~/.hand-server-venv/bin/activate # or activatehs
pm2 start python ~/webmoti-react/hand/app/main.py --name hand_server
pm2 save
```

### Hand server tests

```bash
# run all
pytest
# more detailed output
pytest -v

# run one
pytest hand/app/tests/TEST_FILE.py
# run specific test
pytest hand/app/tests/TEST_FILE.py::TEST_NAME
```

## Queue

![Queue favicon](hand/app/static/favicon.svg)

The hand queue website is hosted from the hand server and is meant to be displayed
 on a tablet for the professor.

It gets real time updates from the hand server using server-sent events.

The notification button on the bottom left turns on push notifications from the
 hand server. This shouldn't be done on the tablet, but on a separate phone.

### Auto open queue (on Windows tablet)

The tablet automatically opens the hand queue website and keeps its screen on
 using an Autohotkey script.

1. Install AutoHotkey v2
2. Open startup folder:
    - Press `Win + R`
    - Open `shell:startup`
3. Create a shortcut to the [auto open script](hand/auto-open.ahk)
4. It will run on boot now. You can also double click the script to run it.

## Tactile notifications

Tactile notifications are helpful for when the prof doesn't hear or see the
 hand raising.

To enable notifications, open the hand queue website on a phone and click the
 notification bell. You should receive a confirmation notification if it works properly.

This uses push notifications instead of local notifications so it will work even
 when the phone is asleep. This allows the prof to put their phone in their
  pocket and get notified whenever the hand raises.

Some phones like Samsung have very aggressive battery optimization and might
 stop push notifications when the phone is asleep.
 You can change some battery settings so this doesn't happen. (<https://dontkillmyapp.com/>)

## Standalone Join

Both raspberry pi boards automatically join the twilio room when they're booted
 using a js script (standalone-join/main.js).

### Setting up standalone join

#### Setup Node version

(This is already setup)

```bash
# install node version manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

```bash
# switch to correct node version
nvm install 20.8.0
nvm use 20.8.0
# check versions
node -v
npm -v
```

#### Chromium Browser

Installing `puppeteer` on raspberry pi (arm64) is broken. It doesn't install
 the proper chromium binary. To fix this, use `executablePath: /usr/bin/chromium-browser`
 when starting puppeteer. (This is already in the script)

#### Install dependencies

(on raspberry pi)

1. `cd webmoti-react/standalone-join`
2. `npm install`

#### Create .env in home directory

```bash
# these are the same values used in the react app .env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_CONVERSATIONS_SERVICE_SID=ISxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# set this to the url of the deployed react app
WEBMOTI_URL=

# for student-view raspberry pi (remove this for board-view)
IS_STUDENT_VIEW=true

# for testing autojoin.js
# IS_TEST_USER=true
```

#### Making the autojoin script run on boot

> **Note:** If autojoin.js is not launching when rasp pi is in headless mode
> then you need to download xvfb for running a virtual display and then
> instead of pm2 start autojoin.js, run pm2 start launch-autojoin.sh.
>
> Command: sudo apt install xvfb
>
> xvfb might also need to be set to run on boot.
> (Check pm2 logs first to see if this is the case)

```bash
pm2 start autojoin.js
pm2 save
```

## Connecting raspberry pi to secure networks (like TMU)

### Option 1: Using Network Manager GUI

You can join the network like you would on a linux computer.
Click the network icon in the top right of the Raspberry Pi desktop.

If you don't want to use your actual account, you can create a guest account:
<https://www.torontomu.ca/ccs/services/accounts/guestaccount/>

Settings:

<https://www.torontomu.ca/ccs/services/connections/on-campus/wireless/ubuntu/#!tab-1510243563508-step-4>

```plaintext
Wireless

SSID: TMU
```

```plaintext
Wireless Security

Security: WPA & WPA2 Enterprise

Authentication: Protected EAP (PEAP)

CA certificate: https://ai-apps.torontomu.ca/ccssoftware/allryerson/wireless/ca-bundle.crt

Identity: TMU username

Password: TMU password
```

### Option 2: Using dhcpcd config

<https://www.miskatonic.org/2019/04/24/networkingpi/>

1. Add this to `/etc/wpa_supplicant/wpa_supplicant.conf` and fill in your user details.
 Either hash the password with MD4 and input it with the `hash:` prefix or
 input it in plaintext in quotes.

    ```plaintext
    network={
        ssid=""
        priority=1
        proto=RSN
        key_mgmt=WPA-EAP
        pairwise=CCMP
        auth_alg=OPEN
        eap=PEAP
        identity=""
        password=hash:
        phase1="peaplabel=0"
        phase2="auth=MSCHAPV2"
        }
    ```

2. Add this to `/etc/network/interfaces`. The sleep 5 is needed to avoid a race condition.

    ```plaintext
    auto lo

    iface lo inet loopback
    iface eth0 inet dhcp

    allow-hotplug wlan0

    iface wlan0 inet dhcp
            pre-up sleep 5
            pre-up wpa_supplicant -B -i wlan0 \
                    -c /etc/wpa_supplicant/wpa_supplicant.conf -D nl80211
            post-down killall -q wpa_supplicant
    ```

3. If you need to use VNC viewer with ethernet, make sure that ethernet has
 higher priority over wifi. If you don't do this, it will always connect to wifi
 and you'll need to know the ip address to use VNC viewer.

    Add this to `/etc/dhcpcd.conf`

    ```plaintext
    interface eth0
    metric 202

    interface wlan0
    metric 300
    ```

4. Make sure NetworkManager is disabled on boot and dhcpcd is enabled

  ```bash
  sudo systemctl disable NetworkManager
  sudo systemctl stop NetworkManager

  sudo systemctl enable dhcpcd
  sudo systemctl start dhcpcd
  ```

## Auto wifi setup

This is a way for the raspberry pi boards to connect to a wifi network
 in headless mode.
This is in case you need to bring the WebMoti system somewhere that isn't TMU.
It works by putting the wifi connection information on a USB and then plugging
 it into the Raspberry Pi.

> **Note:**
>
> For this to work, the dhcpcd config needs to be setup
> (see above)

### Raspberry Pi setup

Create this file `/etc/udev/rules.d/99-usb-autorun.rules`.
 This rule will trigger the service below when a usb is plugged in.

```bash
ACTION=="add", \
KERNEL=="sd[a-z][0-9]", \
SUBSYSTEM=="block", \
ENV{SYSTEMD_WANTS}="usb-auto-wifi.service"
```

Then create `# /etc/systemd/system/usb-auto-wifi.service`.
 Replace USERNAME with `imdc1` or `imdc2`.
 This service will run after the usb mounts.
 **Note: It won't run if you're plugging it in again after
 successfully connecting to wifi the first time**

```ini
[Unit]
Description=Run script after USB is mounted
After=media-USERNAME-Webmoti.mount

[Service]
ExecStart=/usr/bin/python3 /home/USERNAME/add_wifi.py
Type=forking

[Install]
WantedBy=multi-user.target
```

Run `sudo systemctl enable usb-auto-wifi.service` to enable the service.

### USB setup

1. Get a USB drive and name it `Webmoti`.
2. Create a file named `wifi.ini` on the USB and fill in the [connection information](./wifi/wifi.ini).
 Make sure the extension is `ini` and not `txt`.
3. Plug the USB into the raspberry pi.
4. Wait for at least 1 minute for it to run.
5. Unplug it and check the `wifi_debug.log` file on the USB to see if it worked.
 This file will be created by the raspberry pi.
