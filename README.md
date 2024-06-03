<p align="center">
  <img src="twilio-video-app-react/public/favicon.svg" alt="Logo" width="150" height="150"/>
</p>

<h1 align="center">WebMoti</h1>

[Project Tasks](https://github.com/orgs/IMDC/projects/2)

- [Twilio App](#twilio-app)
  - [Setup](#setup)
  - [Running the App locally for developement](#running-the-app-locally-for-developement)
    - [Local setup](#local-setup)
  - [Deploying](#deploying)
  - [Webmoti URL server](#webmoti-url-server)
- [Standalone Join](#standalone-join)
  - [Info](#info)
  - [Setting up the scripts](#setting-up-the-scripts)
    - [Code changes](#code-changes)
    - [Autorun](#autorun)
- [Connecting raspberry pi to secure networks (like TMU)](#connecting-raspberry-pi-to-secure-networks-like-tmu)
  - [dhcpcd method](#dhcpcd-method)
  - [Network Manager alternative](#network-manager-alternative)
- [Auto wifi setup](#auto-wifi-setup)
- [Auto wifi](#auto-wifi)
- [Microphone Function](#microphone-function)
- [RaiseHand Function](#raisehand-function)
- [Camera Setup](#camera-setup)
- [ZOOM APP (OLD)](#zoom-app-old)

## Twilio App

### Setup

1. Install dependencies: `npm install`

2. Install noise cancellation: `npm run noisecancellation:krisp`

3. Install the CLI: `npm install -g twilio-cli` or use
 [scoop](https://www.twilio.com/docs/twilio-cli/getting-started/install#scoop)
 on Windows

4. Login: `twilio login`

5. Install the plugin: `twilio plugins:install @twilio-labs/plugin-rtc`

### Running the App locally for developement

After following the steps below, run the app locally at `http://localhost:3000` with

```sh
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

```sh
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

### Webmoti URL server

The raspberry pi boards are able to always know the latest url and password by
 sending a request to this server (twilio-video-app-react/server/get_url.js).
 This is hosted as a twilio serverless function and can be edited in the
 [twilio console](https://console.twilio.com/us1/develop/functions/services).

## Standalone Join

Both raspberry pi boards automatically join the twilio room when they're booted
 using a js script (standalone-join/main.js).

### Info

- model: Raspberry Pi 4 Model B Rev 1.5
- imdc1: Board-View (Hand)
- imdc2: Class-View (Directional mic)

### Setting up the scripts

#### Code changes

- line 108: Board-View or Class-View
- line 130: (if imdc2) Uncomment

#### Autorun

```sh
pm2 start main.js
pm2 startup systemd
# copy paste outputted command
pm2 save
sudo reboot # for testing
```

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
 the Service URL must be `http://localhost/raisehand`. Once properly entered
 remote.it will provide a live link.
- Raising your hand is now possible via the locally hosted code, hotspot connection,
 and proper remote.it IP routing.

## Camera Setup

- Follow the intstructions as stated in the txt file located
 within the Rasp-pi Zoom folder.

## ZOOM APP (OLD)

- The Zoom App (web-moti-alpha) can be properly configured via the following
 youtube tutorial: <https://shorturl.at/ijHT9>
