<!-- omit from toc -->
# WebMoti Setup Guide

- [React App (For virtual students)](#react-app-for-virtual-students)
  - [Setup React App](#setup-react-app)
  - [Running the App locally for developement](#running-the-app-locally-for-developement)
    - [Local setup](#local-setup)
  - [Deploying](#deploying)
  - [Testing](#testing)
    - [Unit Tests](#unit-tests)
    - [E2E Tests](#e2e-tests)
  - [Storybook](#storybook)
- [Hand server](#hand-server)
  - [Server setup](#server-setup)
  - [Remote.It](#remoteit)
  - [Running the hand server](#running-the-hand-server)
  - [Hand server tests](#hand-server-tests)
- [Queue](#queue)
  - [Auto open queue (on Windows tablet)](#auto-open-queue-on-windows-tablet)
- [Tactile notifications](#tactile-notifications)
- [Standalone Join](#standalone-join)
  - [Webmoti URL server](#webmoti-url-server)
  - [Info](#info)
  - [Setting up standalone join](#setting-up-standalone-join)
    - [Setup Node version](#setup-node-version)
    - [Chromium Browser](#chromium-browser)
    - [Install dependencies](#install-dependencies)
    - [Create .env in home directory](#create-env-in-home-directory)
    - [Code changes](#code-changes)
    - [Autorun](#autorun)
- [Microphone Function](#microphone-function)
- [RaiseHand Function](#raisehand-function)
- [Connecting raspberry pi to secure networks (like TMU)](#connecting-raspberry-pi-to-secure-networks-like-tmu)
  - [dhcpcd method](#dhcpcd-method)
  - [Network Manager alternative](#network-manager-alternative)
- [Auto wifi setup](#auto-wifi-setup)
- [Auto wifi](#auto-wifi)

## React App (For virtual students)

Original app template: <https://github.com/twilio/twilio-video-app-react#readme>

### Setup React App

1. Install dependencies: `npm install`

2. Install noise cancellation: `npm run noisecancellation:krisp`

3. Install the CLI: `npm install -g twilio-cli` or use
 [scoop](https://www.twilio.com/docs/twilio-cli/getting-started/install#scoop)
 on Windows

4. Login: `twilio login`

5. Install the plugin: `twilio plugins:install @twilio-labs/plugin-rtc`

### Running the App locally for developement

After following the steps below, run the app locally at `http://localhost:3000` with

```bash
npm start
```

It's set up to use the twilio video `go` room type (2 participant max) when
 running locally.

#### Local setup

- Open the [Twilio Console](https://www.twilio.com/console).
- Click on 'Settings' and take note of your Account SID.
- Create a new API Key in the [API Keys Section](https://www.twilio.com/console/video/project/api-keys)
 under Programmable Video Tools in the Twilio Console.
 Take note of the SID and Secret of the new API key.
- Create a new Conversations service in the [Services section](https://www.twilio.com/console/conversations/services)
 under the Conversations tab in the Twilio Console. Take note of the SID generated.
- Store your Account SID, API Key SID, API Key Secret, and Conversations Service
 SID in a new file called `.env` in the root level of the application (example below).

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_CONVERSATIONS_SERVICE_SID=ISxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Deploying

Deploy the app: `npm run deploy`. The deployed app will use the `group`
 room type instead of `go`.

See deployed app info (like url and expiration): `npm run view`

Undeploy the app: `npm run delete`

### Testing

#### Unit Tests

```bash
# run all tests
npm test
```

```bash
# run until fail
npm run test-bail
```

```bash
# run specific test (replace TEST_PATH with actual path)
npx cross-env TZ=utc jest --config jest.config.js TEST_PATH
```

#### E2E Tests

```bash
# make sure server is running
npm start
# open cypress web ui
npm run cypress:open
```

Run cypress tests:

1. E2E Testing
2. Choose any browser
3. Click `twilio-video.cy.js`

### Storybook

For viewing the UI with interactive controls

```bash
npm run storybook
```

## Hand server

This runs on the raspberry pi.

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
pip install -r ~/app/requirements.txt
```

> **Note:** You need to activate the venv when running the hand server or
> changing packages
>
> You can also activate it by typing activatehs (this is setup in .bashrc)

Create `.env` file in project root:

```bash
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:webmoti2@gmail.com
ELEVENLABS_API_KEY=
PASSWORD=
OPENAI_API_KEY=
```

Vapid key pairs (for push notifications) can be generated using `npx web-push generate-vapid-keys`.

### Remote.It

The hand server is exposed to the internet using remote.it.
This needs to be setup on the raspberry pi running the hand server.

Setup:
<https://www.remote.it/getting-started/raspberry-pi>

### Running the hand server

```bash
# activate venv
source ~/.hand-server-venv/bin/activate
# (or activatehs)

python ~/app/main.py
```

It runs in dev mode by default (code reloading). For prod mode run:
`export APP_ENV=prod`

Flags:
(For prod mode)
`--build`: Enable to run npm build. Only enable if vite project code has changed.
`--build-only`: Enable to run npm build and exit.

### Hand server tests

```bash
# run all
pytest
# more detailed output
pytest -v
```

```bash
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

The prof laptop also uses this script to make it easier to setup. If the prof
 laptop is no longer used, please remove the `.env` file located at
 `C:\Users\IMDC\Desktop\WebMoti\.env` to ensure that the API keys are not exposed.

### Webmoti URL server

The raspberry pi boards are able to always know the latest url and password by
 sending a request to this server (webmoti-react/server/get_url.js).
 This is hosted as a twilio serverless function and can be edited in the
 [twilio console](https://console.twilio.com/us1/develop/functions/services).

### Info

- model: Raspberry Pi 4 Model B Rev 1.5
- imdc1: Student-View (Hand)
- imdc2: Board-View (Directional mic)

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
 when starting puppeteer.

#### Install dependencies

1. Get `package.json` and `package-lock.json` from [standalone-join](standalone-join/)
2. Run `npm install` on raspberry pi

#### Create .env in home directory

Get the `TWILIO_AUTH_TOKEN` from the [Twilio Console](https://www.twilio.com/console).

The `URL_SERVER` is the [Webmoti URL server](#webmoti-url-server) url with
 `/url` as the endpoint.

```bash
TWILIO_AUTH_TOKEN=
URL_SERVER=
```

#### Code changes

Change the variables at the top of the autojoin.js script based on what device
 it's running on

#### Autorun

For autorun on the imdc1 pi, the `launch_autojoin.sh` script needs to be run
 instead of the actual `autojoin.js` script.

```bash
# for autojoin script
pm2 start launch_autojoin.sh
pm2 save
pm2 startup systemd # for first time setup
# copy paste outputted command
sudo reboot # for testing
```

```bash
# for hand server
source ~/.hand-server-venv/bin/activate
pm2 start python ~/app/main.py --name hand_server
pm2 save
```

## Microphone Function

- code is hosted locally on a PICO.
- Two main files main.py and index.html.
- The PICO board needs both files but will autorun the file main.py.
- Once code and local hotspot is running from the PICO; Use any touchscreen
 device to connect to this network and hosted webpage.
- Clicking on any of the 5x4 grid boxes will allow proper communication to the microphone.

## RaiseHand Function

- Two files hosted locally on a PICO
- Main.py and index.html
- Runs on hotspot connection via Raspberry Pi plugged in via ETH
- Once connection is made allow that connection to be made globally via: <https://www.remote.it/getting-started/raspberry-pi>
- your routing for the link on the board must be `[WEBPAGE IP].com/raisehand` and
 the Service URL must be `http://localhost:8080/raisehand`. Once properly entered
 remote.it will provide a live link.
- Raising your hand is now possible via the locally hosted code, hotspot connection,
 and proper remote.it IP routing.

## Connecting raspberry pi to secure networks (like TMU)

### dhcpcd method

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

### Network Manager alternative

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

## Auto wifi setup

Make sure the usb drive is named `Webmoti`.

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

## Auto wifi

This is a way for the raspberry pi boards to connect to a wifi network
 in headless mode.

1. Get a USB drive and name it `Webmoti`.
2. Create a file named `wifi.ini` on the USB and fill in the [connection information](./wifi/wifi.ini).
 Make sure the extension is `ini` and not `txt`.
3. Plug the USB into the raspberry pi.
4. Wait for at least 1 minute for it to run.
5. Unplug it and check the `wifi_debug.log` file on the USB to see if it worked.
 This file will be created by the raspberry pi.
