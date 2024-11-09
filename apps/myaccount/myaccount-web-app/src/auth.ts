import NextAuth, { Account, JWT, NextAuthConfig, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import { firestore } from './lib/firestore';
import { FirestoreAdapter } from './lib/auth/firestore/adapter';
import { redirect } from 'next/navigation';
import { getEarthoToken } from './lib/auth/earthotoken/earthotoken';

export const homePage = '/';
export const loginPage = '/auth/login';
const TIME_TO_LIVE_SEC = 30 * 24 * 60 * 60; // 30 DAYS

export const firestoreAdapter = FirestoreAdapter(firestore);


const authOptions: NextAuthConfig = {
  pages: {
    signIn: loginPage,
    error: '/auth/login/error',
  },
  secret: process.env.AUTH_SECRET,
  adapter: firestoreAdapter,
  session: {
    strategy: 'jwt',
    maxAge: TIME_TO_LIVE_SEC, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = await getEarthoToken(user, account, TIME_TO_LIVE_SEC);
        token.accessTokenExpires = Date.now() + TIME_TO_LIVE_SEC * 1000;
        token.refreshToken = account.refresh_token;
        const { id, uid, email, emailVerified, firstName, lastName, displayName, photoURL, verifiedEmails, accounts } = user as User;
        token.user = { id, uid, email, emailVerified, firstName, lastName, displayName, photoURL, verifiedEmails, accounts };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = token.user as User;
        session.accessToken = token.accessToken as string;
      }

      return session;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
};

const { handlers, signIn, signOut, auth } = NextAuth(authOptions);

async function protectAuth() {
  const session = await auth();
  if (!session) {
    redirect(loginPage);
    return null;
  }
  return session;
}

export { handlers, signIn, signOut, auth, protectAuth };

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: User;
  }

  interface JWT {
    accessToken?: string | null;
    accessTokenExpires?: number;
    refreshToken?: string;
    user?: User;
  }
}

interface User {
  id: string;
  uid: string;
  email: string;
  emailVerified: null
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  verifiedEmails?: string[] | null;
  accounts?: Map<string, any> | null;
}