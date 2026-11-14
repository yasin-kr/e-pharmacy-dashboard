const environment = import.meta.env;

const firebaseConfig = {
  apiKey: environment.VITE_FIREBASE_API_KEY,
  authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: environment.VITE_FIREBASE_PROJECT_ID,
  appId: environment.VITE_FIREBASE_APP_ID,
};

const configured = Object.values(firebaseConfig).every(Boolean);
export const dataMode =
  environment.VITE_DATA_MODE ||
  (configured || environment.PROD ? "firebase" : "demo");
export const isDemo = dataMode === "demo";

let appPromise;
let authPromise;
let databasePromise;

async function getFirebaseApp() {
  if (dataMode !== "firebase") {
    throw new Error(
      "Choose a valid data mode in the environment configuration.",
    );
  }

  if (!configured) {
    throw new Error(
      "Firebase is not configured. Add the Firebase web configuration to connect your store.",
    );
  }

  appPromise ??= import("firebase/app").then(
    ({ initializeApp, getApps, getApp }) =>
      getApps().length ? getApp() : initializeApp(firebaseConfig),
  );
  return appPromise;
}

export async function getFirebaseAuth() {
  const app = await getFirebaseApp();
  authPromise ??= import("firebase/auth").then((sdk) => ({
    auth: sdk.getAuth(app),
    sdk,
  }));
  return authPromise;
}

export async function getFirebaseDatabase() {
  const app = await getFirebaseApp();
  databasePromise ??= import("firebase/firestore/lite").then((sdk) => ({
    db: sdk.getFirestore(app),
    sdk,
  }));
  return databasePromise;
}

export function getErrorMessage(error) {
  const messages = {
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-login-credentials": "The email or password is incorrect.",
    "auth/wrong-password": "The email or password is incorrect.",
    "auth/user-not-found": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/user-disabled":
      "This account has been disabled. Contact your administrator.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed":
      "Unable to connect. Check your connection and try again.",
    "auth/operation-not-allowed":
      "Email and password sign-in needs to be enabled for this store.",
    "permission-denied":
      "Your account does not have permission to access this data.",
    unavailable:
      "The service is unavailable. Check your connection and try again.",
    "not-found":
      "This record no longer exists. Refresh the list and try again.",
  };

  return (
    messages[error?.code] ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}
