// pages/api/oidc/[...slug].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createOidcProvider } from '@/lib/external-oidc';

const provider = createOidcProvider();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
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
