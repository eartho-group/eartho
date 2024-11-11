// app/.well-known/openid-configuration/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const openidConfig = {
    "issuer": "https://account.eartho.io",
    "authorization_endpoint": "https://account.eartho.io/api/oidc/auth",
    "device_authorization_endpoint": "https://account.eartho.io/api/oidc/device/code",
    "token_endpoint": "https://account.eartho.io/api/oidc/token",
    "userinfo_endpoint": "https://account.eartho.io/api/oidc/userinfo",
    "revocation_endpoint": "https://account.eartho.io/api/oidc/revoke",
    "jwks_uri": "https://account.eartho.io/api/oidc/certs",
    "response_types_supported": [
     "code",
     "token",
     "id_token",
     "code token",
     "code id_token",
     "token id_token",
     "code token id_token",
     "none"
    ],
    "subject_types_supported": [
     "public"
    ],
    "id_token_signing_alg_values_supported": [
     "RS256"
    ],
    "scopes_supported": [
     "openid",
     "email",
     "profile"
    ],
    "token_endpoint_auth_methods_supported": [
     "client_secret_post",
     "client_secret_basic"
    ],
    "claims_supported": [
     "aud",
     "email",
     "email_verified",
     "exp",
     "family_name",
     "given_name",
     "iat",
     "iss",
     "name",
     "picture",
     "sub"
    ],
    "code_challenge_methods_supported": [
     "plain",
     "S256"
    ],
    "grant_types_supported": [
     "authorization_code",
     "refresh_token",
     "urn:ietf:params:oauth:grant-type:device_code",
     "urn:ietf:params:oauth:grant-type:jwt-bearer"
    ]
   };

  return NextResponse.json(openidConfig);
}
