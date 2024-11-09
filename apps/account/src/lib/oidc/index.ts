// lib/oidcProvider.ts
import { Provider } from 'oidc-provider';
import crypto from 'crypto';
import GoogleCloudAdapter from './google-cloud-adapter';

export function createOidcProvider() {
  const oidc = new Provider('http://localhost:3031', {

    adapter: GoogleCloudAdapter,
    clients: [],
    formats: {
      customizers: {
        jwt: (ctx, token, parts) => {
          if (token.kind === 'AccessToken') {
            return { ...parts, header: { ...parts.header, alg: 'RS256' } };
          }
          return parts;
        },
      },
    },
    routes: {
      authorization: '/api/oidc/auth',
      end_session: '/api/oidc/session/end'
    },

    interactions: {
      url: (ctx, interaction): string => {
        const params = new URLSearchParams();

        // Check if ctx.oidc.params exists and iterate over its entries
        if (ctx.oidc.params) {
          Object.entries(ctx.oidc.params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              // Append each array item individually, converting each to string
              value.forEach((v) => {
                if (v != null) params.append(key, String(v));
              });
            } else if (value != null) {
              // Append non-null, non-undefined single values as strings
              params.append(key, String(value));
            }
          });
        }

        // Add the interaction UID as a parameter
        params.set('interaction', interaction.uid);

        // Construct the final URL with all query parameters
        return `/connect/${interaction.prompt.name}?${params.toString()}`;
      },
    },
    features: {
      introspection: { enabled: true },
      revocation: { enabled: true },
      clientCredentials: { enabled: true },
      devInteractions: { enabled: false },
      backchannelLogout: { enabled: true }
    },
    clientDefaults: {
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
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
      keys: ['your-secure-cookie-key'],  // Use a secure key for signing cookies
    },
  });

  return oidc;
}


