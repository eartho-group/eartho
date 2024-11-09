// lib/firebaseAdapter.ts
import { Adapter, AdapterPayload } from 'oidc-provider';
import { fdb, rdb } from '../googlecloud/fdb';

export default class GoogleCloudAdapter implements Adapter {
  private name: string;

  constructor(name: string) {
    this.name = `version-1/oidc/${name}`; // Identifies the data type (e.g., "AccessToken", "AuthorizationCode")
  }

  /**
   * Save data to Firebase with expiration.
   */
  async upsert(id: string, payload: AdapterPayload, expiresIn: number): Promise<void> {
    const ref = rdb.ref(`${this.name}/${id}`);
    await ref.set({
      ...payload,
      expiresAt: Date.now() + expiresIn * 1000,
    });
    ref.onDisconnect().remove(); // Ensures data removal if the client disconnects

    // Add an entry to UidIndex if a UID is provided
    if (payload.uid) {
      const uidRef = rdb.ref(`version-1/oidc/UidIndex/${payload.uid}`);
      await uidRef.set({ [id]: true });
      uidRef.onDisconnect().remove();
    }

    // Add an entry to UserCodeIndex if a userCode is provided
    if (payload.userCode) {
      const userCodeRef = rdb.ref(`version-1/oidc/UserCodeIndex/${payload.userCode}`);
      await userCodeRef.set({ [id]: true });
      userCodeRef.onDisconnect().remove();
    }
  }

  /**
   * Find data by ID.
   */
  async find(id: string): Promise<AdapterPayload | undefined> {
    const snapshot = await rdb.ref(`${this.name}/${id}`).get();
    const data = snapshot.val();
    
    // Check expiration and cleanup if expired
    if (data?.expiresAt && Date.now() > data.expiresAt) {
      await this.destroy(id); // Remove expired data
      return undefined;
    }

    return data || undefined;
  }

  /**
   * Mark a token as consumed by updating its status.
   */
  async consume(id: string): Promise<void> {
    await rdb.ref(`${this.name}/${id}`).update({ consumed: Math.floor(Date.now() / 1000) });
  }

  /**
   * Delete data by ID.
   */
  async destroy(id: string): Promise<void> {
    await rdb.ref(`${this.name}/${id}`).remove();
  }

  /**
   * Find data by UID (used for sessions), using the UidIndex.
   */
  async findByUid(uid: string): Promise<AdapterPayload | undefined> {
    const uidSnapshot = await rdb.ref(`version-1/oidc/UidIndex/${uid}`).get();
    const uidData = uidSnapshot.val();

    if (!uidData) {
      // No entry found for the provided UID
      return undefined;
    }

    // Extract the session ID
    const sessionId = Object.keys(uidData)[0];

    // Retrieve the session data by session ID
    const dataSnapshot = await rdb.ref(`${this.name}/${sessionId}`).get();
    const data = dataSnapshot.val();

    // Check expiration and cleanup if expired
    if (data?.expiresAt && Date.now() > data.expiresAt) {
      await this.destroy(sessionId); // Remove expired data
      return undefined;
    }

    return data || undefined;
  }

  /**
   * Find data by User Code (for Device Code flow) using UserCodeIndex.
   */
  async findByUserCode(userCode: string): Promise<AdapterPayload | undefined> {
    const userCodeSnapshot = await rdb.ref(`version-1/oidc/UserCodeIndex/${userCode}`).get();
    const userCodeData = userCodeSnapshot.val();

    if (!userCodeData) {
      // No entry found for the provided userCode
      return undefined;
    }

    // Extract the ID associated with the userCode
    const id = Object.keys(userCodeData)[0];

    // Retrieve the main data associated with the found ID
    const dataSnapshot = await rdb.ref(`${this.name}/${id}`).get();
    const data = dataSnapshot.val();

    // Check expiration and cleanup if expired
    if (data?.expiresAt && Date.now() > data.expiresAt) {
      await this.destroy(id); // Remove expired data
      return undefined;
    }

    return data || undefined;
  }

  /**
   * Revoke grants by grantId.
   */
  async revokeByGrantId(grantId: string): Promise<void> {
    const snapshot = await rdb.ref(`${this.name}/${grantId}`).get();
    const updates: Record<string, null> = {};

    // Loop through results to delete specific entries associated with the grant
    snapshot.forEach(child => {
      updates[`${this.name}/${child.key}`] = null;
    });

    await rdb.ref().update(updates);
  }

  /**
   * Find an account by ID. Uses Firestore as the data source.
   */
  async findAccount(ctx: any, id: string): Promise<{ accountId: string; claims: () => Promise<any> } | undefined> {
    const snapshot = await fdb.doc(`users/${id}`).get();
    const accountData = snapshot.data();

    if (!accountData) return undefined;

    return {
      accountId: id,
      claims: async () => ({
        sub: id,
        uid: accountData.uid,
        displayName: accountData.displayName,
        email: accountData.email,
        photoURL: accountData.photoURL,
        emailVerified: accountData.email_verified,
      }),
    };
  }
}
