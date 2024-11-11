// src/lib/firebase.ts
import { AppOptions, getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase, Database, ServerValue } from 'firebase-admin/database';
import { Firestore, getFirestore, initializeFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import * as serviceAccount from './eartho-app-firebase-adminsdk-njcdc-0fff8407e9.json';
import { FirebaseAdapterConfig } from '../internal-auth/googledb-adapter/adapter';

// Initialize Firebase app with service account credentials
const appOptions: AppOptions = {
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: "https://eartho-app-default-rtdb.firebaseio.com"
};

// Utility function to initialize or retrieve the existing Firebase app
function initFirebaseApp(options: AppOptions & { name?: string } = {}) {
  const apps = getApps();
  const app = options.name ? apps.find((a) => a.name === options.name) : apps[0];
  return app || initializeApp(options, options.name);
}

// Initialize Realtime Database
function initRealtimeDatabase(options: AppOptions & { name?: string } = {}): Database {
  const app = initFirebaseApp(options);
  return getDatabase(app);
}

// Initialize Firestore
function initFirestore(options: AppOptions & { name?: FirebaseAdapterConfig["name"] } = {}): Firestore {
  const app = initFirebaseApp(options);
  return getFirestore(app);
}

// Export initialized Realtime Database and Firestore instances
const rdb = initRealtimeDatabase(appOptions);
const fdb = initFirestore(appOptions);

export { rdb, fdb, ServerValue, Timestamp, FieldValue };

// Firestore Collection References
export const usersCollection = (f: Firestore) => f.collection('users');
export const authSessionsCollection = (f: Firestore) => f.collection('auth-sessions');
export const authAccountsCollection = (f: Firestore) => f.collection('auth-accounts');
export const authUsersCollection = (f: Firestore) => f.collection('auth-users');
export const authVerificationCollection = (f: Firestore) => f.collection('auth-verification-tokens');
