// src/pages/api/oidc/interaction/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createOidcProvider } from '@/lib/external-oidc';
import { auth } from '@/auth';

const provider = createOidcProvider();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
    // Retrieve interaction details to confirm the interaction ID
    const interactionDetails = await provider.interactionDetails(req, res);
    const { prompt: { name } } = interactionDetails;

    // Confirm that this interaction is a login prompt
    if (name !== 'login') {
      return res.status(400).json({ error: 'Interaction is not a login prompt' });
    }

    // Define the result for an aborted login interaction
    const result = {
      error: 'access_denied',
      error_description: 'End-User aborted interaction',
    };

    // Complete the interaction with an abort result
    const redirectUri = await provider.interactionResult(req, res, result, {
      mergeWithLastSubmission: true,
    });

    res.status(200).json({ redirectUri });
  } catch (error) {
    console.error('Error completing login interaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
