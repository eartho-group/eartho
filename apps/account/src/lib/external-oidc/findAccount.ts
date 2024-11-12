import { KoaContextWithOIDC, Account, ClaimsParameterMember, FindAccount, AccountClaims } from 'oidc-provider';
import { fdb } from '../googlecloud/db';

interface LocalAccount {
  id: string;
  displayName?: string;
  email?: string;
  verifiedEmails?: string[];  // Array of verified emails
  phone?: string;
  verifiedPhones?: string[];    // Array of verified phones
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
        sub: account.id ?? id,
        id: account.id ?? id,
        displayName: account.displayName,
        email: account.email,
        verifiedEmails: account.verifiedEmails,
        phone: account.phone,
        verifiedPhones: account.verifiedPhones,
        birthdate: account.birthdate,
        firstName: account.firstName,
        lastName: account.lastName,
        locale: account.locale,
        photoURL: account.photoURL,
      };
      return claims;
    },
  };
}

export default findAccount;
