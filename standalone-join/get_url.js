require('dotenv').config();
const twilio = require('twilio');

const APP_NAME = 'video-app';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

const client = twilio(apiKeySid, apiKeySecret, { accountSid: accountSid });

// from https://github.com/twilio-labs/plugin-rtc/blob/master/src/helpers.js

function getPasscode(domain, passcode) {
  const [, appID, serverlessID] = domain.match(/-?(\d*)-(\d+)(?:-\w+)?.twil.io$/);
  return `${passcode}${appID}${serverlessID}`;
}

async function findApp() {
  const services = await client.serverless.services.list();
  return services.find(service => service.friendlyName.includes(APP_NAME));
}

async function getUrl() {
  const app = await findApp();

  if (!app) {
    console.log('No deployed app found with the specified name.');
    return;
  }

  const [environment] = await client.serverless.services(app.sid).environments.list();
  const variables = await client.serverless
    .services(app.sid)
    .environments(environment.sid)
    .variables.list();

  const passcodeVar = variables.find(v => v.key === 'API_PASSCODE');
  const passcode = passcodeVar ? passcodeVar.value : '';

  const fullPasscode = getPasscode(environment.domainName, passcode);

  return `https://${environment.domainName}?passcode=${fullPasscode}`;
}

async function display() {
  url = await getUrl();
  console.log(url);
}

display().catch(e => console.error(e));
