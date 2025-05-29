# plugin-rtc

This is a modified version of `@twilio-labs/plugin-rtc` which adds
 [firebase auth](src/serverless/middleware/firebase_auth.js) to the deployed
 [/token](src/serverless/functions/token.js) function used
 in [webmoti-react](../webmoti-react/).

There are also some other small changes like a shorter deployed url.

See the original [docs](https://github.com/twilio-labs/plugin-rtc/blob/master/README.md)
 for more information
