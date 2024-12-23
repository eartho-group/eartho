import { NextRequest, NextResponse } from 'next/server';
import { authUsersCollection, fdb } from '@/lib/googlecloud/db'; // Adjust based on your Firestore setup
import { auth } from '@/auth';

interface TwoStepVerificationMethod {
  id: string;
  type: 'authenticator' | 'phone' | 'email';
  enabled: boolean;
  verified: boolean;
  data: {
    secret?: string;
    phoneNumber?: string;
    email?: string;
    phoneCode?: string;
    emailCode?: string;
  };
}

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const userRef = authUsersCollection(fdb).doc(session.user.uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const userData = userDoc.data() as {
    twoStepVerification?: {
      methods: { [key: string]: TwoStepVerificationMethod }
    }
  };

  const methods = userData?.twoStepVerification?.methods || {};

  const isAuthenticatorEnabled = Object.values(methods).some(
    (method) => method.type === 'authenticator' && method.enabled
  );

  const phoneMethod = Object.values(methods).find(
    (method) => method.type === 'phone'
  );
  const isPhoneEnabled = phoneMethod?.enabled || false;
  const phoneMasked = isPhoneEnabled
    ? phoneMethod?.data.phoneNumber?.replace(/.(?=.{4})/g, '*') || null
    : null;

  const emailMethod = Object.values(methods).find(
    (method) => method.type === 'email'
  );
  const isEmailEnabled = emailMethod?.enabled || false;
  const emailMasked = isEmailEnabled
    ? emailMethod?.data.email?.replace(/.(?=.{4})/g, '*') || null
    : null;

  return NextResponse.json({
    isTwoStepEnabled: {
      authenticator: {
        enabled: isAuthenticatorEnabled
      },
      phone: { enabled: isPhoneEnabled, phoneMasked: phoneMasked },
      email: { enabled: isEmailEnabled, emailMasked: emailMasked },
    },
  });
}
