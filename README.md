# webmoti-W.I.P

## ZOOM APP (OLD)

----------------------------------

- The Zoom App (web-moti-alpha) can be properly configured via the following youtube tutorial: <https://shorturl.at/ijHT9>

----------------------------------

## Microphone Function

----------------------------------

- code is hosted locally on a PICO.
- Two main files main.py and index.html.
- The PICO board needs both files but will autorun the file main.py.
- Once code and local hotspot is running from the PICO; Use any touchscreen device to connect to this network and hosted webpage.
- Clicking on any of the 5x4 grid boxes will allow proper communication to the microphone.

----------------------------------

## RaiseHand Function

----------------------------------

- Two files hosted locally on a PICO
- Main.py and index.html
- Runs on hotspot connection via Raspberry Pi plugged in via ETH
- Once connection is made allow that connection to be made globally via: <https://www.remote.it/getting-started/raspberry-pi>
- your routing for the link on the board must be [WEBPAGE IP].com/raisehand; once properly entered remote.it will provide a live link.
- Raising your hand is now possible via the locally hosted code, hotspot connection, and proper remote.it IP routing.

----------------------------------

## Camera Setup

----------------------------------

- Follow the intstructions as stated in the txt file located within the Rasp-pi Zoom folder.

----------------------------------

## Twilio App

----------------------------------

### Setup

Dependencies: `npm install`

CLI: `npm install -g twilio-cli` or use scoop

Login: `twilio login`

Plugin: `twilio plugins:install @twilio-labs/plugin-rtc`

### Run

`npm run deploy:twilio-cli`

`twilio rtc:apps:video:view`

`twilio rtc:apps:video:delete`

### Running the App locally

After following the steps below, run the app locally at `http://localhost:3000` with

```sh
npm start
```

#### Local setup

- Create an account in the [Twilio Console](https://www.twilio.com/console).
- Click on 'Settings' and take note of your Account SID.
- Create a new API Key in the [API Keys Section](https://www.twilio.com/console/video/project/api-keys) under Programmable Video Tools in the Twilio Console. Take note of the SID and Secret of the new API key.
- Create a new Conversations service in the [Services section](https://www.twilio.com/console/conversations/services) under the Conversations tab in the Twilio Console. Take note of the SID generated.
- Store your Account SID, API Key SID, API Key Secret, and Conversations Service SID in a new file called `.env` in the root level of the application (example below).

```sh
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_CONVERSATIONS_SERVICE_SID=ISxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# use this to disable Twilio Conversations
# REACT_APP_DISABLE_TWILIO_CONVERSATIONS=true
```

----------------------------------
