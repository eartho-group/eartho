import { KoaContextWithOIDC, Account, AccountClaims } from 'oidc-provider';
import { fdb } from '../googlecloud/db';

interface LocalAccount {
  id: string;
  displayName?: string;
  email?: string;
  verifiedEmails?: string[];
  phone?: string;
  verifiedPhones?: string[];
  birthdate?: string;
  firstName?: string;
  lastName?: string;
  locale?: string;
  photoURL?: string;
}

async function retrieveAccountById(id: string): Promise<LocalAccount | null> {
  try {
    const snapshot = await fdb.doc(`users/${id}`).get();
    const accountData = snapshot.data();

    if (!accountData) return null;

    return {
      id: accountData.id ?? accountData.uid,
      displayName: accountData.displayName,
      email: accountData.email,
      verifiedEmails: accountData.verifiedEmails,
      phone: accountData.phone,
      verifiedPhones: accountData.verifiedPhones,
      birthdate: accountData.birthdate,
      firstName: accountData.firstName,
      lastName: accountData.lastName,
      locale: accountData.locale,
      photoURL: accountData.photoURL,
    };
  } catch (error) {
    console.error(`Error retrieving account with ID ${id}:`, error);
    return null;
  }
}

async function findAccount(ctx: KoaContextWithOIDC, id: string): Promise<Account | undefined> {
  const account = await retrieveAccountById(id);

  if (!account) return undefined;

  return {
    accountId: account.id,
    async claims(use: string, scope: string): Promise<AccountClaims> {
      const claims: AccountClaims = {
        sub: account.id,
        name: account.displayName,
        email: account.email,
        email_verified: account.verifiedEmails?.includes(account.email ?? '') ?? false,
        phone_number: account.phone,
        phone_number_verified: account.verifiedPhones?.includes(account.phone ?? '') ?? false,
        birthdate: account.birthdate,
        given_name: account.firstName,
        family_name: account.lastName,
        locale: account.locale,
        picture: account.photoURL,
      };
      return claims;
    },
  };
}

export default findAccount;
