import NextAuth, { Account, customFetch, JWT, NextAuthConfig, Session } from 'next-auth';

import { redirect } from 'next/navigation';
import { getEarthoToken } from './lib/auth/earthotoken';

const TIME_TO_LIVE_SEC = 30 * 24 * 60 * 60; // 30 DAYS

export const loginPage = '/auth';
export const homePage = '/';

const authOptions: NextAuthConfig = {
  pages: {
    signIn: loginPage,
    error: '/auth/error',
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: TIME_TO_LIVE_SEC, // 30 days
  },
  cookies: {
    sessionToken: { name: `eartho.internal.myaccount.session-token` },
    callbackUrl: { name: `eartho.internal.myaccount.callback-url` },
    csrfToken: { name: `eartho.internal.myaccount.csrf-token` },
    pkceCodeVerifier: { name: `eartho.internal.myaccount.pkce-code-verifier` },
    state: { name: `eartho.internal.myaccount.state` },
    nonce: { name: `eartho.internal.myaccount.nonce` },
    webauthnChallenge: { name: `eartho.internal.myaccount.webauthn-challenge` }
  },
  callbacks: {
    async jwt({ token, user, account }) {

      // Initial sign in
      if (account && user) {
        const { id, uid, email, firstName, lastName, displayName, photoURL, verifiedEmails } = user as User;
        const newUser = { id:uid, email, firstName, lastName, displayName, photoURL, verifiedEmails } as User;

        token.accessToken = await getEarthoToken(newUser, account, TIME_TO_LIVE_SEC);
        token.accessTokenExpires = Date.now() + TIME_TO_LIVE_SEC * 1000;
        token.refreshToken = account.refresh_token;
        token.user = newUser;
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
  // logger: {
  //   error(code, ...message) {
  //     console.error(code, message)
  //   },
  //   warn(code, ...message) {
  //     console.warn(code, message)
  //   },
  //   debug(code, ...message) {
  //     console.debug(code, message)
  //   },
  // },
  providers: [
    {
      id: "eartho",
      name: "Eartho",
      type: "oidc",
      issuer: "https://account.eartho.io",
      clientId: process.env.EARTHO_ACCOUNT_CLIENT_ID,
      clientSecret: process.env.EARTHO_ACCOUNT_CLIENT_SECRET,

      wellKnown: "https://account.eartho.io/.well-known/openid-configuration",

      authorization: {
        url: "https://account.eartho.io/api/oidc/auth",
        params: {
          scope: "openid email profile",
        },
      },
      token: "https://account.eartho.io/api/oidc/token",
      userinfo: "https://account.eartho.io/api/oidc/userinfo",

      idToken: false,
      checks: ["pkce"],

      profile: (profile: any) => {
        return {
          uid: profile.id,
          ...profile
        }
      }
    }
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
