// pages/api/oidc/[...slug].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createOidcProvider } from '@/lib/external-oidc';

const provider = createOidcProvider();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { slug } = req.query;

    // Set caching headers to disable caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

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
