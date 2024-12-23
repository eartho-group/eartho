import NextAuth, { Account, JWT, NextAuthConfig, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import TwitterProvider from 'next-auth/providers/twitter';
import GitHubProvider from 'next-auth/providers/github';
import RedditProvider from 'next-auth/providers/reddit';
import YandexProvider from 'next-auth/providers/yandex';
import VKontakteProvider from 'next-auth/providers/vk';
import AppleProvider from 'next-auth/providers/apple';
import MicrosoftProvider from 'next-auth/providers/microsoft-entra-id';
import { fdb } from './lib/googlecloud/db';
import { FirestoreAdapter } from './lib/internal-auth/googledb-adapter/adapter';
import { redirect } from 'next/navigation';
import { getEarthoToken } from './lib/internal-auth/earthotoken/earthotoken';
import CryptoProvider from './lib/internal-auth/providers/crypto/nextauth-crypto-provider';
import EmailOtpProvider from './lib/internal-auth/providers/email/mailgun-otp';
import PhoneOtpProvider from './lib/internal-auth/providers/phone/phone-otp';

export const loginPage = '/auth/signin';
const TIME_TO_LIVE_SEC = 30 * 24 * 60 * 60; // 30 DAYS

export const firestoreAdapter = FirestoreAdapter(fdb);

const authOptions: NextAuthConfig = {
  pages: {
    signIn: loginPage,
    error: '/auth/signin/error',
  },
  secret: process.env.AUTH_SECRET,
  adapter: firestoreAdapter,
  session: {
    strategy: 'jwt',
    maxAge: TIME_TO_LIVE_SEC, // 30 days
  },
  cookies: {
    sessionToken: { name: `eartho.internal.account.session-token` },
    callbackUrl: { name: `eartho.internal.account.callback-url` },
    csrfToken: { name: `eartho.internal.account.csrf-token` },
    pkceCodeVerifier: { name: `eartho.internal.account.pkce-code-verifier` },
    state: { name: `eartho.internal.account.state` },
    nonce: { name: `eartho.internal.account.nonce` },
    webauthnChallenge: { name: `eartho.internal.account.webauthn-challenge` }
  },  
  callbacks: {
    async jwt({ token, user, account }) {

      // Initial sign in
      if (account && user) {
        const { id, uid, email, emailVerified, firstName, lastName, displayName, photoURL, verifiedEmails, accounts } = user as User;
        const newUser = { id, uid, email, emailVerified, firstName, lastName, displayName, photoURL, verifiedEmails, accounts } as User;

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
  providers: [
    PhoneOtpProvider,
    EmailOtpProvider,
    CryptoProvider,
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.AUTH_TWITTER_ID!,
      clientSecret: process.env.AUTH_TWITTER_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUBIO_ID!,
      clientSecret: process.env.AUTH_GITHUBIO_SECRET!,
    }),
    RedditProvider({
      clientId: process.env.AUTH_REDDITWORLD_ID!,
      clientSecret: process.env.AUTH_REDDITWORLD_SECRET!,
    }),
    YandexProvider({
      clientId: process.env.AUTH_YANDEX_ID!,
      clientSecret: process.env.AUTH_YANDEX_SECRET!,
    }),
    VKontakteProvider({
      clientId: process.env.AUTH_VKONTAKTE_ID!,
      clientSecret: process.env.AUTH_VKONTAKTE_SECRET!,
      checks: ["none"],
    }),
    AppleProvider({
      clientId: process.env.AUTH_APPLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_APPLE_TOKEN!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || null,
          email: profile.email || null,
          image: null,
        }
      },
    }),
    MicrosoftProvider({
      clientId: process.env.AUTH_MICROSOFT_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_SECRET!,
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

