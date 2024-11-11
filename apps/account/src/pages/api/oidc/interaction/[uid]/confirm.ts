// src/pages/api/oidc/interaction/consent.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createOidcProvider } from '@/lib/external-oidc';
import { auth } from '@/auth';
import assert from 'assert';

const provider = createOidcProvider();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Extract interactionId from the URL query
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
    // Retrieve the interaction details
    const interactionDetails = await provider.interactionDetails(req, res);
    const { prompt: { name, details }, params, session: interactionSession } = interactionDetails;

    assert.equal(name, 'consent');

    // Create or modify an existing grant
    let grant;
    if (interactionDetails.grantId) {
      grant = await provider.Grant.find(interactionDetails.grantId);
      if (!grant) throw new Error('Grant not found');
    } else {
      grant = new provider.Grant({
        accountId: session.user.id,
        clientId: params.client_id as string,
      });
    }

    // Add scopes and claims to the grant as required by the consent interaction
    if (Array.isArray(details.missingOIDCScope)) {
      grant.addOIDCScope(details.missingOIDCScope.join(' '));
    }
    if (Array.isArray(details.missingOIDCClaims)) {
      grant.addOIDCClaims(details.missingOIDCClaims);
    }
    if (details.missingResourceScopes && typeof details.missingResourceScopes === 'object') {
      for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
        if (Array.isArray(scopes)) {
          grant.addResourceScope(indicator, scopes.join(' '));
        }
      }
    }

    // Save the grant and complete the interaction
    const grantId = await grant.save();
    const result = { consent: { grantId } };
    const redirectUri = await provider.interactionResult(req, res, result, {
      mergeWithLastSubmission: true,
    });

    res.status(200).json({ redirectUri });
  } catch (error) {
    console.error('Error completing interaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
