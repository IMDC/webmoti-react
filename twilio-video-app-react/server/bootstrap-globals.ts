import { Twilio } from 'twilio';

interface HeaderObj {
  [key: string]: string;
}

export class TwilioResponse {
  headers: HeaderObj = {};
  body: any;
  statusCode = 200;

  setStatusCode(code: number) {
    this.statusCode = code;
  }

  setBody(body: any) {
    this.body = body;
  }

  appendHeader(key: string, value: string) {
    this.headers[key] = value;
  }

  setHeaders(headers: HeaderObj) {
    this.headers = headers;
  }
}

interface RuntimeType {
  getAssets: () => { [key: string]: { path: string } };
}

const Runtime: RuntimeType = {
  getAssets: () => ({
    '/auth-handler.js': {
      path: __dirname + '/auth-handler',
    },
  }),
};

interface TwilioGlobal extends Twilio {
  Response: typeof TwilioResponse;
}

declare global {
  var Twilio: TwilioGlobal;
  var Runtime: RuntimeType;
}

global.Twilio = require('twilio');
global.Twilio.Response = TwilioResponse;
global.Runtime = Runtime;
