// lib/oidcProvider.ts
import { Provider } from 'oidc-provider';
import GoogleCloudAdapter from './google-cloud-adapter';
import subscribe from './events-listeners.js'

const baseURL = process.env.APP_URL

export function createOidcProvider() {
  const oidc = new Provider('https://account.eartho.io', {
    adapter: GoogleCloudAdapter,
    clients: [],
    formats: {
      customizers: {
        jwt: (ctx, token, parts) => {
          if (token.kind === 'AccessToken') {
            return { ...parts, header: { ...parts.header, alg: 'RS256' }, payload: { ...parts.payload } };
          }
          return parts;
        },
      },
    },
    routes: {
      authorization: '/api/oidc/auth',
      token: '/api/oidc/token',
      introspection: '/api/oidc/token/introspection',
      revocation: '/api/oidc/token/revoke',
      backchannel_authentication: '/api/oidc/backchannel',
      userinfo: '/api/oidc/userinfo',
      jwks: '/api/oidc/certs',
      end_session: '/api/oidc/session/end',
      device_authorization: '/api/oidc/device/code',
    },
    clientDefaults: {
      grant_types: [
        'authorization_code',
        'refresh_token',
        'client_credentials',
        'urn:ietf:params:oauth:grant-type:device_code',
        'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'implicit'
      ],
      response_types: ['code', 'id_token'],
    },
    clientBasedCORS(ctx, origin, client) {
      return true;
    },
    features: {
      devInteractions: { enabled: false },


      deviceFlow: { enabled: true }, 
      revocation: { enabled: true },
      introspection: { enabled: true },
      webMessageResponseMode: { enabled: true },
      claimsParameter: { enabled: true }
    },
    rotateRefreshToken: true,
    claims: {
      address: ['address'],
      email: ['email', 'verifiedEmails'],
      phone: ['phone', 'verifiedPhone'],
      profile: ['id', 'birthdate', 'firstName', 'gender', 'lastName', 'locale', 'displayName', 'photoURL'],
    },
    interactions: {
      url: (ctx, interaction): string => {
        const params = new URLSearchParams();

        const clientId = ctx.oidc.params?.client_id;
        if (typeof clientId === 'string') {
          params.set('client_id', clientId);
        }

        // Add the interaction UID as a parameter
        params.set('interaction', interaction.uid);

        // Construct the final URL with all query parameters
        return `/connect/${interaction.prompt.name}?${params.toString()}`;
      },
    },

    findAccount: async (ctx, id) => {
      // This should be replaced with actual account retrieval logic
      return {
        accountId: id,
        async claims(use, scope) {
          return { sub: id, name: 'Example User', email: 'user@example.com' };
        },
      };
    },
    cookies: {
      long: { signed: true, secure: false, path: '/', sameSite: 'lax' },
      short: { signed: true, secure: false, path: '/', sameSite: 'lax' },
      keys: [process.env.COOKIE_SECRET!],
    },
    jwks: {
      keys: [
        {
          kty: 'RSA',
          kid: process.env.JWKS_KID, // Load from environment
          alg: 'RS256',
          use: 'sig',
          e: 'AQAB',
          n: process.env.JWKS_PUBLIC_KEY, // Load public key modulus from environment
          d: process.env.JWKS_PRIVATE_KEY_D, // Private key component
          p: process.env.JWKS_PRIVATE_KEY_P, // Prime factor p
          q: process.env.JWKS_PRIVATE_KEY_Q, // Prime factor q
          dp: process.env.JWKS_PRIVATE_KEY_DP,
          dq: process.env.JWKS_PRIVATE_KEY_DQ,
          qi: process.env.JWKS_PRIVATE_KEY_QI,
        },
      ],
    },
  });

  subscribe(oidc);

  const { invalidate: orig } = oidc.Client.Schema.prototype;

  oidc.Client.Schema.prototype.invalidate = function invalidate(message, code) {
    if (code === 'implicit-force-https' || code === 'implicit-forbid-localhost') {
      return;
    }

    orig.call(this, message);
  };


  return oidc;
}


