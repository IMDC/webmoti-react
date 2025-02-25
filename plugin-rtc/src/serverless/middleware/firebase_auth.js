/* global Twilio, Runtime */
'use strict';

const firebaseAdmin = require('firebase-admin');
const fs = require('fs');

function handleError(response, statusCode, message) {
  console.error(`Error: ${message}`);
  response.setStatusCode(statusCode);
  response.setBody({ error: { message } });
  return response;
}

module.exports = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const { path: serviceAccountFilePath } = Runtime.getAssets()['/firebase_service_account.json'];

  let serviceAccountJson;
  try {
    // require doesn't work here so we need to use fs instead
    const rawJson = fs.readFileSync(serviceAccountFilePath, 'utf8');
    serviceAccountJson = JSON.parse(rawJson);
  } catch (err) {
    return callback(null, handleError(response, 500, 'Could not load service account JSON'));
  }

  // initialize firebase if not already done
  if (!firebaseAdmin.apps.length) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(serviceAccountJson),
    });
  }

  const authHeader = event.request?.headers?.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;
  if (!idToken) {
    return callback(null, handleError(response, 401, 'Firebase ID token missing'));
  }

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);

    const userEmail = decodedToken.email;
    // only tmu accounts are allowed
    if (!userEmail || !userEmail.endsWith('@torontomu.ca')) {
      return callback(null, handleError(response, 403, 'Forbidden - only torontomu.ca is allowed'));
    }
  } catch (err) {
    return callback(null, handleError(response, 401, 'Unauthorized - invalid token'));
  }
};
