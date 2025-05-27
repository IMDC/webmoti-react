import { Conversation, JSONObject, Message } from '@twilio/conversations';

import { WEBMOTI_CAMERA_1, WEBMOTI_CAMERA_2 } from '../constants';
import TTSMessage from '../components/ChatWindow/TTSMessage';

export const isMobile = (() => {
  if (typeof navigator === 'undefined' || typeof navigator.userAgent !== 'string') {
    return false;
  }
  return /Mobile/.test(navigator.userAgent);
})();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && value.constructor === Object;
}

// Recursively removes any object keys with a value of undefined
export function removeUndefineds<T>(obj: T): T {
  if (!isPlainObject(obj)) return obj;

  const target: { [name: string]: unknown } = {};

  for (const key in obj) {
    const val = obj[key];
    if (typeof val !== 'undefined') {
      target[key] = removeUndefineds(val);
    }
  }

  return target as T;
}

export async function getDeviceInfo() {
  const devices = await navigator.mediaDevices.enumerateDevices();

  return {
    audioInputDevices: devices.filter((device) => device.kind === 'audioinput'),
    videoInputDevices: devices.filter((device) => device.kind === 'videoinput'),
    audioOutputDevices: devices.filter((device) => device.kind === 'audiooutput'),
    hasAudioInputDevices: devices.some((device) => device.kind === 'audioinput'),
    hasVideoInputDevices: devices.some((device) => device.kind === 'videoinput'),
  };
}

// This function will return 'true' when the specified permission has been denied by the user.
// If the API doesn't exist, or the query function returns an error, 'false' will be returned.
export async function isPermissionDenied(name: 'camera' | 'microphone') {
  const permissionName = name as PermissionName; // workaround for https://github.com/microsoft/TypeScript/issues/33923

  if (navigator.permissions) {
    try {
      const result = await navigator.permissions.query({ name: permissionName });
      return result.state === 'denied';
    } catch {
      return false;
    }
  } else {
    return false;
  }
}

export const isWebmotiVideo = (identity: string) => {
  return identity === WEBMOTI_CAMERA_1 || identity === WEBMOTI_CAMERA_2;
};

const getCustomMsgAttribute = (attribute: string) => JSON.stringify({ [attribute]: true });

export const sendSystemMsg = (conversation: Conversation | null, msg: string) => {
  // send with an attribute to differentiate from normal msg
  conversation?.sendMessage(msg, { attributes: getCustomMsgAttribute('systemMsg') });
};

export const sendSystemAudioMsg = (conversation: Conversation | null, message: TTSMessage) => {
  if (message.audioBlob === null) {
    return;
  }

  // send text message first
  conversation?.sendMessage(`TTS: ${message.text}`);

  // then send audio file
  const formData = new FormData();
  formData.append('media', message.audioBlob, 'TTS.mp3');
  formData.append('contentType', message.audioBlob.type);
  conversation?.sendMessage(formData, { attributes: getCustomMsgAttribute('ttsAudioMessage') });
};

const checkMessageAttribute = (message: Message, attribute: string): boolean => {
  const attrObj = message.attributes as JSONObject;

  if (attrObj.attributes === undefined) {
    // attribute isn't there
    return false;
  }

  try {
    const parsedAttributes = JSON.parse(attrObj.attributes as string);
    return parsedAttributes[attribute] === true;
  } catch {
    return false;
  }
};

export const checkSystemMsg = (message: Message) => {
  return checkMessageAttribute(message, 'systemMsg');
};

export const checkTTSAudioMsg = (message: Message) => {
  return checkMessageAttribute(message, 'ttsAudioMessage');
};
