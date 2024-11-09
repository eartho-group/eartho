// pages/api/oidc/[...slug].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createOidcProvider } from 'lib/oidc';
import { auth } from '@/auth';
import { serialize } from 'cookie';

const provider = createOidcProvider();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await auth(req, res);

    // Get interaction details from the provider (e.g., login or consent)
    const interaction = await provider.interactionDetails(req, res).catch(() => null);

    // If the session exists and the interaction is a login prompt, complete login interaction
    if (session && interaction && session?.user?.id && session?.user?.id != interaction?.result?.login?.accountId) {
      await provider.interactionFinished(req, res, {
        login: {
          accountId: session.user.id,
          remember: false,
          ts: Math.floor(Date.now() / 1000),
        },
      });
      return;
    }

    // Proceed with OIDC callback if no interaction or login completion needed
    await provider.callback()(req, res);
  } catch (error) {
    console.error(`[OIDC] Error handling request at path ${req.url}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Disable body parsing as oidc-provider expects raw body
export const config = {
  api: {
    bodyParser: false,
  },
};
