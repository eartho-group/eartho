// src/pages/api/oidc/interaction/consent.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createOidcProvider } from 'lib/oidc';
import { auth } from '@/auth';

const provider = createOidcProvider();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { accountId, clientId, interactionId, scope } = req.body;
  const session = await auth(req, res);

  // Ensure the user is authenticated
  if (!session?.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Verify that the authenticated user's ID matches the accountId provided
  if (session.user.id !== accountId) {
    return res.status(403).json({ error: 'User ID does not match accountId' });
  }

  if (!accountId || !clientId || !interactionId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // 1. Retrieve the interaction details
    const interaction = await provider.interactionDetails(req, res);

    // 2. Create a new Grant for the specified client and account
    const grant = new provider.Grant({
      accountId,
      clientId,
    });

    // 3. Add scopes to the grant (scopes are permissions, e.g., openid, profile, email)
    scope.forEach((scope: string) => {
      grant.addOIDCScope(scope);
    });

    // 4. Persist the grant and get the grantId
    const grantId = await grant.save();

    // 5. Complete the interaction, specifying the grantId
    const result = {
      login: { accountId, remember: false },
      consent: {
        grantId,
      },
    };
    const redirectUri = await provider.interactionResult(req, res, result, {
      mergeWithLastSubmission: true,
    });

    res.status(200).json({ redirectUri });
  } catch (error) {
    console.error('Error completing interaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
