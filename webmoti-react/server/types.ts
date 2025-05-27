import { Twilio } from 'twilio';
import { TwilioResponse } from './bootstrap-globals';

export interface ServerlessContext {
  getTwilioClient: () => Twilio;
  [key: string]: unknown;
}

export type ServerlessFunction = (
  context: ServerlessContext,
  body: unknown,
  callback: (err: unknown, response: TwilioResponse) => void
) => void;
