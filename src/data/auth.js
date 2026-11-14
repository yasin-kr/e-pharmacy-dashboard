import { getFirebaseAuth, isDemo } from "./firebase";

export const DEMO_CREDENTIALS = {
  email: "vendor@gmail.com",
  password: "Pharmacy123!",
};

const sessionKey = "e-pharmacy-demo-session";
const sessionEvent = "e-pharmacy-session-changed";
const demoUser = {
  uid: "demo-vendor",
  email: DEMO_CREDENTIALS.email,
  displayName: "Clayton Santos",
};

function readDemoSession() {
  try {
    return localStorage.getItem(sessionKey) === demoUser.uid
      ? { ...demoUser }
      : null;
  } catch {
    throw new Error(
      "Browser storage is unavailable. Enable local storage to use the demo.",
    );
  }
}

export function observeAuth(onChange, onError) {
  let active = true;
  let unsubscribe = () => {};

  if (isDemo) {
    const update = () => {
      if (!active) return;
      try {
        onChange(readDemoSession());
      } catch (error) {
        onError(error);
      }
    };
    const onStorage = (event) => {
      if (event.key === sessionKey || event.key === null) update();
    };
    queueMicrotask(update);
    window.addEventListener(sessionEvent, update);
    window.addEventListener("storage", onStorage);
    unsubscribe = () => {
      window.removeEventListener(sessionEvent, update);
      window.removeEventListener("storage", onStorage);
    };
  } else {
    getFirebaseAuth()
      .then(({ auth, sdk }) => {
        if (active)
          unsubscribe = sdk.onAuthStateChanged(auth, onChange, onError);
      })
      .catch((error) => {
        if (active) onError(error);
      });
  }

  return () => {
    active = false;
    unsubscribe();
  };
}

export async function signIn(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  if (isDemo) {
    if (
      normalizedEmail !== DEMO_CREDENTIALS.email ||
      password !== DEMO_CREDENTIALS.password
    ) {
      throw new Error(
        "The email or password is incorrect. Use the demo account shown below.",
      );
    }
    try {
      localStorage.setItem(sessionKey, demoUser.uid);
    } catch {
      throw new Error(
        "Your session could not be saved. Enable browser storage and try again.",
      );
    }
    window.dispatchEvent(new Event(sessionEvent));
    return { ...demoUser };
  }

  const { auth, sdk } = await getFirebaseAuth();
  const result = await sdk.signInWithEmailAndPassword(
    auth,
    normalizedEmail,
    password,
  );
  return result.user;
}

export async function signOut() {
  if (isDemo) {
    try {
      localStorage.removeItem(sessionKey);
    } catch {
      throw new Error("Your session could not be cleared. Please try again.");
    }
    window.dispatchEvent(new Event(sessionEvent));
    return;
  }

  const { auth, sdk } = await getFirebaseAuth();
  await sdk.signOut(auth);
}
