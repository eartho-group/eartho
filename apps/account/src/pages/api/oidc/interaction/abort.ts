// src/pages/api/oidc/interaction/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createOidcProvider } from 'lib/oidc';
import { auth } from '@/auth';

const provider = createOidcProvider();

interface LoginRequestBody {
  accountId: string;
  interactionId: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { accountId, interactionId } = req.body as LoginRequestBody;
  const session = await auth(req, res);

  // Ensure the user is authenticated
  if (!session?.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Verify that the authenticated user's ID matches the accountId provided
  if (session.user.id !== accountId) {
    return res.status(403).json({ error: 'User ID does not match accountId' });
  }

  if (!accountId || !interactionId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const result = {
      error: 'access_denied',
      error_description: 'End-User aborted interaction',
    };
    const redirectUri = await provider.interactionResult(req, res, result, { mergeWithLastSubmission: false });
    
    res.status(200).json({ redirectUri });
  } catch (error) {
    console.error('Error completing login interaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
