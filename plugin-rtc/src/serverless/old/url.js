/* global Twilio */
// eslint-disable-next-line strict
'use strict';

/*
!
! Only use this for passcode auth
!
! Right now this isn't used so it doesn't get deployed in the /old folder
!
*/

module.exports.handler = async function (context, event, callback) {
  const client = context.getTwilioClient();
  const response = new Twilio.Response();
  response.setHeaders({ 'Content-Type': 'application/json' });

  // from https://github.com/twilio-labs/plugin-rtc/blob/master/src/helpers.js

  const APP_NAME = 'webmoti';

  function getPasscode(domain, passcode) {
    const [, appID, serverlessID] = domain.match(/-?(\d*)-(\d+)(?:-\w+)?.twil.io$/);
    return `${passcode}${appID}${serverlessID}`;
  }

  async function findApp() {
    const services = await client.serverless.services.list();
    return services.find((service) => service.friendlyName.includes(APP_NAME));
  }

  async function getUrl() {
    const app = await findApp();

    if (!app) {
      console.error('No deployed app found with the specified name.');
      response.setStatusCode(404);
      response.setBody({
        error: 'No deployed app found with the specified name.',
      });
      return callback(null, response);
    }

    const [environment] = await client.serverless.services(app.sid).environments.list();
    const variables = await client.serverless.services(app.sid).environments(environment.sid).variables.list();

    const passcodeVar = variables.find((v) => v.key === 'API_PASSCODE');
    const passcode = passcodeVar ? passcodeVar.value : '';

    const fullPasscode = getPasscode(environment.domainName, passcode);

    return `https://${environment.domainName}?passcode=${fullPasscode}`;
  }

  try {
    const url = await getUrl();
    response.setBody({ url: url });
    return callback(null, response);
  } catch (e) {
    console.error(e);
    response.setStatusCode(500);
    response.setBody({ error: e.message });
    return callback(null, response);
  }
};
