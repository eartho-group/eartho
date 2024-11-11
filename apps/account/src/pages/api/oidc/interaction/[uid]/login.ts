// src/pages/api/oidc/interaction/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createOidcProvider } from '@/lib/external-oidc';
import { auth } from '@/auth';

const provider = createOidcProvider();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  // Extract interactionId from the query parameters
  const { uid: interactionId } = req.query;
  if (typeof interactionId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing interaction ID' });
  }

  const session = await auth(req, res);

  // Ensure the user is authenticated
  if (!session?.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    // Retrieve interaction details to verify the interactionId and get additional context
    const interactionDetails = await provider.interactionDetails(req, res);
    const { prompt: { name } } = interactionDetails;

    // Confirm that this interaction is a login prompt
    if (name !== 'login') {
      return res.status(400).json({ error: 'Interaction is not a login prompt' });
    }

    // Complete the login interaction with the account ID from the session
    const result = {
      login: {
        accountId: session.user.id,
      },
    };

    const redirectUri = await provider.interactionResult(req, res, result, {
      mergeWithLastSubmission: false,
    });
    
    res.status(200).json({ redirectUri });
  } catch (error) {
    console.error('Error completing login interaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
