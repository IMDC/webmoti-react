const { APP_NAME, EXPIRY_PERIOD } = require('./constants');
const { cli } = require('cli-ux');
const { CLIError } = require('@oclif/errors');
const { customAlphabet } = require('nanoid');
const fs = require('fs');
const { getListOfFunctionsAndAssets } = require('@twilio-labs/serverless-api/dist/utils/fs');
const moment = require('moment');
const path = require('path');
const { TwilioServerlessApiClient } = require('@twilio-labs/serverless-api');

function getRandomInt(length) {
  return customAlphabet('1234567890', length)();
}

function getPasscode(domain, passcode) {
  const [, appID, serverlessID] = domain.match(/-?(\d*)-(\d+)(?:-\w+)?.twil.io$/);
  return `${passcode}${appID}${serverlessID}`;
}

function verifyAppDirectory(dirpath) {
  try {
    const dir = fs.readdirSync(dirpath);
    const hasIndexHTML = [...dir].includes('index.html');

    if (!hasIndexHTML) {
      throw new CLIError(
        'The provided app-directory does not appear to be a valid app. There is no index.html found in the app-directory.'
      );
    }
  } catch (err) {
    switch (err.code) {
      case 'ENOENT':
        throw new CLIError('The provided app-directory does not exist.');
      case 'ENOTDIR':
        throw new CLIError('The provided app-directory is not a directory.');
      default:
        throw new CLIError(err.message);
    }
  }
}

async function getAssets(folder) {
  const { assets } = await getListOfFunctionsAndAssets(path.isAbsolute(folder) ? '/' : process.cwd(), {
    functionsFolderNames: [],
    assetsFolderNames: [folder],
  });

  const indexHTML = assets.find((asset) => asset.name.includes('index.html'));

  const allAssets = assets.concat([
    {
      ...indexHTML,
      path: '/',
      name: '/',
    },
    {
      ...indexHTML,
      path: '/login',
      name: '/login',
    },
  ]);

  return allAssets;
}

function getMiddleware(authType) {
  const authHandlerFn = fs.readFileSync(path.join(__dirname, `./serverless/middleware/${authType}_auth.js`));

  return [
    {
      name: 'auth-handler',
      path: '/auth-handler.js',
      content: authHandlerFn,
      access: 'private',
    },
  ];
}

function getServiceAccountAsset() {
  const serviceAccountContent = fs.readFileSync(path.join(__dirname, './firebase_service_account.json'), 'utf8');

  return [
    {
      name: 'firebase_service_account',
      path: '/firebase_service_account.json',
      content: serviceAccountContent,
      access: 'private',
    },
  ];
}

async function findApp() {
  const services = await this.twilioClient.serverless.services.list();
  return services.find((service) => service.friendlyName.includes(APP_NAME));
}

async function getAppInfo() {
  const app = await findApp.call(this);

  if (!app) return null;

  const appInstance = await this.twilioClient.serverless.services(app.sid);
  const [environment] = await appInstance.environments.list();
  const variables = await appInstance.environments(environment.sid).variables.list();
  const assets = await appInstance.assets.list();
  const functions = await appInstance.functions.list();

  const tokenServerFunction = functions.find((fn) => fn.friendlyName.includes('token'));
  const roomType = variables.find((v) => v.key === 'ROOM_TYPE')?.value ?? '';

  const baseInfo = {
    url: `https://${environment.domainName}`,
    sid: app.sid,
    hasWebAssets: assets.some((asset) => asset.friendlyName.includes('index.html')),
    roomType,
    environmentSid: environment.sid,
    functionSid: tokenServerFunction?.sid ?? '',
  };

  if (this.flags['authentication'] === 'passcode') {
    const passcode = variables.find((v) => v.key === 'API_PASSCODE')?.value ?? '';
    const expiry = variables.find((v) => v.key === 'API_PASSCODE_EXPIRY')?.value ?? '';
    const fullPasscode = getPasscode(environment.domainName, passcode);

    return {
      ...baseInfo,
      url: `${baseInfo.url}?passcode=${fullPasscode}`,
      passcode: fullPasscode,
      expiry: moment(Number(expiry)).toString(),
    };
  }

  return baseInfo;
}

async function displayAppInfo() {
  const appInfo = await getAppInfo.call(this);

  if (!appInfo) {
    console.log('There is no deployed app');
    return;
  }

  if (appInfo.hasWebAssets) {
    console.log(`Web App URL: ${appInfo.url}`);
  }

  if (this.flags['authentication'] === 'passcode') {
    console.log(`Passcode: ${appInfo.passcode.replace(/(\d{3})(\d{3})(\d{4})(\d{4})/, '$1 $2 $3 $4')}`);
    console.log(`Expires: ${appInfo.expiry}`);
  }

  if (appInfo.roomType) {
    console.log(`Room Type: ${appInfo.roomType}`);
  }

  console.log(`Authentication: ${this.flags['authentication']}`);

  console.log(
    `Edit your token server at: https://www.twilio.com/console/functions/editor/${appInfo.sid}/environment/${appInfo.environmentSid}/function/${appInfo.functionSid}`
  );
}

async function findConversationsService() {
  const services = await this.twilioClient.conversations.services.list();
  return services.find((service) => service.friendlyName.includes(APP_NAME));
}

async function getConversationsServiceSID() {
  const exisitingConversationsService = await findConversationsService.call(this);

  if (exisitingConversationsService) {
    return exisitingConversationsService.sid;
  }

  const service = await this.twilioClient.conversations.services.create({
    friendlyName: `${APP_NAME}-conversations-service`,
  });
  return service.sid;
}

async function deploy() {
  const assets = this.flags['app-directory'] ? await getAssets(this.flags['app-directory']) : [];
  const { functions } = await getListOfFunctionsAndAssets(__dirname, {
    functionsFolderNames: ['serverless/functions'],
    assetsFolderNames: [],
  });

  assets.push(...getMiddleware(this.flags['authentication']));
  if (this.flags['authentication'] === 'firebase') {
    assets.push(...getServiceAccountAsset());
  }

  if (this.twilioClient.username === this.twilioClient.accountSid) {
    // When twilioClient.username equals twilioClient.accountSid, it means that the user
    // authenticated with the Twilio CLI by providing their Account SID and Auth Token
    // as environment variables. When this happens, the CLI does not create the required API
    // key that is needed by the token server.

    throw new CLIError(`No API Key found.

Please login to the Twilio CLI to create an API key:

twilio login

Alternatively, the Twilio CLI can use credentials stored in these environment variables:

TWILIO_ACCOUNT_SID = your Account SID from twil.io/console
TWILIO_API_KEY = an API Key created at twil.io/get-api-key
TWILIO_API_SECRET = the secret for the API Key`);
  }

  const serverlessClient = new TwilioServerlessApiClient({
    username: this.twilioClient.username,
    password: this.twilioClient.password,
  });

  cli.action.start('deploying app');

  const conversationServiceSid = await getConversationsServiceSID.call(this);

  const env = {
    TWILIO_API_KEY_SID: this.twilioClient.username,
    TWILIO_API_KEY_SECRET: this.twilioClient.password,
    ROOM_TYPE: this.flags['room-type'],
    CONVERSATIONS_SERVICE_SID: conversationServiceSid,
  };

  if (this.flags['authentication'] === 'passcode') {
    const pin = getRandomInt(6);
    const expiryTime = Date.now() + EXPIRY_PERIOD;
    env.API_PASSCODE = pin;
    env.API_PASSCODE_EXPIRY = expiryTime;
  }

  const deployOptions = {
    env,
    pkgJson: {
      dependencies: {
        // This determines the version of the Twilio client returned by context.getTwilioClient()
        twilio: '^3.80.0',
        'firebase-admin': '^13.1.0',
      },
    },
    functionsEnv: '',
    functions,
    assets,
  };

  if (this.appInfo && this.appInfo.sid) {
    deployOptions.serviceSid = this.appInfo.sid;
  } else {
    deployOptions.serviceName = APP_NAME;
  }

  try {
    const { serviceSid } = await serverlessClient.deployProject(deployOptions);
    await this.twilioClient.serverless
      .services(serviceSid)
      .update({ includeCredentials: true, uiEditable: this.flags['ui-editable'] });
    cli.action.stop();
  } catch (e) {
    console.error('Something went wrong', e);
  }
}

module.exports = {
  deploy,
  displayAppInfo,
  findApp,
  findConversationsService,
  getAssets,
  getMiddleware,
  getAppInfo,
  getPasscode,
  getRandomInt,
  verifyAppDirectory,
};
