import {
  Firestore,
  getFirestore,
  initializeFirestore,
  Timestamp,
  FieldValue,
} from "firebase-admin/firestore";
import { AppOptions, getApps, initializeApp } from "firebase-admin/app";
var admin = require("firebase-admin");
import serviceAccount from "./eartho-app-firebase-adminsdk-njcdc-0fff8407e9.json";

// Initialize Firestore with service account credentials
const firestore = initializeFirestoreApp({
  credential: admin.credential.cert(serviceAccount),
});

// Collection references
export const usersCollection = (f: Firestore) => f.collection("users");
export const authSessionsCollection = (f: Firestore) => f.collection("auth-sessions");
export const authAccountsCollection = (f: Firestore) => f.collection("auth-accounts");
export const authUsersCollection = (f: Firestore) => f.collection("auth-users");
export const authVerificationCollection = (f: Firestore) => f.collection("auth-verification-tokens");

/**
 * Initializes Firestore only if it hasn't been initialized already.
 *
 * @param options Firebase app options, using `GOOGLE_APPLICATION_CREDENTIALS` if not provided.
 * @returns Firestore instance.
 */
function initializeFirestoreApp(options: AppOptions = {}): Firestore {
  const existingApp = getApps()[0];
  if (existingApp) {
    return getFirestore(existingApp);
  }
  return initializeFirestore(initializeApp(options));
}

export { firestore, Timestamp, FieldValue };
