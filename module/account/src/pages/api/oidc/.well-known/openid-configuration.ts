import type { NextApiRequest, NextApiResponse } from 'next';
import { createOidcProvider } from '@/lib/external-oidc';

const provider = createOidcProvider();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {

    // Rewrite URL to point to the OpenID Connect configuration path
    req.url = '/.well-known/openid-configuration';

    // Pass the request and response to the OIDC provider
    await provider.callback()(req, res);

  } catch (error) {
    console.error(`[OIDC] Error handling .well-known request:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Disable body parsing as oidc-provider expects raw body
export const config = {
  api: {
    bodyParser: false,
  },
};
