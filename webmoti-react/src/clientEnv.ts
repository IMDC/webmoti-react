const validAuthModes = ['firebase', 'passcode', 'none'] as const;
type AuthMode = (typeof validAuthModes)[number];

const requiredEnvVars = {
  VITE_SET_AUTH: validAuthModes,
} satisfies Record<string, readonly string[]>;

// it uses functions for easier mocking in jest tests
const clientEnv = {
  FIREBASE_API_KEY: () => import.meta.env.VITE_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: () => import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  FIREBASE_STORAGE_BUCKET: () => import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: () => import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,

  API_DOMAIN: () => import.meta.env.VITE_API_DOMAIN,

  LIVEKIT_URL: () => import.meta.env.VITE_LIVEKIT_URL,

  SET_AUTH: () => import.meta.env.VITE_SET_AUTH as AuthMode,
  DISABLE_TWILIO_CONVERSATIONS: () => import.meta.env.VITE_DISABLE_TWILIO_CONVERSATIONS,
  TOKEN_ENDPOINT: () => import.meta.env.VITE_TOKEN_ENDPOINT,
  ROOM_TYPE: () => import.meta.env.VITE_ROOM_TYPE,

  GIT_TAG: () => import.meta.env.VITE_GIT_TAG,
  GIT_COMMIT: () => import.meta.env.VITE_GIT_COMMIT,

  IS_DEV_MODE: () => import.meta.env.DEV,
};

function validateEnvVars(rules: Record<string, readonly string[]>) {
  for (const [key, allowed] of Object.entries(rules)) {
    const val = import.meta.env[key];
    if (!val) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    if (!allowed.includes(val)) {
      throw new Error(`Invalid value for ${key}: "${val}". Expected one of: ${allowed.join(', ')}`);
    }
  }
}

validateEnvVars(requiredEnvVars);

export { clientEnv };
