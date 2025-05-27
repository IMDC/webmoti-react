import { RequestHandler } from 'express';
import admin from 'firebase-admin';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const serviceAccount = require('../../plugin-rtc/firebase_service_account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firebaseAuthMiddleware: RequestHandler = async (req, res, next) => {
  const authHeader = req.get('authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  try {
    // remove Bearer prefix
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    // Here we authenticate users be verifying the ID token that was sent
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Here we authorize users to use this application only if they have a
    // TMU email address. The logic in this if statement can be changed if
    // you would like to authorize your users in a different manner.
    if (decodedToken.email && /@torontomu.ca$/.test(decodedToken.email)) {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. Only TMU users are allowed.' });
    }
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default module.exports = firebaseAuthMiddleware;
