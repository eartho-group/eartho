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
    const interactionDetails = await provider.Interaction.find(interactionId);
    if (!interactionDetails) {
      throw new Error('interaction session not found');
    }

    if (interactionDetails.session?.uid) {
      const session = await provider.Session.findByUid(interactionDetails.session.uid);
      if (!session) {
        throw new Error('session not found');
      }
      if (interactionDetails.session.accountId !== session.accountId) {
        throw new Error('session principal changed');
      }
    }
    const { prompt: { name, details }, params, session: interactionSession } = interactionDetails;

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

    if (!grant.getOIDCScope().includes(params.scope as string)) {
      grant.addOIDCScope(params.scope as string);
    }

    // Save the grant and complete the interaction
    const grantId = await grant.save();
    const result = {
      login: {
        accountId: session.user.id,
      }, 
      consent: { grantId }
    };

    interactionDetails.result = result;

    await interactionDetails.save(interactionDetails.exp - epochTime());

    const redirectUri = interactionDetails.returnTo;

    res.status(200).json({ redirectUri });
  } catch (error) {
    console.error('Error completing interaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
function epochTime(date = Date.now()) {
  return  Math.floor(date / 1000);
}

