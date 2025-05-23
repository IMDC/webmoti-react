// it uses functions for easier mocking in jest tests
const clientEnv = {
  FIREBASE_API_KEY: () => process.env.REACT_APP_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: () => process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  FIREBASE_STORAGE_BUCKET: () => process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: () => process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,

  API_DOMAIN: () => process.env.REACT_APP_API_DOMAIN,

  LIVEKIT_URL: () => process.env.REACT_APP_LIVEKIT_URL,

  SET_AUTH: () => process.env.REACT_APP_SET_AUTH,
  DISABLE_TWILIO_CONVERSATIONS: () => process.env.REACT_APP_DISABLE_TWILIO_CONVERSATIONS,
  TOKEN_ENDPOINT: () => process.env.REACT_APP_TOKEN_ENDPOINT,
  ROOM_TYPE: () => process.env.REACT_APP_ROOM_TYPE,

  GIT_TAG: () => process.env.REACT_APP_GIT_TAG,
  GIT_COMMIT: () => process.env.REACT_APP_GIT_COMMIT,
};

export { clientEnv };
